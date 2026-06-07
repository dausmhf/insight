const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 4177);
const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, 'dist');
const DATA_DIR = path.join(ROOT, 'data');
const STORE_PATH = path.join(DATA_DIR, 'instagram-store.json');

loadEnvFile(path.join(ROOT, '.env.production'));

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v24.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const IG_GRAPH_BASE = 'https://graph.instagram.com';
const APP_ID = process.env.META_APP_ID || '';
const APP_SECRET = process.env.META_APP_SECRET || '';
const IG_APP_ID = process.env.IG_APP_ID || APP_ID;
const IG_APP_SECRET = process.env.IG_APP_SECRET || APP_SECRET;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
const REDIRECT_URI = process.env.META_REDIRECT_URI || `${PUBLIC_BASE_URL}/api/meta/callback`;
const AUTH_MODE = process.env.META_AUTH_MODE || 'facebook';
const META_SCOPES = process.env.META_SCOPES || 'pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights';
const TOKEN_KEY_SOURCE = process.env.TOKEN_ENCRYPTION_KEY || APP_SECRET || 'local-development-key-change-me';

const oauthStates = new Map();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const index = trimmed.indexOf('=');
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadStore() {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { connections: [], updatedAt: null };
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return { connections: [], updatedAt: null };
  }
}

function saveStore(store) {
  ensureDataDir();
  store.updatedAt = new Date().toISOString();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function encryptionKey() {
  return crypto.createHash('sha256').update(TOKEN_KEY_SOURCE).digest();
}

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
}

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function html(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
}

async function graphGet(pathname, params = {}) {
  const url = new URL(`${GRAPH_BASE}${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Graph API error ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function instagramGraphGet(pathname, params = {}) {
  const url = new URL(`${IG_GRAPH_BASE}${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Instagram API error ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function instagramPost(pathname, body) {
  const response = await fetch(`${IG_GRAPH_BASE}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error_message || data?.error?.message || `Instagram API error ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function exchangeCodeForToken(code) {
  const shortToken = await graphGet('/oauth/access_token', {
    client_id: APP_ID,
    client_secret: APP_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  });

  try {
    const longToken = await graphGet('/oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: APP_ID,
      client_secret: APP_SECRET,
      fb_exchange_token: shortToken.access_token,
    });
    return longToken.access_token || shortToken.access_token;
  } catch {
    return shortToken.access_token;
  }
}

async function exchangeInstagramCodeForToken(code) {
  const shortToken = await instagramPost('/oauth/access_token', {
    client_id: IG_APP_ID,
    client_secret: IG_APP_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
    code,
  });

  try {
    const longToken = await instagramGraphGet('/access_token', {
      grant_type: 'ig_exchange_token',
      client_secret: IG_APP_SECRET,
      access_token: shortToken.access_token,
    });
    return longToken.access_token || shortToken.access_token;
  } catch {
    return shortToken.access_token;
  }
}

async function fetchMediaInsights(mediaId, accessToken) {
  try {
    const response = await instagramGraphGet(`/${mediaId}/insights`, {
      metric: 'views,reach,saved,shares,total_interactions',
      access_token: accessToken,
    });
    return Object.fromEntries((response.data || []).map((item) => [item.name, item.values?.[0]?.value ?? 0]));
  } catch {
    return {};
  }
}

async function fetchInstagramLoginData(accessToken) {
  const me = await instagramGraphGet('/me', {
    fields: 'user_id,username,name,account_type,media_count,followers_count,profile_picture_url',
    access_token: accessToken,
  });

  const account = {
    id: String(me.user_id || me.id),
    pageId: null,
    pageName: 'Instagram Login',
    username: me.username ? `@${String(me.username).replace(/^@/, '')}` : `IG ${me.user_id || me.id}`,
    accountName: me.name || me.username || `Instagram ${me.user_id || me.id}`,
    profilePictureUrl: me.profile_picture_url || null,
    followers: Number(me.followers_count || 0),
    mediaCount: Number(me.media_count || 0),
    status: 'Connected',
    lastSync: new Date().toISOString(),
    pageAccessTokenEncrypted: encrypt(accessToken),
  };

  const mediaPosts = [];
  try {
    const media = await instagramGraphGet('/me/media', {
      fields: 'id,caption,media_type,media_product_type,permalink,thumbnail_url,timestamp,like_count,comments_count',
      limit: 25,
      access_token: accessToken,
    });

    for (const item of media.data || []) {
      const insights = await fetchMediaInsights(item.id, accessToken);
      mediaPosts.push({
        id: item.id,
        accountId: account.id,
        account: account.username,
        title: item.caption ? item.caption.slice(0, 90) : `${item.media_product_type || item.media_type} post`,
        caption: item.caption || '',
        date: item.timestamp || null,
        type: item.media_product_type || item.media_type || 'Media',
        permalink: item.permalink || null,
        thumbnailUrl: item.thumbnail_url || null,
        views: Number(insights.views || 0),
        reach: Number(insights.reach || 0),
        saves: Number(insights.saved || 0),
        shares: Number(insights.shares || 0),
        interactions: Number(insights.total_interactions || 0),
        likes: Number(item.like_count || 0),
        comments: Number(item.comments_count || 0),
      });
    }
  } catch (error) {
    account.mediaError = error.message;
  }

  return { pages: [], igAccounts: [account], mediaPosts };
}

async function fetchInstagramData(userAccessToken) {
  const pages = await graphGet('/me/accounts', {
    fields: 'id,name,access_token,instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}',
    access_token: userAccessToken,
  });

  const igAccounts = [];
  const mediaPosts = [];

  for (const page of pages.data || []) {
    const ig = page.instagram_business_account;
    if (!ig?.id) continue;

    const account = {
      id: ig.id,
      pageId: page.id,
      pageName: page.name,
      username: ig.username ? `@${ig.username.replace(/^@/, '')}` : `IG ${ig.id}`,
      accountName: ig.name || ig.username || page.name,
      profilePictureUrl: ig.profile_picture_url || null,
      followers: Number(ig.followers_count || 0),
      mediaCount: Number(ig.media_count || 0),
      status: 'Connected',
      lastSync: new Date().toISOString(),
      pageAccessTokenEncrypted: encrypt(page.access_token),
    };
    igAccounts.push(account);

    try {
      const media = await graphGet(`/${ig.id}/media`, {
        fields: 'id,caption,media_type,media_product_type,permalink,thumbnail_url,timestamp,like_count,comments_count',
        limit: 25,
        access_token: page.access_token,
      });

      for (const item of media.data || []) {
        const insights = await fetchMediaInsights(item.id, page.access_token);
        mediaPosts.push({
          id: item.id,
          accountId: ig.id,
          account: account.username,
          title: item.caption ? item.caption.slice(0, 90) : `${item.media_product_type || item.media_type} post`,
          caption: item.caption || '',
          date: item.timestamp || null,
          type: item.media_product_type || item.media_type || 'Media',
          permalink: item.permalink || null,
          thumbnailUrl: item.thumbnail_url || null,
          views: Number(insights.views || 0),
          reach: Number(insights.reach || 0),
          saves: Number(insights.saved || 0),
          shares: Number(insights.shares || 0),
          interactions: Number(insights.total_interactions || 0),
          likes: Number(item.like_count || 0),
          comments: Number(item.comments_count || 0),
        });
      }
    } catch (error) {
      account.mediaError = error.message;
    }
  }

  return { pages: pages.data || [], igAccounts, mediaPosts };
}

function dashboardPayload() {
  const store = loadStore();
  const igAccounts = store.connections.flatMap((connection) => connection.igAccounts || []);
  const mediaPosts = store.connections.flatMap((connection) => connection.mediaPosts || []);

  return {
    connected: igAccounts.length > 0,
    updatedAt: store.updatedAt,
    clients: igAccounts.length
      ? [{ id: 'connected', name: 'Connected Instagram Accounts', company: 'Meta OAuth', status: 'Active', plan: 'Live Data' }]
      : [],
    socialAccounts: igAccounts.map((account) => ({
        id: account.id,
        clientId: 'connected',
        username: account.username,
        accountName: account.accountName,
        type: 'Instagram Professional',
        followers: account.followers,
        growth: 0,
        growthRate: 0,
        views: mediaPosts.filter((post) => post.accountId === account.id).reduce((sum, post) => sum + post.views, 0),
        reach: mediaPosts.filter((post) => post.accountId === account.id).reduce((sum, post) => sum + post.reach, 0),
        reels: mediaPosts.filter((post) => post.accountId === account.id && String(post.type).toLowerCase().includes('reel')).length,
        status: account.status,
        lastSync: account.lastSync,
        mediaError: account.mediaError || null,
      })),
    assignments: igAccounts.length
      ? [{ clientId: 'connected', accountIds: igAccounts.map((account) => account.id), defaultPeriod: '30d', pdf: true, pin: false, token: 'live_meta_connection' }]
      : [],
    posts: mediaPosts.map((post, index) => ({
      id: post.id,
      account: post.account,
      title: post.title,
      date: post.date,
      type: post.type,
      views: post.views,
      viewsRate: 0,
      reach: post.reach,
      likes: post.likes,
      saves: post.saves,
      shares: post.shares,
      er: post.reach ? Number(((post.interactions / post.reach) * 100).toFixed(2)) : 0,
      pillar: 'Live',
      status: index < 3 ? 'repeat' : 'improve',
      permalink: post.permalink,
    })),
  };
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(DIST_DIR, safePath));
  if (!filePath.startsWith(DIST_DIR)) return json(res, 403, { error: 'Forbidden' });

  const finalPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(DIST_DIR, 'index.html');

  const ext = path.extname(finalPath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(finalPath).pipe(res);
}

async function handle(req, res) {
  const url = new URL(req.url, PUBLIC_BASE_URL);

  try {
    if (url.pathname === '/api/health') {
      return json(res, 200, { ok: true, app: 'ruank-insight', time: new Date().toISOString() });
    }

    if (url.pathname === '/api/dashboard') {
      return json(res, 200, dashboardPayload());
    }

    if (url.pathname === '/api/meta/connect') {
      if (!APP_ID || !APP_SECRET) {
        return json(res, 500, { error: 'META_APP_ID and META_APP_SECRET are not configured' });
      }
      if (AUTH_MODE === 'instagram' && (!IG_APP_ID || !IG_APP_SECRET)) {
        return json(res, 500, { error: 'IG_APP_ID and IG_APP_SECRET are not configured' });
      }
      const state = crypto.randomBytes(24).toString('hex');
      oauthStates.set(state, Date.now());
      const oauthUrl = AUTH_MODE === 'facebook'
        ? new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`)
        : new URL('https://www.instagram.com/oauth/authorize');
      oauthUrl.searchParams.set('client_id', AUTH_MODE === 'facebook' ? APP_ID : IG_APP_ID);
      oauthUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      oauthUrl.searchParams.set('state', state);
      oauthUrl.searchParams.set('scope', META_SCOPES);
      oauthUrl.searchParams.set('response_type', 'code');
      if (AUTH_MODE === 'instagram') {
        oauthUrl.searchParams.set('enable_fb_login', '0');
        oauthUrl.searchParams.set('force_authentication', '1');
      }
      res.writeHead(302, { Location: oauthUrl.toString() });
      return res.end();
    }

    if (url.pathname === '/api/meta/callback') {
      const state = url.searchParams.get('state');
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error_message') || url.searchParams.get('error');
      const stateCreatedAt = oauthStates.get(state);
      oauthStates.delete(state);

      if (error) return html(res, 400, `<h1>Meta OAuth gagal</h1><p>${escapeHtml(error)}</p>`);
      if (!state || !stateCreatedAt || Date.now() - stateCreatedAt > 10 * 60 * 1000) {
        return html(res, 400, '<h1>Meta OAuth state tidak valid</h1>');
      }
      if (!code) return html(res, 400, '<h1>Meta OAuth code kosong</h1>');

      const userAccessToken = AUTH_MODE === 'facebook'
        ? await exchangeCodeForToken(code)
        : await exchangeInstagramCodeForToken(code);
      const live = AUTH_MODE === 'facebook'
        ? await fetchInstagramData(userAccessToken)
        : await fetchInstagramLoginData(userAccessToken);
      const store = loadStore();
      store.connections = [{
        id: crypto.randomUUID(),
        connectedAt: new Date().toISOString(),
        userAccessTokenEncrypted: encrypt(userAccessToken),
        igAccounts: live.igAccounts,
        mediaPosts: live.mediaPosts,
      }];
      saveStore(store);
      res.writeHead(302, { Location: '/?connected=1' });
      return res.end();
    }

    return serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || 'Server error' });
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

http.createServer(handle).listen(PORT, '127.0.0.1', () => {
  console.log(`Ruank Insight server listening on http://127.0.0.1:${PORT}`);
});
