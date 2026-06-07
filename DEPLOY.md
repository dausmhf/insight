# Ruank Insight Dashboard Deploy

Domain target: `insight.dausmhf.com`

DNS sudah dicek dan mengarah ke VPS `43.159.59.112`.

## Build Lokal

```bash
npm run build
```

Output production ada di folder `dist/`.

## Deploy ke Ubuntu VPS

Ambil source dari GitHub:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/dausmhf/insight.git ruank-insight-app
cd ruank-insight-app
npm install
npm run build
```

Buat env production di VPS:

```bash
cp .env.example .env.production
nano .env.production
```

Isi minimal:

```txt
PUBLIC_BASE_URL=https://insight.dausmhf.com
META_APP_ID=...
META_APP_SECRET=...
META_REDIRECT_URI=https://insight.dausmhf.com/api/meta/callback
META_AUTH_MODE=facebook
META_SCOPES=pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights
TOKEN_ENCRYPTION_KEY=isi-random-panjang
```

Jalankan app via PM2, lalu Nginx reverse proxy ke `127.0.0.1:4177`.

Untuk update berikutnya:

```bash
cd /var/www/ruank-insight-app
git pull
npm install
npm run build
pm2 restart ruank-insight
sudo systemctl reload nginx
```

## PM2 Mode

Kalau ingin app dijalankan via PM2, gunakan config `ecosystem.config.cjs`.

Command di server:

```bash
cd /var/www/ruank-insight-app
npm install
npm run build
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Untuk update:

```bash
cd /var/www/ruank-insight-app
git pull
npm install
npm run build
pm2 restart ruank-insight
```

Jika memakai PM2, Nginx bisa diarahkan sebagai reverse proxy ke `127.0.0.1:4177`.

Contoh server block:

```nginx
server {
    listen 80;
    server_name insight.dausmhf.com;

    location / {
        proxy_pass http://127.0.0.1:4177;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deploy Manual Tanpa Git

Upload isi folder `dist/` ke `/var/www/ruank-insight`, lalu pakai `deploy-nginx.conf` default.

Command di server:

```bash
sudo apt update
sudo apt install -y nginx unzip
sudo mkdir -p /var/www/ruank-insight
sudo chown -R $USER:$USER /var/www/ruank-insight
```

Setelah file website terupload:

```bash
sudo cp deploy-nginx.conf /etc/nginx/sites-available/ruank-insight
sudo ln -sf /etc/nginx/sites-available/ruank-insight /etc/nginx/sites-enabled/ruank-insight
sudo nginx -t
sudo systemctl reload nginx
```

Aktifkan SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d insight.dausmhf.com
```

## Catatan Sistem Live

Versi ini sudah punya backend Node untuk multi-client/multi-account:

- Facebook Login / Meta OAuth via Pages
- callback `/api/meta/callback`
- encrypted token storage di file lokal server
- dashboard API `/api/dashboard`
- media fetch dan insight fetch awal dari Meta Graph API

Mode multi-client membutuhkan akun Instagram Professional yang terhubung ke Facebook Page.
Permission Meta yang perlu aktif/valid:

- `pages_show_list`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_manage_insights`

Untuk produksi jangka panjang, storage file lokal sebaiknya dipindah ke PostgreSQL dan daily sync cron.
