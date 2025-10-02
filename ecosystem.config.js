module.exports = {
  apps: [{
    name: 'excel-rr-search',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/excel-rr-search',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/www/excel-rr-search/logs/error.log',
    out_file: '/var/www/excel-rr-search/logs/output.log',
    log_file: '/var/www/excel-rr-search/logs/combined.log',
    time: true,
    merge_logs: true
  }]
};
