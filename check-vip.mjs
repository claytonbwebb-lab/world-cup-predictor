const { createClient } = require('@supabase/supabase-js');
const https = require('https');

async function getSecrets() {
  const token = require('fs').readFileSync('/tmp/vt3.txt', 'utf8').trim();
  const res = await fetch('https://api.vercel.com/v9/projects/prj_IprAlsyKyAptwSOOeIryrBwS43Lq/env', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const envs = {};
  for (const e of data.envs) envs[e.key] = e.value;
  return envs;
}

async function main() {
  const secrets = await getSecrets();
  const supabaseUrl = secrets.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = secrets.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || !supabaseUrl) {
    console.log('Missing keys in Vercel env');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: leagues, error } = await supabase
    .from('leagues')
    .select('id, name, code, is_vip')
    .eq('is_vip', true)
    .limit(5);

  if (error) {
    console.log('DB Error:', error.message);
    return;
  }
  console.log(JSON.stringify(leagues, null, 2));
}

main().catch(console.error);
