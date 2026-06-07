module.exports = {
  apps: [
    {
      name: 'ruank-insight',
      script: 'server.cjs',
      cwd: '/var/www/ruank-insight-app',
      env: {
        NODE_ENV: 'production',
        PORT: '4177',
        PUBLIC_BASE_URL: 'https://insight.dausmhf.com',
        META_REDIRECT_URI: 'https://insight.dausmhf.com/api/meta/callback'
      }
    }
  ]
};
