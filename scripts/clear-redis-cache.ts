import { createClient } from 'redis';

async function clearCache() {
  const client = createClient({ url: 'redis://localhost:6379' });

  try {
    await client.connect();
    await client.flushDb();
    console.log('✅ Redis cache cleared successfully');
    await client.quit();
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

clearCache();
