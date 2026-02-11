/**
 * Startup Banner - Shows API Configuration Status
 * Only shown once when server starts
 */

// Use globalThis to persist across Next.js dev mode module re-evaluations
const g = globalThis as any;

function isAmadeusConfigured(): boolean {
  const apiKey = process.env.AMADEUS_API_KEY || '';
  const apiSecret = process.env.AMADEUS_API_SECRET || '';

  if (!apiKey || !apiSecret) {
    return false;
  }

  // Check for placeholder values
  const placeholders = ['your_', 'placeholder', 'REPLACE_', 'xxx', 'KEY_HERE', 'SECRET_HERE'];
  const keyLower = apiKey.toLowerCase();
  const secretLower = apiSecret.toLowerCase();

  for (const placeholder of placeholders) {
    if (keyLower.includes(placeholder.toLowerCase()) || secretLower.includes(placeholder.toLowerCase())) {
      return false;
    }
  }

  // ✅ FIX: Amadeus API keys are 32 chars, secrets can be 16-32 chars
  // Check for reasonable minimum length (not arbitrary 20)
  if (apiKey.length < 16 || apiSecret.length < 16) {
    return false;
  }

  return true;
}

export function showStartupBanner() {
  // Only show once per server start (globalThis persists across module re-imports)
  if (g.__startupBannerShown || process.env.NODE_ENV !== 'development') {
    return;
  }

  g.__startupBannerShown = true;

  const amadeusConfigured = isAmadeusConfigured();

  const duffelConfigured = !!(
    process.env.DUFFEL_ACCESS_TOKEN &&
    !process.env.DUFFEL_ACCESS_TOKEN.includes('your_') &&
    process.env.DUFFEL_ACCESS_TOKEN.startsWith('duffel_')
  );

  // Check all possible database URLs (Supabase, Neon, legacy)
  const dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const dbConfigured = !!(
    dbUrl &&
    !dbUrl.includes('placeholder') &&
    !dbUrl.includes('localhost')
  );

  const allConfigured = amadeusConfigured && duffelConfigured && dbConfigured;

  if (allConfigured) {
    // Everything is configured - show success message
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Fly2Any - All APIs Configured!');
    console.log('='.repeat(60));
    console.log('✅ Amadeus API (Flights & Cars)');
    console.log('✅ Duffel API (Flights & Hotels)');
    console.log('✅ Database (PostgreSQL)');
    console.log('='.repeat(60) + '\n');
  } else {
    // Some APIs missing - show helpful banner
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  Fly2Any - Running in DEMO MODE');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 API Status:');
    console.log(`  ${amadeusConfigured ? '✅' : '❌'} Amadeus API (Flights & Cars)`);
    console.log(`  ${duffelConfigured ? '✅' : '❌'} Duffel API (Flights & Hotels)`);
    console.log(`  ${dbConfigured ? '✅' : '❌'} Database (TripMatch & Analytics)`);
    console.log('');

    if (!amadeusConfigured || !duffelConfigured) {
      console.log('🎯 Want to test REAL flight/hotel APIs?');
      console.log('');
      console.log('   1. Get FREE test credentials (5 min):');
      console.log('      📖 See: SETUP_REAL_APIS.md');
      console.log('');
      console.log('   2. Amadeus: https://developers.amadeus.com/register');
      console.log('   3. Duffel: https://duffel.com/signup');
      console.log('');
    }

    console.log('💡 Currently using demo data for missing APIs');
    console.log('='.repeat(60) + '\n');
  }
}
