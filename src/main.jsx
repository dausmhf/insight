import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  Gauge,
  Instagram,
  KeyRound,
  LayoutDashboard,
  Link2,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import './styles.css';

const emptyDashboard = {
  connected: false,
  updatedAt: null,
  clients: [],
  socialAccounts: [],
  assignments: [],
  posts: [],
};

const format = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0));

function App() {
  const [view, setView] = useState('dashboard');
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((response) => {
        if (!response.ok) throw new Error('Dashboard API gagal dimuat');
        return response.json();
      })
      .then((payload) => setData({ ...emptyDashboard, ...payload }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedClient = data.clients[0] || null;
  const assignment = data.assignments[0] || null;
  const allowedAccounts = assignment
    ? data.socialAccounts.filter((account) => assignment.accountIds.includes(account.id))
    : data.socialAccounts;

  const totals = useMemo(() => {
    const followers = data.socialAccounts.reduce((sum, item) => sum + Number(item.followers || 0), 0);
    const growth = data.socialAccounts.reduce((sum, item) => sum + Number(item.growth || 0), 0);
    const views = data.socialAccounts.reduce((sum, item) => sum + Number(item.views || 0), 0);
    const reach = data.socialAccounts.reduce((sum, item) => sum + Number(item.reach || 0), 0);
    return { followers, growth, views, reach };
  }, [data.socialAccounts]);

  return (
    <main className="app-shell">
      <Sidebar view={view} setView={setView} />
      <section className="workspace">
        <Topbar view={view} period={period} setPeriod={setPeriod} updatedAt={data.updatedAt} />
        {error ? <Notice type="error" title="API error" body={error} /> : null}
        {loading ? <Notice title="Memuat dashboard" body="Mengambil data live dari backend Ruank Insight." /> : null}
        {view === 'dashboard' && <DashboardHome data={data} totals={totals} />}
        {view === 'clients' && <ClientsView clients={data.clients} accounts={data.socialAccounts} />}
        {view === 'social' && <SocialMediaView accounts={data.socialAccounts} />}
        {view === 'settings' && <SettingsView client={selectedClient} assignment={assignment} accounts={data.socialAccounts} />}
        {view === 'client' && <ClientView client={selectedClient} accounts={allowedAccounts} posts={data.posts} period={period} />}
      </section>
    </main>
  );
}

function Sidebar({ view, setView }) {
  const nav = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['clients', Users, 'Client List'],
    ['social', Instagram, 'Social Media List'],
    ['settings', Settings, 'Settings Access'],
    ['client', Link2, 'Client Share View'],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">RI</div>
        <div>
          <strong>Ruank Insight</strong>
          <span>Live Meta dashboard</span>
        </div>
      </div>
      <nav className="nav-list" aria-label="Admin navigation">
        {nav.map(([key, Icon, label]) => (
          <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
      <div className="security-panel">
        <Lock size={18} />
        <strong>Meta OAuth aktif</strong>
        <span>Token disimpan terenkripsi di backend dan tidak pernah tampil di frontend.</span>
      </div>
    </aside>
  );
}

function Topbar({ view, period, setPeriod, updatedAt }) {
  const titles = {
    dashboard: ['Operating Dashboard', 'Overview akun IG live dari Meta API'],
    clients: ['Client List', 'Client yang punya akses ke akun IG'],
    social: ['Social Media List', 'Akun Instagram yang sudah terhubung'],
    settings: ['Settings Access', 'Mapping client ke akun IG'],
    client: ['Client Share View', 'Preview dashboard yang dilihat client'],
  };

  return (
    <header className="topbar">
      <label className="searchbox">
        <Search size={18} />
        <input placeholder="Cari akun IG, konten, metric..." />
      </label>
      <div className="top-title">
        <p className="eyebrow">{titles[view][0]}</p>
        <h1>{titles[view][1]}</h1>
        {updatedAt ? <small className="sync-label">Last sync: {new Date(updatedAt).toLocaleString('id-ID')}</small> : null}
      </div>
      <div className="top-actions">
        <a className="primary-link" href="/api/meta/connect"><Plus size={18} /> Connect IG</a>
        <button className="icon-btn" title="Notification"><Bell size={18} /></button>
        <button className="icon-btn" title="Refresh" onClick={() => window.location.reload()}><RefreshCw size={18} /></button>
        <div className="select-wrap">
          <CalendarDays size={17} />
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="7d">7 hari</option>
            <option value="30d">30 hari</option>
            <option value="90d">90 hari</option>
            <option value="180d">180 hari</option>
            <option value="365d">1 tahun</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

function Notice({ title, body, type = 'info' }) {
  return (
    <section className={`notice ${type}`}>
      <strong>{title}</strong>
      <span>{body}</span>
    </section>
  );
}

function DashboardHome({ data, totals }) {
  return (
    <div className="dashboard-page">
      {!data.connected ? <ConnectEmptyState /> : null}
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Ruank Insight Dashboard</p>
          <h2>Dashboard Instagram live untuk operator dan strategist.</h2>
          <span>Data diambil lewat Meta OAuth, lalu dashboard membaca snapshot yang tersimpan di backend.</span>
        </div>
        <div className="hero-actions">
          <a className="hero-button" href="/api/meta/connect"><Plus size={18} /> Connect IG</a>
          <button className="ghost"><Download size={18} /> Export Report</button>
        </div>
      </section>

      <div className="metric-grid">
        <Metric title="Total Followers" value={format(totals.followers)} detail={`+${format(totals.growth)} follower`} rate="live" icon={<TrendingUp />} featured />
        <Metric title="Views" value={format(totals.views)} detail="Dari media insights" rate="live" icon={<Activity />} />
        <Metric title="Reach" value={format(totals.reach)} detail="Audience unik" rate="live" icon={<Eye />} />
        <Metric title="Connected IG" value={format(data.socialAccounts.length)} detail="Akun profesional" rate="OAuth" icon={<Instagram />} />
      </div>

      <section className="dashboard-grid">
        <div className="panel wide">
          <PanelHeader icon={<BarChart3 size={18} />} title="Penambahan Follower & Views" action="Sync Manual" />
          <BarTrend accounts={data.socialAccounts} />
        </div>
        <div className="panel">
          <PanelHeader icon={<Gauge size={18} />} title="Connection Health" />
          <HealthGauge connected={data.connected} />
        </div>
        <div className="panel">
          <PanelHeader icon={<Users size={18} />} title="Connected Accounts" />
          <AccountMiniList accounts={data.socialAccounts} />
        </div>
        <div className="panel wide">
          <PanelHeader icon={<FileText size={18} />} title="Top Content" action="Export PDF" />
          <PostTable posts={data.posts} />
        </div>
      </section>
    </div>
  );
}

function ConnectEmptyState() {
  return (
    <section className="empty-state">
      <Instagram size={22} />
      <div>
        <strong>Belum ada akun Instagram terhubung.</strong>
        <span>Klik Connect IG, login ke Meta, pilih Page yang terhubung ke Instagram Professional, lalu dashboard akan terisi data live.</span>
      </div>
      <a href="/api/meta/connect">Connect IG sekarang</a>
    </section>
  );
}

function ClientsView({ clients, accounts }) {
  return (
    <div className="dashboard-page">
      <section className="panel">
        <PanelHeader icon={<Users size={18} />} title="Client List" action="Tambah Client" />
        {clients.length ? (
          <div className="client-card-grid">
            {clients.map((client) => (
              <article className="client-card selected" key={client.id}>
                <span className="avatar" style={{ '--avatar': '#6857f5' }}>{client.name.slice(0, 2)}</span>
                <strong>{client.name}</strong>
                <small>{client.company}</small>
                <div>
                  <span className="pill active">{client.status}</span>
                  <span>{accounts.length} akun IG tersambung</span>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyRows text="Belum ada client live. Hubungkan IG dulu untuk membuat client otomatis." />}
      </section>
    </div>
  );
}

function SocialMediaView({ accounts }) {
  return (
    <div className="dashboard-page">
      <section className="panel">
        <PanelHeader icon={<Instagram size={18} />} title="Social Media List" action="Connect Instagram" />
        {accounts.length ? (
          <div className="account-list">
            {accounts.map((account) => (
              <article className="account-row" key={account.id}>
                <span className="ig-badge"><Instagram size={19} /></span>
                <div>
                  <strong>{account.username}</strong>
                  <small>{account.accountName} - {account.type}</small>
                </div>
                <div><span>Client</span><strong>Live Meta</strong></div>
                <div><span>Followers</span><strong>{format(account.followers)}</strong><small>+{format(account.growth)} ({account.growthRate || 0}%)</small></div>
                <div><span>Views</span><strong>{format(account.views)}</strong></div>
                <div><span>Reels</span><strong>{format(account.reels)}</strong></div>
                <span className={`pill ${String(account.status).toLowerCase()}`}>{account.status}</span>
              </article>
            ))}
          </div>
        ) : <EmptyRows text="Belum ada akun IG. Klik Connect Instagram untuk mulai OAuth." />}
      </section>
    </div>
  );
}

function SettingsView({ client, assignment, accounts }) {
  const selectedIds = assignment?.accountIds || [];
  return (
    <div className="settings-layout">
      <section className="panel">
        <PanelHeader icon={<Users size={18} />} title="Client" />
        {client ? (
          <div className="setting-client active">
            <span className="avatar" style={{ '--avatar': '#6857f5' }}>{client.name.slice(0, 2)}</span>
            <span><strong>{client.name}</strong><small>{client.plan}</small></span>
          </div>
        ) : <EmptyRows text="Belum ada client." />}
      </section>

      <section className="panel">
        <PanelHeader icon={<ShieldCheck size={18} />} title="Set akses IG untuk client" action="Simpan Setting" />
        <div className="assignment-box">
          <div className="assignment-client">
            <span className="avatar large" style={{ '--avatar': '#6857f5' }}>{client ? client.name.slice(0, 2) : 'RI'}</span>
            <div>
              <strong>{client?.name || 'Belum ada client'}</strong>
              <small>Client hanya bisa melihat akun yang dicentang.</small>
            </div>
          </div>
          <div className="access-arrow">akses</div>
          <div className="assignment-accounts">
            {accounts.length ? accounts.map((account) => {
              const checked = selectedIds.includes(account.id);
              return (
                <label key={account.id} className={checked ? 'access-card checked' : 'access-card'}>
                  <input type="checkbox" checked={checked} readOnly />
                  <Instagram size={18} />
                  <span><strong>{account.username}</strong><small>{account.accountName}</small></span>
                </label>
              );
            }) : <EmptyRows text="Belum ada akun IG untuk di-set." />}
          </div>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={<KeyRound size={18} />} title="Share Link Setting" />
        <div className="share-card light">
          <code>{assignment ? `https://insight.dausmhf.com/share/${assignment.token}` : 'Share link dibuat setelah akun terhubung.'}</code>
          <div className="share-settings">
            <span><CheckCircle2 size={15} /> {selectedIds.length} akun terlihat</span>
            <span><FileText size={15} /> PDF aktif</span>
            <span><Lock size={15} /> token aman</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ClientView({ client, accounts, posts, period }) {
  const followers = accounts.reduce((sum, account) => sum + Number(account.followers || 0), 0);
  const views = accounts.reduce((sum, account) => sum + Number(account.views || 0), 0);
  const reach = accounts.reduce((sum, account) => sum + Number(account.reach || 0), 0);

  return (
    <div className="dashboard-page">
      <section className="client-hero">
        <div>
          <p className="eyebrow">Private report link</p>
          <h2>{client?.name || 'Client Report'}</h2>
          <span>{period.replace('d', '')} hari performa dari {accounts.length} akun yang diizinkan.</span>
        </div>
        <div className="hero-actions">
          <button><Download size={17} /> PDF</button>
          <button className="ghost"><Filter size={17} /> Filter</button>
        </div>
      </section>

      <div className="metric-grid">
        <Metric title="Followers" value={format(followers)} detail="Total akun terlihat" rate="live" icon={<TrendingUp />} featured />
        <Metric title="Total Views" value={format(views)} detail="Views periode ini" rate="live" icon={<Activity />} />
        <Metric title="Total Reach" value={format(reach)} detail="Audience unik" rate="live" icon={<Eye />} />
        <Metric title="Akun Terlihat" value={format(accounts.length)} detail="Permission scope" rate="secure" icon={<MessageCircle />} />
      </div>

      <section className="dashboard-grid">
        <div className="panel wide">
          <PanelHeader icon={<BarChart3 size={18} />} title="Penambahan Follower" />
          <BarTrend accounts={accounts} />
        </div>
        <div className="panel">
          <PanelHeader icon={<Instagram size={18} />} title="Akun Terlihat" />
          <AccountMiniList accounts={accounts} />
        </div>
        <div className="panel wide">
          <PanelHeader icon={<FileText size={18} />} title="Top Content" />
          <PostTable posts={posts} compact />
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ icon, title, action }) {
  return (
    <div className="panel-header">
      <div>{icon}<strong>{title}</strong></div>
      {action ? <a href="/api/meta/connect">{action}</a> : null}
    </div>
  );
}

function Metric({ title, value, detail, rate, icon, featured = false }) {
  return (
    <article className={featured ? 'metric-card featured' : 'metric-card'}>
      <div className="metric-head">
        <span>{title}</span>
        <div className="metric-icon">{React.cloneElement(icon, { size: 20 })}</div>
      </div>
      <strong>{value}</strong>
      <small>{detail} <b>{rate}</b></small>
    </article>
  );
}

function BarTrend({ accounts }) {
  const values = accounts.length ? accounts.slice(0, 7) : [];
  const max = Math.max(...values.map((item) => item.views || 0), 1);
  if (!values.length) return <EmptyRows text="Grafik akan muncul setelah akun IG terhubung dan insight berhasil dibaca." />;

  return (
    <div className="bar-trend">
      {values.map((item) => (
        <div className="bar-item" key={item.id}>
          <div className="bar-track">
            <span className="bar-fill follower" style={{ height: `${30 + Math.min((item.followers / Math.max(item.followers, 1)) * 45, 45)}%` }} />
            <span className="bar-fill views" style={{ height: `${30 + ((item.views || 0) / max) * 60}%` }} />
          </div>
          <small>{item.username}</small>
        </div>
      ))}
      <div className="chart-legend">
        <span><i className="dot follower" /> Followers</span>
        <span><i className="dot views" /> Views</span>
      </div>
    </div>
  );
}

function HealthGauge({ connected }) {
  return (
    <div className="gauge-card">
      <div className="gauge-ring">
        <strong>{connected ? '100%' : '0%'}</strong>
        <span>{connected ? 'Connected' : 'Waiting'}</span>
      </div>
      <div className="gauge-legend">
        <span><i /> Meta OAuth</span>
        <span><i /> Encrypted token</span>
        <span><i /> Dashboard API</span>
      </div>
    </div>
  );
}

function AccountMiniList({ accounts }) {
  if (!accounts.length) return <EmptyRows text="Belum ada akun terhubung." />;
  return (
    <div className="stack-list">
      {accounts.map((account) => (
        <div className="mini-row" key={account.id}>
          <Instagram size={17} />
          <span><strong>{account.username}</strong><small>{format(account.followers)} followers</small></span>
          <span className="pill connected">{account.status}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyRows({ text }) {
  return <div className="empty-rows">{text}</div>;
}

function PostTable({ posts, compact = false }) {
  if (!posts.length) return <EmptyRows text="Belum ada konten. Setelah OAuth berhasil, media dan insight akan tampil di sini." />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Konten</th>
            <th>Akun</th>
            <th>Tipe</th>
            <th>Views</th>
            <th>Reach</th>
            {!compact ? <th>Saves</th> : null}
            <th>ER</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={post.id}>
              <td>
                <div className="post-cell">
                  <span className="thumb" style={{ '--thumb': index % 2 ? '#20b8a6' : '#6857f5' }}>{index + 1}</span>
                  <div>
                    <strong>{post.permalink ? <a href={post.permalink} target="_blank" rel="noreferrer">{post.title}</a> : post.title}</strong>
                    <small>{post.date ? new Date(post.date).toLocaleString('id-ID') : '-'}</small>
                  </div>
                </div>
              </td>
              <td>{post.account}</td>
              <td>{post.type}</td>
              <td>{format(post.views)}</td>
              <td>{format(post.reach)}</td>
              {!compact ? <td>{format(post.saves)}</td> : null}
              <td>{post.er || 0}%</td>
              <td><span className={`status ${post.status}`}>{post.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
