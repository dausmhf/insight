import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import './styles.css';

/* ──────────────────────────
   MOCK DATA
   ────────────────────────── */
const clients = [
  { id: 1, name: 'Belajar Haji', company: 'PT Bimbingan Tamu Allah', status: 'Active', contact: 'Fahri', plan: 'Retainer', color: '#6857f5' },
  { id: 2, name: 'Ruang Cerita Bunda', company: 'Komunitas Bunda Bertumbuh', status: 'Active', contact: 'Nadia', plan: 'Premium', color: '#1db8a4' },
  { id: 3, name: 'Quran Talk', company: 'Quran Talk Studio', status: 'Preview', contact: 'Imam', plan: 'Pitching', color: '#f2a93b' },
];

const socialAccounts = [
  { id: 101, clientId: 1, username: '@belajarhaji.id', accountName: 'Belajar Haji Official', type: 'Creator', followers: 184200, growth: 4261, growthRate: 7.8, views: 1280000, reach: 499000, reels: 18, status: 'Connected', lastSync: '02:10 WIB', health: 94 },
  { id: 102, clientId: 1, username: '@hajimuda', accountName: 'Haji Muda', type: 'Business', followers: 64200, growth: 1188, growthRate: 4.2, views: 612000, reach: 221000, reels: 9, status: 'Connected', lastSync: '02:08 WIB', health: 88 },
  { id: 103, clientId: 1, username: '@umrahclass', accountName: 'Umrah Class', type: 'Creator', followers: 37800, growth: 832, growthRate: 3.6, views: 388000, reach: 146000, reels: 7, status: 'Connected', lastSync: '02:05 WIB', health: 79 },
  { id: 201, clientId: 2, username: '@ceritabunda', accountName: 'Ruang Cerita Bunda', type: 'Creator', followers: 98200, growth: 2150, growthRate: 6.4, views: 745000, reach: 304000, reels: 14, status: 'Connected', lastSync: '02:04 WIB', health: 91 },
  { id: 202, clientId: 2, username: '@bundapedia', accountName: 'Bundapedia', type: 'Business', followers: 55200, growth: 902, growthRate: 2.8, views: 200000, reach: 91000, reels: 6, status: 'Connected', lastSync: '01:59 WIB', health: 85 },
  { id: 301, clientId: 3, username: '@qurantalk.id', accountName: 'Quran Talk', type: 'Creator', followers: 73100, growth: 1602, growthRate: 5.1, views: 688000, reach: 245000, reels: 11, status: 'Preview', lastSync: '01:58 WIB', health: 76 },
];

const initialAssignments = [
  { clientId: 1, accountIds: [101, 102, 103], defaultPeriod: '30d', pdf: true, pin: true, token: 'rk_9xK72sLpQmA81vTz' },
  { clientId: 2, accountIds: [201, 202], defaultPeriod: '30d', pdf: true, pin: false, token: 'rk_7bN40sLpQmC92hTa' },
  { clientId: 3, accountIds: [301], defaultPeriod: '7d', pdf: false, pin: true, token: 'rk_4pV18zLaRmP62xQe' },
];

const dailyData = {
  '7d':  [
    { day: '1', followers: 310, views: 74000, reach: 42000, engagement: 3200 },
    { day: '3', followers: 390, views: 91000, reach: 51000, engagement: 3700 },
    { day: '5', followers: 440, views: 102000, reach: 58000, engagement: 4200 },
    { day: '7', followers: 520, views: 118000, reach: 66000, engagement: 4900 },
  ],
  '30d': [
    { day: '1',  followers: 300, views: 72000,  reach: 41000,  engagement: 3100 },
    { day: '5',  followers: 420, views: 96000,  reach: 55000,  engagement: 3900 },
    { day: '10', followers: 380, views: 88000,  reach: 53000,  engagement: 3600 },
    { day: '15', followers: 610, views: 148000, reach: 82000,  engagement: 7200 },
    { day: '20', followers: 540, views: 132000, reach: 76000,  engagement: 6100 },
    { day: '25', followers: 720, views: 171000, reach: 98000,  engagement: 8500 },
    { day: '30', followers: 690, views: 160000, reach: 91000,  engagement: 7900 },
  ],
  '90d': [
    { day: 'M1', followers: 1200, views: 320000,  reach: 180000, engagement: 15000 },
    { day: 'M2', followers: 1800, views: 480000,  reach: 260000, engagement: 22000 },
    { day: 'M3', followers: 2400, views: 620000,  reach: 340000, engagement: 28000 },
  ],
  '180d': [
    { day: 'Q1', followers: 3200, views: 890000,  reach: 480000, engagement: 42000 },
    { day: 'Q2', followers: 4100, views: 1120000, reach: 610000, engagement: 55000 },
  ],
  '365d': [
    { day: 'H1', followers: 6200, views: 1800000, reach: 950000,  engagement: 85000 },
    { day: 'H2', followers: 8400, views: 2400000, reach: 1280000, engagement: 110000 },
  ],
};

const posts = [
  // @belajarhaji.id
  { id: 1, account: '@belajarhaji.id', clientId: 1, title: 'Kesalahan niat yang sering luput', date: '30 Mei 2026', type: 'Reels', views: 382000, viewsRate: 21.4, reach: 214000, likes: 9400, saves: 4100, shares: 2700, er: 6.1, pillar: 'Edukasi', status: 'repeat', color: '#6857f5' },
  { id: 2, account: '@belajarhaji.id', clientId: 1, title: 'Checklist barang sebelum berangkat', date: '27 Mei 2026', type: 'Carousel', views: 248000, viewsRate: 13.9, reach: 132000, likes: 6100, saves: 6900, shares: 1700, er: 7.4, pillar: 'Praktikal', status: 'repeat', color: '#1db8a4' },
  { id: 8, account: '@belajarhaji.id', clientId: 1, title: 'Tips menjaga kesehatan saat thawaf', date: '25 Mei 2026', type: 'Single Post', views: 189000, viewsRate: 10.2, reach: 98000, likes: 4500, saves: 3200, shares: 890, er: 4.8, pillar: 'Praktikal', status: 'repeat', color: '#6857f5' },
  { id: 9, account: '@belajarhaji.id', clientId: 1, title: 'Amalan terbaik hari Arafah', date: '22 Mei 2026', type: 'Reels', views: 460000, viewsRate: 25.8, reach: 280000, likes: 18200, saves: 11000, shares: 9200, er: 9.2, pillar: 'Spiritual', status: 'repeat', color: '#ef6b57' },

  // @hajimuda
  { id: 3, account: '@hajimuda', clientId: 1, title: 'Cerita jamaah pertama kali thawaf', date: '24 Mei 2026', type: 'Reels', views: 196000, viewsRate: 10.9, reach: 104000, likes: 5300, saves: 1800, shares: 1500, er: 5.9, pillar: 'Story', status: 'improve', color: '#ef6b57' },
  { id: 10, account: '@hajimuda', clientId: 1, title: 'Haji di usia muda: Kenapa tidak?', date: '18 Mei 2026', type: 'Carousel', views: 142000, viewsRate: 8.2, reach: 81000, likes: 3800, saves: 4200, shares: 1200, er: 6.4, pillar: 'Spiritual', status: 'repeat', color: '#1db8a4' },
  { id: 11, account: '@hajimuda', clientId: 1, title: 'Vlog persiapan paspor & visa haji', date: '15 Mei 2026', type: 'Reels', views: 274000, viewsRate: 15.6, reach: 155000, likes: 9800, saves: 2100, shares: 3100, er: 7.2, pillar: 'Praktikal', status: 'repeat', color: '#6857f5' },

  // @umrahclass
  { id: 4, account: '@umrahclass', clientId: 1, title: 'Doa singkat sebelum perjalanan', date: '20 Mei 2026', type: 'Single Post', views: 74000, viewsRate: 4.1, reach: 49000, likes: 2100, saves: 1300, shares: 420, er: 4.2, pillar: 'Spiritual', status: 'improve', color: '#f2a93b' },
  { id: 12, account: '@umrahclass', clientId: 1, title: 'Checklist Umrah Mandiri 2026', date: '16 Mei 2026', type: 'Carousel', views: 98000, viewsRate: 5.4, reach: 62000, likes: 3100, saves: 5100, shares: 780, er: 5.1, pillar: 'Praktikal', status: 'repeat', color: '#1db8a4' },
  { id: 13, account: '@umrahclass', clientId: 1, title: 'Perbedaan Rukun & Wajib Umrah', date: '12 Mei 2026', type: 'Single Post', views: 112000, viewsRate: 6.2, reach: 71000, likes: 4500, saves: 2800, shares: 920, er: 5.8, pillar: 'Edukasi', status: 'repeat', color: '#6857f5' },

  // @ceritabunda
  { id: 5, account: '@ceritabunda', clientId: 2, title: 'Tips parenting anak usia 3 tahun', date: '29 Mei 2026', type: 'Reels', views: 312000, viewsRate: 18.2, reach: 176000, likes: 7800, saves: 5200, shares: 2100, er: 6.8, pillar: 'Edukasi', status: 'repeat', color: '#1db8a4' },
  { id: 14, account: '@ceritabunda', clientId: 2, title: 'Menghadapi anak tantrum di mal', date: '25 Mei 2026', type: 'Carousel', views: 215000, viewsRate: 12.4, reach: 121000, likes: 6200, saves: 8900, shares: 1900, er: 8.1, pillar: 'Edukasi', status: 'repeat', color: '#ef6b57' },
  { id: 15, account: '@ceritabunda', clientId: 2, title: 'Pentingnya sleep training untuk bayi', date: '20 Mei 2026', type: 'Reels', views: 182000, viewsRate: 10.6, reach: 98000, likes: 4900, saves: 3400, shares: 1100, er: 5.2, pillar: 'Praktikal', status: 'improve', color: '#f2a93b' },

  // @bundapedia
  { id: 6, account: '@bundapedia', clientId: 2, title: 'Menu MPASI sehat tanpa ribet', date: '22 Mei 2026', type: 'Carousel', views: 118000, viewsRate: 6.8, reach: 64000, likes: 3200, saves: 4800, shares: 890, er: 7.1, pillar: 'Praktikal', status: 'repeat', color: '#6857f5' },
  { id: 16, account: '@bundapedia', clientId: 2, title: 'Resep puree alpukat pisang praktis', date: '17 Mei 2026', type: 'Single Post', views: 92000, viewsRate: 5.2, reach: 51000, likes: 2400, saves: 3100, shares: 410, er: 4.8, pillar: 'Praktikal', status: 'repeat', color: '#1db8a4' },
  { id: 17, account: '@bundapedia', clientId: 2, title: 'Jadwal makan bayi 6-12 bulan', date: '11 Mei 2026', type: 'Carousel', views: 145000, viewsRate: 8.4, reach: 82000, likes: 5100, saves: 7600, shares: 1300, er: 7.8, pillar: 'Edukasi', status: 'repeat', color: '#ef6b57' },

  // @qurantalk.id
  { id: 7, account: '@qurantalk.id', clientId: 3, title: 'Tadabbur surat Al-Mulk ayat 1-5', date: '28 Mei 2026', type: 'Reels', views: 265000, viewsRate: 14.6, reach: 148000, likes: 6500, saves: 3800, shares: 1900, er: 5.5, pillar: 'Edukasi', status: 'repeat', color: '#f2a93b' },
  { id: 18, account: '@qurantalk.id', clientId: 3, title: 'Kunci istiqomah belajar Quran', date: '22 Mei 2026', type: 'Carousel', views: 198000, viewsRate: 10.9, reach: 112000, likes: 4900, saves: 6100, shares: 2200, er: 6.2, pillar: 'Spiritual', status: 'repeat', color: '#1db8a4' },
  { id: 19, account: '@qurantalk.id', clientId: 3, title: 'Cara cepat menghafal surat pendek', date: '15 Mei 2026', type: 'Reels', views: 320000, viewsRate: 17.6, reach: 185000, likes: 11200, saves: 8400, shares: 4300, er: 7.8, pillar: 'Edukasi', status: 'repeat', color: '#6857f5' },
];

const getAccountDailyData = (accountId, period) => {
  const account = socialAccounts.find((a) => a.id === accountId);
  if (!account) return dailyData[period] ?? [];

  const seed = account.id;
  const baseData = dailyData[period] ?? dailyData['30d'];

  const totalBaseViews = baseData.reduce((sum, d) => sum + d.views, 0) || 1;
  const totalBaseFollowers = baseData.reduce((sum, d) => sum + d.followers, 0) || 1;

  const viewsScale = account.views / totalBaseViews;
  const followersScale = account.growth / totalBaseFollowers;

  return baseData.map((d, index) => {
    const varFactor1 = 0.85 + (Math.sin(seed + index) * 0.15);
    const varFactor2 = 0.85 + (Math.cos(seed + index) * 0.15);
    return {
      day: d.day,
      followers: Math.max(1, Math.round(d.followers * followersScale * varFactor1)),
      views: Math.max(10, Math.round(d.views * viewsScale * varFactor2)),
    };
  });
};

const format = (value) => new Intl.NumberFormat('id-ID').format(value);





/* ──────────────────────────
   APP
   ────────────────────────── */
function App() {
  const [view, setView] = useState('dashboard');
  const [period, setPeriod] = useState('30d');
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState(initialAssignments);
  const [toast, setToast] = useState(null);
  const [adminActiveAccountId, setAdminActiveAccountId] = useState(101);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? clients[0];
  const selectedAssignment = assignments.find((a) => a.clientId === selectedClient.id) ?? assignments[0];
  const allowedAccounts = socialAccounts.filter((a) => selectedAssignment.accountIds.includes(a.id));

  const toggleAccountAssignment = useCallback((clientId, accountId) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.clientId !== clientId) return a;
        const ids = a.accountIds.includes(accountId)
          ? a.accountIds.filter((id) => id !== accountId)
          : [...a.accountIds, accountId];
        return { ...a, accountIds: ids };
      })
    );
  }, []);

  return (
    <main className="app-shell">
      <Sidebar view={view} setView={setView} />
      <section className="workspace">
        <Topbar view={view} period={period} setPeriod={setPeriod} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {view === 'dashboard' && (
          <DashboardHome
            activeAccountId={adminActiveAccountId}
            setActiveAccountId={setAdminActiveAccountId}
            period={period}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}
        {view === 'clients' && <ClientsView selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} searchQuery={searchQuery} showToast={showToast} />}
        {view === 'social' && <SocialMediaView searchQuery={searchQuery} showToast={showToast} />}
        {view === 'settings' && (
          <SettingsView
            selectedClient={selectedClient}
            setSelectedClientId={setSelectedClientId}
            assignment={selectedAssignment}
            accounts={allowedAccounts}
            onToggleAccount={toggleAccountAssignment}
            showToast={showToast}
          />
        )}
        {view === 'client' && <ClientView client={selectedClient} accounts={allowedAccounts} period={period} />}
      </section>
      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </main>
  );
}

/* ──────────────────────────
   SIDEBAR
   ────────────────────────── */
function Sidebar({ view, setView }) {
  const nav = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['clients', Users, 'Client List'],
    ['social', Instagram, 'Social Media'],
    ['settings', Settings, 'Settings Access'],
    ['client', Link2, 'Client Share View'],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">RI</div>
        <div>
          <strong>Ruank Insight</strong>
          <span>Operating dashboard</span>
        </div>
      </div>
      <nav className="nav-list" aria-label="Admin navigation">
        {nav.map(([key, Icon, label]) => (
          <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>
      <div className="security-panel">
        <Lock size={17} />
        <strong>Share link aman</strong>
        <span>Client hanya melihat akun IG yang di-set di Settings Access.</span>
      </div>
    </aside>
  );
}

/* ──────────────────────────
   TOPBAR
   ────────────────────────── */
function Topbar({ view, period, setPeriod, searchQuery, setSearchQuery }) {
  const titles = {
    dashboard: ['Operating Dashboard', 'Overview semua client dan akun IG'],
    clients: ['Client List', 'Kelola data client dan akun sosial'],
    social: ['Social Media List', 'Listing akun IG, sync status, dan performa'],
    settings: ['Settings Access', 'Set client ke akun IG yang boleh dilihat'],
    client: ['Client Share View', 'Preview dashboard yang akan dilihat client'],
  };

  return (
    <header className="topbar">
      <label className="searchbox">
        <Search size={16} />
        <input
          placeholder="Cari client, akun IG, konten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </label>
      <div className="top-title">
        <p className="eyebrow">{titles[view]?.[0]}</p>
        <h1>{titles[view]?.[1]}</h1>
      </div>
      <div className="top-actions">
        <button className="icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="badge" />
        </button>
        <button className="icon-btn" title="Refresh sync">
          <RefreshCw size={18} />
        </button>
        <div className="select-wrap">
          <CalendarDays size={16} />
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7d">7 hari</option>
            <option value="30d">30 hari</option>
            <option value="90d">90 hari</option>
            <option value="180d">180 hari</option>
            <option value="365d">1 tahun</option>
          </select>
          <ChevronDown size={14} />
        </div>
        <div className="profile-chip">
          <span>RA</span>
          <strong>Admin Ruank</strong>
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────
   DASHBOARD HOME
   ────────────────────────── */
function DashboardHome({ activeAccountId, setActiveAccountId, period, searchQuery, showToast }) {
  const activeAccount = socialAccounts.find((a) => a.id === activeAccountId) ?? socialAccounts[0];
  const daily = getAccountDailyData(activeAccount.id, period);
  const accountPosts = posts.filter((p) => p.account === activeAccount.username);
  
  const avgER = accountPosts.length > 0 
    ? (accountPosts.reduce((sum, p) => sum + p.er, 0) / accountPosts.length).toFixed(1) 
    : '0.0';

  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Ruank Insight Dashboard</p>
          <h2>Dashboard social media untuk operator dan strategist.</h2>
          <span>Semua angka dibaca dari database snapshot untuk akun yang sedang aktif.</span>
        </div>
        <div className="hero-actions">
          <button onClick={() => showToast('Fitur Connect IG akan tersedia setelah integrasi Meta API.')}>
            <Plus size={17} /> Connect IG
          </button>
          <button className="ghost" onClick={() => showToast('Export report akan tersedia dalam versi production.')}>
            <Download size={17} /> Export Report
          </button>
        </div>
      </section>

      <section className="account-selector-wrapper">
        <strong>Pilih Akun Instagram Aktif</strong>
        <div className="account-selector-tabs">
          {socialAccounts.map((account) => {
            const client = clients.find((c) => c.id === account.clientId);
            const isActive = account.id === activeAccount.id;
            return (
              <button
                key={account.id}
                className={`account-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveAccountId(account.id)}
                style={{ '--avatar': client?.color || 'var(--purple)' }}
              >
                <span className="avatar-mini">
                  {client?.name.slice(0, 2) || 'IG'}
                </span>
                <strong>{account.username}</strong>
                <span style={{ fontSize: '11px', opacity: isActive ? 0.9 : 0.6 }}>
                  ({client?.name})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="metric-grid">
        <Metric title="Followers" value={format(activeAccount.followers)} detail={`+${format(activeAccount.growth)} follower`} rate={`+${activeAccount.growthRate}%`} icon={<TrendingUp />} featured />
        <Metric title="Views Periode Ini" value={format(activeAccount.views)} detail="Views akun terpilih" rate="+18.2%" icon={<Activity />} />
        <Metric title="Reach Periode Ini" value={format(activeAccount.reach)} detail="Audience unik" rate="+11.5%" icon={<Eye />} />
        <Metric title="Avg ER" value={`${avgER}%`} detail="Engagement rate" rate="+0.8%" icon={<MessageCircle />} />
      </div>

      <section className="dashboard-grid">
        <div className="panel wide">
          <PanelHeader icon={<BarChart3 size={17} />} title="Penambahan Follower & Views" action="Sync Manual" onAction={() => showToast('Sync manual berhasil dijadwalkan.')} />
          <BarTrend data={daily} />
        </div>
        <div className="panel">
          <PanelHeader icon={<Gauge size={17} />} title="Account Health" />
          <HealthGauge percent={activeAccount.health || 82} />
        </div>
        <div className="panel">
          <PanelHeader icon={<Users size={17} />} title="Client Performance" />
          <ClientMiniList searchQuery={searchQuery} />
        </div>
        <div className="panel full-width">
          <PanelHeader icon={<FileText size={17} />} title="Top Content" action="Export PDF" onAction={() => showToast('Export PDF akan tersedia di versi production.')} />
          <PostTable posts={filterPosts(accountPosts, searchQuery)} />
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────
   CLIENTS VIEW
   ────────────────────────── */
function ClientsView({ selectedClientId, setSelectedClientId, searchQuery, showToast }) {
  const filtered = clients.filter((c) => matchSearch(searchQuery, c.name, c.company, c.contact));

  return (
    <div className="dashboard-page">
      <section className="panel">
        <PanelHeader icon={<Users size={17} />} title="Client List" action="Tambah Client" onAction={() => showToast('Fitur tambah client akan tersedia.')} />
        <div className="client-card-grid">
          {filtered.map((client) => {
            const accountCount = socialAccounts.filter((a) => a.clientId === client.id).length;
            return (
              <button key={client.id} className={`client-card ${client.id === selectedClientId ? 'selected' : ''}`} onClick={() => setSelectedClientId(client.id)}>
                <span className="avatar" style={{ '--avatar': client.color }}>{client.name.slice(0, 2)}</span>
                <strong>{client.name}</strong>
                <small>{client.company}</small>
                <div>
                  <span className={`pill ${client.status.toLowerCase()}`}>{client.status}</span>
                  <span>{accountCount} akun IG tersambung</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && <p style={{ color: 'var(--ink-muted)', padding: '20px' }}>Tidak ada client yang cocok dengan pencarian.</p>}
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────
   SOCIAL MEDIA VIEW
   ────────────────────────── */
function SocialMediaView({ searchQuery, showToast }) {
  const filtered = socialAccounts.filter((a) =>
    matchSearch(searchQuery, a.username, a.accountName, clients.find((c) => c.id === a.clientId)?.name ?? '')
  );

  return (
    <div className="dashboard-page">
      <section className="panel">
        <PanelHeader icon={<Instagram size={17} />} title="Social Media List" action="Connect Instagram" onAction={() => showToast('Fitur Connect IG akan tersedia setelah integrasi Meta API.')} />
        <div className="account-list">
          {filtered.map((account) => {
            const client = clients.find((c) => c.id === account.clientId);
            return (
              <article className="account-row" key={account.id}>
                <span className="ig-badge"><Instagram size={18} /></span>
                <div>
                  <strong>{account.username}</strong>
                  <small>{account.accountName} · {account.type}</small>
                </div>
                <div>
                  <span>Client</span>
                  <strong>{client?.name}</strong>
                </div>
                <div>
                  <span>Followers</span>
                  <strong>{format(account.followers)}</strong>
                  <small>+{format(account.growth)} ({account.growthRate}%)</small>
                </div>
                <div>
                  <span>Views</span>
                  <strong>{format(account.views)}</strong>
                </div>
                <div>
                  <span>Reels</span>
                  <strong>{account.reels}</strong>
                </div>
                <span className={`pill ${account.status.toLowerCase()}`}>{account.status}</span>
              </article>
            );
          })}
          {filtered.length === 0 && <p style={{ color: 'var(--ink-muted)', padding: '20px' }}>Tidak ada akun yang cocok dengan pencarian.</p>}
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────
   SETTINGS VIEW
   ────────────────────────── */
function SettingsView({ selectedClient, setSelectedClientId, assignment, accounts, onToggleAccount, showToast }) {
  return (
    <div className="settings-layout">
      <section className="panel">
        <PanelHeader icon={<Users size={17} />} title="Pilih Client" />
        <div className="stack-list">
          {clients.map((client) => (
            <button key={client.id} className={`setting-client ${client.id === selectedClient.id ? 'active' : ''}`} onClick={() => setSelectedClientId(client.id)}>
              <span className="avatar" style={{ '--avatar': client.color }}>{client.name.slice(0, 2)}</span>
              <span><strong>{client.name}</strong><small>{client.plan}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelHeader
          icon={<ShieldCheck size={17} />}
          title={`Set akses IG untuk ${selectedClient.name}`}
          action="Simpan Setting"
          onAction={() => showToast(`Pengaturan akses untuk ${selectedClient.name} berhasil disimpan.`)}
        />
        <div className="assignment-box">
          <div className="assignment-client">
            <span className="avatar large" style={{ '--avatar': selectedClient.color }}>{selectedClient.name.slice(0, 2)}</span>
            <div>
              <strong>{selectedClient.name}</strong>
              <small>Client hanya bisa melihat akun yang dicentang di bawah.</small>
            </div>
          </div>
          <div className="access-arrow">akses</div>
          <div className="assignment-accounts">
            {socialAccounts.map((account) => {
              const checked = assignment.accountIds.includes(account.id);
              return (
                <label
                  key={account.id}
                  className={checked ? 'access-card checked' : 'access-card'}
                  onClick={(e) => { e.preventDefault(); onToggleAccount(selectedClient.id, account.id); }}
                >
                  <input type="checkbox" checked={checked} onChange={() => {}} />
                  <Instagram size={17} />
                  <span>
                    <strong>{account.username}</strong>
                    <small>{clients.find((c) => c.id === account.clientId)?.name}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={<KeyRound size={17} />} title="Share Link Setting" />
        <div className="share-card light">
          <code>https://insight.dausmhf.com/share/{assignment.token}</code>
          <div className="share-settings">
            <span><CheckCircle2 size={14} /> {accounts.length} akun terlihat</span>
            <span><FileText size={14} /> PDF {assignment.pdf ? 'aktif' : 'nonaktif'}</span>
            <span><Lock size={14} /> PIN {assignment.pin ? 'aktif' : 'nonaktif'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────
   CLIENT VIEW (SHARE PREVIEW)
   ────────────────────────── */
function ClientView({ client, accounts, period }) {
  const [activeId, setActiveId] = useState(null);

  const activeAccount = useMemo(() => {
    if (activeId && accounts.some((a) => a.id === activeId)) {
      return accounts.find((a) => a.id === activeId);
    }
    return accounts[0] || null;
  }, [activeId, accounts]);

  useEffect(() => {
    if (accounts.length > 0 && (!activeId || !accounts.some((a) => a.id === activeId))) {
      setActiveId(accounts[0].id);
    }
  }, [accounts, activeId]);

  if (!activeAccount) {
    return (
      <div className="dashboard-page" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>
        Belum ada akun Instagram yang dihubungkan ke client ini.
      </div>
    );
  }

  const daily = getAccountDailyData(activeAccount.id, period);
  const clientPosts = posts.filter((p) => p.account === activeAccount.username);
  const avgER = clientPosts.length > 0 ? (clientPosts.reduce((s, p) => s + p.er, 0) / clientPosts.length).toFixed(1) : '0.0';
  const periodLabel = period.replace('d', '');

  return (
    <div className="dashboard-page">
      <section className="client-hero">
        <div>
          <p className="eyebrow">Private report link</p>
          <h2>{client.name}</h2>
          <span>{periodLabel} hari performa untuk akun <strong>{activeAccount.username}</strong> ({activeAccount.accountName}).</span>
        </div>
        <div className="hero-actions">
          <button><Download size={16} /> PDF</button>
          <button className="ghost"><Filter size={16} /> Filter</button>
        </div>
      </section>

      <section className="account-selector-wrapper">
        <strong>Pilih Akun Instagram</strong>
        <div className="account-selector-tabs">
          {accounts.map((account) => {
            const isActive = account.id === activeAccount.id;
            return (
              <button
                key={account.id}
                className={`account-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveId(account.id)}
                style={{ '--avatar': client?.color || 'var(--purple)' }}
              >
                <span className="avatar-mini">
                  {client?.name.slice(0, 2) || 'IG'}
                </span>
                <strong>{account.username}</strong>
                <span style={{ fontSize: '11px', opacity: isActive ? 0.9 : 0.6 }}>
                  ({format(account.followers)} followers)
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="metric-grid">
        <Metric title="Followers" value={format(activeAccount.followers)} detail={`+${format(activeAccount.growth)} follower`} rate={`+${activeAccount.growthRate}%`} icon={<TrendingUp />} featured />
        <Metric title="Total Views" value={format(activeAccount.views)} detail="Views periode ini" rate="+18.2%" icon={<Activity />} />
        <Metric title="Total Reach" value={format(activeAccount.reach)} detail="Audience unik" rate="+11.5%" icon={<Eye />} />
        <Metric title="Avg ER" value={`${avgER}%`} detail="Engagement rate" rate="+0.8%" icon={<MessageCircle />} />
      </div>

      <section className="dashboard-grid">
        <div className="panel wide">
          <PanelHeader icon={<BarChart3 size={17} />} title={`Penambahan Follower — ${activeAccount.username}`} />
          <BarTrend data={daily} />
        </div>
        <div className="panel">
          <PanelHeader icon={<Gauge size={17} />} title="Account Health" />
          <HealthGauge percent={activeAccount.health || 82} />
        </div>
        <div className="panel full-width">
          <PanelHeader icon={<FileText size={17} />} title={`Top Content — ${activeAccount.username}`} />
          <PostTable posts={clientPosts} compact />
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────
   SHARED COMPONENTS
   ────────────────────────── */
function PanelHeader({ icon, title, action, onAction }) {
  return (
    <div className="panel-header">
      <div>{icon}<strong>{title}</strong></div>
      {action ? <button onClick={onAction}>{action}</button> : null}
    </div>
  );
}

function Metric({ title, value, detail, rate, icon, featured = false }) {
  return (
    <article className={featured ? 'metric-card featured' : 'metric-card'}>
      <div className="metric-head">
        <span>{title}</span>
        <div className="metric-icon">{React.cloneElement(icon, { size: 18 })}</div>
      </div>
      <strong>{value}</strong>
      <small>{detail} <b>{rate}</b></small>
    </article>
  );
}

function BarTrend({ data }) {
  const max = Math.max(...data.map((d) => d.views));
  return (
    <div className="bar-trend">
      {data.map((item, i) => (
        <div className="bar-item" key={item.day}>
          <div className="bar-track">
            <span className="bar-fill follower" style={{ height: `${30 + (item.followers / Math.max(...data.map((d) => d.followers))) * 50}%`, animationDelay: `${i * 0.08}s` }} />
            <span className="bar-fill views" style={{ height: `${30 + (item.views / max) * 55}%`, animationDelay: `${i * 0.08 + 0.04}s` }} />
          </div>
          <small>{item.day}</small>
        </div>
      ))}
      <div className="chart-legend">
        <span><i className="dot follower" /> Follower baru</span>
        <span><i className="dot views" /> Views</span>
      </div>
    </div>
  );
}

function HealthGauge({ percent = 82 }) {
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="gauge-card">
      <div className="gauge-svg-wrap">
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6857f5" />
              <stop offset="100%" stopColor="#1db8a4" />
            </linearGradient>
          </defs>
          <circle className="gauge-bg" cx="60" cy="60" r="50" />
          <circle className="gauge-fill" cx="60" cy="60" r="50" style={{ strokeDashoffset: offset }} />
        </svg>
        <div className="gauge-center">
          <strong>{percent}%</strong>
          <span>Healthy</span>
        </div>
      </div>
      <div className="gauge-legend">
        <span><i /> Sync aktif</span>
        <span><i /> Token aman</span>
        <span><i /> Snapshot harian</span>
      </div>
    </div>
  );
}

function ClientMiniList({ searchQuery = '' }) {
  const filtered = clients.filter((c) => matchSearch(searchQuery, c.name, c.company));

  return (
    <div className="stack-list">
      {filtered.map((client) => {
        const count = socialAccounts.filter((a) => a.clientId === client.id).length;
        return (
          <div className="mini-row" key={client.id}>
            <span className="avatar" style={{ '--avatar': client.color }}>{client.name.slice(0, 2)}</span>
            <span><strong>{client.name}</strong><small>{count} akun IG</small></span>
            <span className={`pill ${client.status.toLowerCase()}`}>{client.status}</span>
          </div>
        );
      })}
    </div>
  );
}

function PostTable({ posts: postList, compact = false }) {
  if (postList.length === 0) {
    return <p style={{ color: 'var(--ink-muted)', padding: '16px 0', fontSize: '13px' }}>Belum ada data konten.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Konten</th>
            <th>Akun</th>
            <th>Tipe</th>
            <th>Views</th>
            <th>Share Views</th>
            <th>Reach</th>
            {!compact && <th>Pillar</th>}
            <th>ER</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {postList.map((post) => (
            <tr key={post.id}>
              <td>
                <div className="post-cell">
                  <span className="thumb" style={{ '--thumb': post.color }}>{post.id}</span>
                  <div>
                    <strong>{post.title}</strong>
                    <small>{post.date}</small>
                  </div>
                </div>
              </td>
              <td>{post.account}</td>
              <td>{post.type}</td>
              <td>{format(post.views)}</td>
              <td>{post.viewsRate}%</td>
              <td>{format(post.reach)}</td>
              {!compact && <td>{post.pillar}</td>}
              <td>{post.er}%</td>
              <td><span className={`status ${post.status}`}>{post.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────
   UTILITY
   ────────────────────────── */
function matchSearch(query, ...fields) {
  if (!query || query.trim() === '') return true;
  const q = query.toLowerCase();
  return fields.some((f) => f && f.toLowerCase().includes(q));
}

function filterPosts(allPosts, query) {
  if (!query || query.trim() === '') return allPosts;
  const q = query.toLowerCase();
  return allPosts.filter((p) =>
    p.title.toLowerCase().includes(q) ||
    p.account.toLowerCase().includes(q) ||
    p.pillar.toLowerCase().includes(q)
  );
}

/* ──────────────────────────
   MOUNT
   ────────────────────────── */
createRoot(document.getElementById('root')).render(<App />);
