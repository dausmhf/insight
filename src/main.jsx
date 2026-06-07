import React, { useMemo, useState } from 'react';
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

const clients = [
  { id: 1, name: 'Belajar Haji', company: 'PT Bimbingan Tamu Allah', status: 'Active', contact: 'Fahri', plan: 'Retainer', color: '#6d5dfc' },
  { id: 2, name: 'Ruang Cerita Bunda', company: 'Komunitas Bunda Bertumbuh', status: 'Active', contact: 'Nadia', plan: 'Premium', color: '#20b8a6' },
  { id: 3, name: 'Quran Talk', company: 'Quran Talk Studio', status: 'Preview', contact: 'Imam', plan: 'Pitching', color: '#f2a93b' },
];

const socialAccounts = [
  { id: 101, clientId: 1, username: '@belajarhaji.id', accountName: 'Belajar Haji Official', type: 'Creator', followers: 184200, growth: 4261, growthRate: 7.8, views: 1280000, reach: 499000, reels: 18, status: 'Connected', lastSync: '02:10 WIB' },
  { id: 102, clientId: 1, username: '@hajimuda', accountName: 'Haji Muda', type: 'Business', followers: 64200, growth: 1188, growthRate: 4.2, views: 612000, reach: 221000, reels: 9, status: 'Connected', lastSync: '02:08 WIB' },
  { id: 103, clientId: 1, username: '@umrahclass', accountName: 'Umrah Class', type: 'Creator', followers: 37800, growth: 832, growthRate: 3.6, views: 388000, reach: 146000, reels: 7, status: 'Connected', lastSync: '02:05 WIB' },
  { id: 201, clientId: 2, username: '@ceritabunda', accountName: 'Ruang Cerita Bunda', type: 'Creator', followers: 98200, growth: 2150, growthRate: 6.4, views: 745000, reach: 304000, reels: 14, status: 'Connected', lastSync: '02:04 WIB' },
  { id: 202, clientId: 2, username: '@bundapedia', accountName: 'Bundapedia', type: 'Business', followers: 55200, growth: 902, growthRate: 2.8, views: 200000, reach: 91000, reels: 6, status: 'Connected', lastSync: '01:59 WIB' },
  { id: 301, clientId: 3, username: '@qurantalk.id', accountName: 'Quran Talk', type: 'Creator', followers: 73100, growth: 1602, growthRate: 5.1, views: 688000, reach: 245000, reels: 11, status: 'Preview', lastSync: '01:58 WIB' },
];

const assignments = [
  { clientId: 1, accountIds: [101, 102, 103], defaultPeriod: '30d', pdf: true, pin: true, token: 'rk_9xK72sLpQmA81vTz' },
  { clientId: 2, accountIds: [201, 202], defaultPeriod: '30d', pdf: true, pin: false, token: 'rk_7bN40sLpQmC92hTa' },
  { clientId: 3, accountIds: [301], defaultPeriod: '7d', pdf: false, pin: true, token: 'rk_4pV18zLaRmP62xQe' },
];

const daily = [
  { day: '1', followers: 300, views: 72000, reach: 41000, engagement: 3100 },
  { day: '5', followers: 420, views: 96000, reach: 55000, engagement: 3900 },
  { day: '10', followers: 380, views: 88000, reach: 53000, engagement: 3600 },
  { day: '15', followers: 610, views: 148000, reach: 82000, engagement: 7200 },
  { day: '20', followers: 540, views: 132000, reach: 76000, engagement: 6100 },
  { day: '25', followers: 720, views: 171000, reach: 98000, engagement: 8500 },
  { day: '30', followers: 690, views: 160000, reach: 91000, engagement: 7900 },
];

const posts = [
  { id: 1, account: '@belajarhaji.id', title: 'Kesalahan niat yang sering luput', date: '30 Mei 2026', type: 'Reels', views: 382000, viewsRate: 21.4, reach: 214000, likes: 9400, saves: 4100, shares: 2700, er: 6.1, pillar: 'Edukasi', status: 'repeat', color: '#6d5dfc' },
  { id: 2, account: '@belajarhaji.id', title: 'Checklist barang sebelum berangkat', date: '27 Mei 2026', type: 'Carousel', views: 248000, viewsRate: 13.9, reach: 132000, likes: 6100, saves: 6900, shares: 1700, er: 7.4, pillar: 'Praktikal', status: 'repeat', color: '#20b8a6' },
  { id: 3, account: '@hajimuda', title: 'Cerita jamaah pertama kali thawaf', date: '24 Mei 2026', type: 'Reels', views: 196000, viewsRate: 10.9, reach: 104000, likes: 5300, saves: 1800, shares: 1500, er: 5.9, pillar: 'Story', status: 'improve', color: '#ef6b57' },
  { id: 4, account: '@umrahclass', title: 'Doa singkat sebelum perjalanan', date: '20 Mei 2026', type: 'Single Post', views: 74000, viewsRate: 4.1, reach: 49000, likes: 2100, saves: 1300, shares: 420, er: 4.2, pillar: 'Spiritual', status: 'improve', color: '#f2a93b' },
];

const format = (value) => new Intl.NumberFormat('id-ID').format(value);

function App() {
  const [view, setView] = useState('dashboard');
  const [period, setPeriod] = useState('30d');
  const [selectedClientId, setSelectedClientId] = useState(1);

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0];
  const selectedAssignment = assignments.find((item) => item.clientId === selectedClient.id) ?? assignments[0];
  const allowedAccounts = socialAccounts.filter((account) => selectedAssignment.accountIds.includes(account.id));

  const totals = useMemo(() => {
    const followers = socialAccounts.reduce((sum, item) => sum + item.followers, 0);
    const growth = socialAccounts.reduce((sum, item) => sum + item.growth, 0);
    const views = socialAccounts.reduce((sum, item) => sum + item.views, 0);
    const reach = socialAccounts.reduce((sum, item) => sum + item.reach, 0);
    return { followers, growth, views, reach };
  }, []);

  return (
    <main className="app-shell">
      <Sidebar view={view} setView={setView} />
      <section className="workspace">
        <Topbar view={view} period={period} setPeriod={setPeriod} />
        {view === 'dashboard' && <DashboardHome totals={totals} />}
        {view === 'clients' && <ClientsView selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} />}
        {view === 'social' && <SocialMediaView />}
        {view === 'settings' && <SettingsView selectedClient={selectedClient} setSelectedClientId={setSelectedClientId} assignment={selectedAssignment} accounts={allowedAccounts} />}
        {view === 'client' && <ClientView client={selectedClient} accounts={allowedAccounts} period={period} />}
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
          <span>Operating dashboard</span>
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
        <strong>Share link aman</strong>
        <span>Client hanya melihat akun IG yang di-set di Settings Access.</span>
      </div>
    </aside>
  );
}

function Topbar({ view, period, setPeriod }) {
  const titles = {
    dashboard: ['Operating Dashboard', 'Overview semua client dan akun IG'],
    clients: ['Client List', 'Kelola data client tanpa mencampur akun sosial'],
    social: ['Social Media List', 'Listing akun IG, sync status, dan performa'],
    settings: ['Settings Access', 'Set client ke akun IG yang boleh dilihat'],
    client: ['Client Share View', 'Preview dashboard yang akan dilihat client'],
  };

  return (
    <header className="topbar">
      <label className="searchbox">
        <Search size={18} />
        <input placeholder="Cari client, akun IG, konten..." />
      </label>
      <div className="top-title">
        <p className="eyebrow">{titles[view][0]}</p>
        <h1>{titles[view][1]}</h1>
      </div>
      <div className="top-actions">
        <button className="icon-btn" title="Notification"><Bell size={18} /></button>
        <button className="icon-btn" title="Refresh sync"><RefreshCw size={18} /></button>
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
        <div className="profile-chip">
          <span>RA</span>
          <strong>Admin Ruank</strong>
        </div>
      </div>
    </header>
  );
}

function DashboardHome({ totals }) {
  return (
    <div className="dashboard-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Ruank Insight Dashboard</p>
          <h2>Dashboard social media untuk operator dan strategist.</h2>
          <span>Semua angka dibaca dari snapshot database, bukan hit API saat client membuka link.</span>
        </div>
        <div className="hero-actions">
          <button><Plus size={18} /> Connect IG</button>
          <button className="ghost"><Download size={18} /> Export Report</button>
        </div>
      </section>

      <div className="metric-grid">
        <Metric title="Total Followers" value={format(totals.followers)} detail={`+${format(totals.growth)} follower`} rate="+6.9%" icon={<TrendingUp />} featured />
        <Metric title="Views 30 Hari" value={format(totals.views)} detail="Dari semua akun" rate="+18.2%" icon={<Activity />} />
        <Metric title="Reach 30 Hari" value={format(totals.reach)} detail="Audience unik" rate="+11.5%" icon={<Eye />} />
        <Metric title="Avg ER" value="6.0%" detail="Engagement rate" rate="+0.8%" icon={<MessageCircle />} />
      </div>

      <section className="dashboard-grid">
        <div className="panel wide">
          <PanelHeader icon={<BarChart3 size={18} />} title="Penambahan Follower & Views" action="Sync Manual" />
          <BarTrend />
        </div>
        <div className="panel">
          <PanelHeader icon={<Gauge size={18} />} title="Account Health" />
          <HealthGauge />
        </div>
        <div className="panel">
          <PanelHeader icon={<Users size={18} />} title="Client Performance" />
          <ClientMiniList />
        </div>
        <div className="panel wide">
          <PanelHeader icon={<FileText size={18} />} title="Top Content" action="Export PDF" />
          <PostTable />
        </div>
      </section>
    </div>
  );
}

function ClientsView({ selectedClientId, setSelectedClientId }) {
  return (
    <div className="dashboard-page">
      <section className="panel">
        <PanelHeader icon={<Users size={18} />} title="Client List" action="Tambah Client" />
        <div className="client-card-grid">
          {clients.map((client) => {
            const accountCount = socialAccounts.filter((account) => account.clientId === client.id).length;
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
        </div>
      </section>
    </div>
  );
}

function SocialMediaView() {
  return (
    <div className="dashboard-page">
      <section className="panel">
        <PanelHeader icon={<Instagram size={18} />} title="Social Media List" action="Connect Instagram" />
        <div className="account-list">
          {socialAccounts.map((account) => {
            const client = clients.find((item) => item.id === account.clientId);
            return (
              <article className="account-row" key={account.id}>
                <span className="ig-badge"><Instagram size={19} /></span>
                <div>
                  <strong>{account.username}</strong>
                  <small>{account.accountName} - {account.type}</small>
                </div>
                <div><span>Client</span><strong>{client?.name}</strong></div>
                <div><span>Followers</span><strong>{format(account.followers)}</strong><small>+{format(account.growth)} ({account.growthRate}%)</small></div>
                <div><span>Views</span><strong>{format(account.views)}</strong></div>
                <div><span>Reels</span><strong>{account.reels}</strong></div>
                <span className={`pill ${account.status.toLowerCase()}`}>{account.status}</span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SettingsView({ selectedClient, setSelectedClientId, assignment, accounts }) {
  return (
    <div className="settings-layout">
      <section className="panel">
        <PanelHeader icon={<Users size={18} />} title="Pilih Client" />
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
        <PanelHeader icon={<ShieldCheck size={18} />} title={`Set akses IG untuk ${selectedClient.name}`} action="Simpan Setting" />
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
                <label key={account.id} className={checked ? 'access-card checked' : 'access-card'}>
                  <input type="checkbox" checked={checked} readOnly />
                  <Instagram size={18} />
                  <span><strong>{account.username}</strong><small>{clients.find((client) => client.id === account.clientId)?.name}</small></span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <PanelHeader icon={<KeyRound size={18} />} title="Share Link Setting" />
        <div className="share-card light">
          <code>https://insight.dausmhf.com/share/{assignment.token}</code>
          <div className="share-settings">
            <span><CheckCircle2 size={15} /> {accounts.length} akun terlihat</span>
            <span><FileText size={15} /> PDF {assignment.pdf ? 'aktif' : 'nonaktif'}</span>
            <span><Lock size={15} /> PIN {assignment.pin ? 'aktif' : 'nonaktif'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ClientView({ client, accounts, period }) {
  const followers = accounts.reduce((sum, account) => sum + account.followers, 0);
  const views = accounts.reduce((sum, account) => sum + account.views, 0);
  const reach = accounts.reduce((sum, account) => sum + account.reach, 0);
  const growth = accounts.reduce((sum, account) => sum + account.growth, 0);

  return (
    <div className="dashboard-page">
      <section className="client-hero">
        <div>
          <p className="eyebrow">Private report link</p>
          <h2>{client.name}</h2>
          <span>{period.replace('d', '')} hari performa dari {accounts.length} akun yang diizinkan.</span>
        </div>
        <div className="hero-actions">
          <button><Download size={17} /> PDF</button>
          <button className="ghost"><Filter size={17} /> Filter</button>
        </div>
      </section>

      <div className="metric-grid">
        <Metric title="Followers" value={format(followers)} detail={`+${format(growth)} follower`} rate="+7.1%" icon={<TrendingUp />} featured />
        <Metric title="Total Views" value={format(views)} detail="Views periode ini" rate="+18.2%" icon={<Activity />} />
        <Metric title="Total Reach" value={format(reach)} detail="Audience unik" rate="+11.5%" icon={<Eye />} />
        <Metric title="Avg ER" value="6.0%" detail="Engagement rate" rate="+0.8%" icon={<MessageCircle />} />
      </div>

      <section className="dashboard-grid">
        <div className="panel wide">
          <PanelHeader icon={<BarChart3 size={18} />} title="Penambahan Follower" />
          <BarTrend />
        </div>
        <div className="panel">
          <PanelHeader icon={<Instagram size={18} />} title="Akun Terlihat" />
          <div className="stack-list">
            {accounts.map((account) => (
              <div className="mini-row" key={account.id}>
                <Instagram size={17} />
                <span><strong>{account.username}</strong><small>{format(account.followers)} followers</small></span>
              </div>
            ))}
          </div>
        </div>
        <div className="panel wide">
          <PanelHeader icon={<FileText size={18} />} title="Top Content" />
          <PostTable compact />
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ icon, title, action }) {
  return (
    <div className="panel-header">
      <div>{icon}<strong>{title}</strong></div>
      {action ? <button>{action}</button> : null}
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

function BarTrend() {
  const max = Math.max(...daily.map((item) => item.views));
  return (
    <div className="bar-trend">
      {daily.map((item) => (
        <div className="bar-item" key={item.day}>
          <div className="bar-track">
            <span className="bar-fill follower" style={{ height: `${35 + (item.followers / 720) * 45}%` }} />
            <span className="bar-fill views" style={{ height: `${35 + (item.views / max) * 55}%` }} />
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

function HealthGauge() {
  return (
    <div className="gauge-card">
      <div className="gauge-ring">
        <strong>82%</strong>
        <span>Healthy</span>
      </div>
      <div className="gauge-legend">
        <span><i /> Sync aktif</span>
        <span><i /> Token aman</span>
        <span><i /> Snapshot harian</span>
      </div>
    </div>
  );
}

function ClientMiniList() {
  return (
    <div className="stack-list">
      {clients.map((client) => {
        const count = socialAccounts.filter((account) => account.clientId === client.id).length;
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

function PostTable({ compact = false }) {
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
            {!compact ? <th>Pillar</th> : null}
            <th>ER</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
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
              {!compact ? <td>{post.pillar}</td> : null}
              <td>{post.er}%</td>
              <td><span className={`status ${post.status}`}>{post.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
