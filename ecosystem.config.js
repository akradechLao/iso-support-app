module.exports = {
  apps: [
    {
      name: "iso-support-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: "/www/wwwroot/iso-support-app/app",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      // Instance config
      instances: 1,
      exec_mode: "fork",

      // Memory management
      max_memory_restart: "1G",

      // Watch config (disabled for production)
      watch: false,

      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/www/wwwlogs/pm2-error.log",
      out_file: "/www/wwwlogs/pm2-out.log",
      merge_logs: true,
      log_type: "json",

      // Restart config
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,

      // Advanced
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: false,
    },
  ],
};
