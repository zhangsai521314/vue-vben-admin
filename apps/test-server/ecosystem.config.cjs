import { name } from './package.json';
import os from 'os';

module.exports = {
  apps: [
    {
      name,
      script: path.resolve(__dirname, './dist/index.js'),
      instances: os.cpus().length,
      autorestart: true,
      watch: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
    },
  ],
};
