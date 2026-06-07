module.exports = {
  apps: [
    {
      name: 'ruank-insight',
      script: 'npm',
      args: 'run preview -- --host 127.0.0.1 --port 4177',
      cwd: '/var/www/ruank-insight-app',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
