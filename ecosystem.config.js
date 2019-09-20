module.exports = {
  apps: [
    {
      name: "PhoneNumberGeneratorAPI",
      script: "npm",
      args: "run start:node",
      kill_timeout: 2000,
      restart_delay: 2000,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_development: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      user: "node",
      host: "212.83.163.1",
      ref: "origin/master",
      repo: "https://github.com/rickynyairo/phonenum-generator",
      path: "/var/www/production",
      "post-deploy":
        "npm install && pm2-runtime reload ecosystem.config.js --env production"
    }
  }
};
