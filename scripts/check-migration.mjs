/**
 * Script to check if the trading_pre_registrations table exists
 * Run with: node scripts/check-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkMigration() {
  console.log('Checking if trading_pre_registrations table exists...\n');

  try {
    // Try to query the table - if it exists, this will return (even if empty)
    const { data, error } = await supabase
      .from('trading_pre_registrations')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table does not exist
        console.log('❌ Migration NOT applied');
        console.log('   The trading_pre_registrations table does not exist.');
        console.log('\n   Please run the migration from:');
        console.log('   supabase/migrations/create_trading_pre_registrations_table.sql\n');
        return false;
      } else {
        console.error('❌ Error checking table:', error.message);
        console.error('   Error code:', error.code);
        return false;
      }
    }

    console.log('✅ Migration applied successfully!');
    console.log('   The trading_pre_registrations table exists.');
    
    // Check table structure by trying to get a count
    const { count } = await supabase
      .from('trading_pre_registrations')
      .select('*', { count: 'exact', head: true });

    console.log(`   Current record count: ${count || 0}\n`);
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

checkMigration().then(success => {
  process.exit(success ? 0 : 1);
});
