import('./server.ts').catch(err => {
  console.error('Failed to load server.ts:', err);
  process.exit(1);
});
