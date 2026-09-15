const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const supabaseKey = '***;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRls() {
  console.log('Applying RLS fix to weeks table...');
  
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;'
  });
  
  if (rlsError) {
    console.error('Error enabling RLS:', rlsError);
    // Try direct SQL via REST if RPC doesn't exist
    const { error: sqlError } = await supabase.from('weeks').select('count', { count: 'exact', head: true });
    console.log('Weeks table accessible (this is the vulnerability):', !sqlError);
    process.exit(1);
  }
  
  console.log('RLS enabled successfully');
}

fixRls();
