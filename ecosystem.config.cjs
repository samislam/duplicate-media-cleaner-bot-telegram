module.exports = {
  apps: [
    {
      name: 'telegram-media-cleaner-bot',
      script: './src/index.ts', // Your entry point
      interpreter: '/root/.bun/bin/bun', // Full path to Bun
      args: '', // Additional arguments, if needed
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '4G',
      exec_mode: 'fork', // Use 'fork' mode since 'cluster' can conflict with some setups
    },
  ],
}
