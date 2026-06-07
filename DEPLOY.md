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

Serve output build dari:

```txt
/var/www/ruank-insight-app/dist
```

Lalu pasang Nginx config dari file `deploy-nginx.conf`. Jika memakai path git di atas, ubah `root` menjadi:

```nginx
root /var/www/ruank-insight-app/dist;
```

Untuk update berikutnya:

```bash
cd /var/www/ruank-insight-app
git pull
npm install
npm run build
sudo systemctl reload nginx
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

## Catatan MVP Sistem Sungguhan

Prototype ini masih frontend static dengan mock data. Untuk testing akun Reels sungguhan, backend berikut perlu dibuat sebelum Meta API bisa jalan:

- Meta OAuth callback
- PostgreSQL schema
- encrypted Instagram token storage
- daily sync job
- endpoint dashboard dari database
- secure share link validation

Frontend sudah disiapkan secara visual untuk alur itu: Dashboard utama, Client List, Social Media List, Settings Access, dan Client Share View.
