import { buildApp } from './app.js';
import { env } from './config/env.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    
    app.log.info(`🚀 API Gateway running at http://${env.HOST}:${env.PORT}`);
    app.log.info(`📝 Environment: ${env.NODE_ENV}`);
    app.log.info(`🔗 Health check: http://${env.HOST}:${env.PORT}/health`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    process.exit(0);
  });
});

main();
