/**
 * PM2 ecosystem file for aircraft-leasing-poc.
 * From repo root: pm2 start ecosystem.config.cjs
 * Frontend (production): run "cd frontend && npm run build" once before starting.
 */
module.exports = {
  apps: [
    {
      name: "Aviation-Frontend",
      cwd: "./frontend",
      script: "node_modules/.bin/next",
      args: "start -p 3591 -H 0.0.0.0",
      interpreter: "none",
      env: { NODE_ENV: "production" },
      merge_logs: true,
    },
  ],
};
