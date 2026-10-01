#!/usr/bin/env node
/**
 * Apply migration 015_add_notifications.sql to the live PPW Supabase DB
 * via the Supabase pg endpoint (bypasses CLI connection-string issues).
 *
 * Usage: node scripts/apply-notification-migration.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function applyMigration() {
  const sql = readFileSync('supabase/migrations/015_add_notifications.sql', 'utf8');

  // Remove comments and split into meaningful statements
  const lines = sql.split('\n').filter(l => !l.trim().startsWith('--'));
  const cleaned = lines.join('\n');

  // Split on semicolons that terminate a statement
  const rawStmts = cleaned.split(';').map(s => s.trim()).filter(s => s.length > 0);

  // Merge multi-line CREATE statements that may have been over-split
  const stmts = [];
  let i = 0;
  while (i < rawStmts.length) {
    let stmt = rawStmts[i];
    // If the statement looks incomplete (starts with index, trigger, policy keywords
    // without a proper CREATE start), merge with next
    while (
      i + 1 < rawStmts.length &&
      /^(CREATE INDEX|CREATE TRIGGER|CREATE POLICY|DO \$\$|CREATE OR REPLACE FUNCTION)/i.test(stmt)
    ) {
      i++;
      stmt += '; ' + rawStmts[i];
    }
    stmts.push(stmt);
    i++;
  }

  console.log(`Applying ${stmts.length} statements...`);

  for (let idx = 0; idx < stmts.length; idx++) {
    const stmt = stmts[idx].trim();
    if (!stmt) continue;
    console.log(`  [${idx + 1}/${stmts.length}] ${stmt.slice(0, 70).replace(/\s+/g, ' ')}`);

    const { error } = await supabase.rpc('exec', { sql: stmt + ';' });
    if (error) {
      // Try direct SQL endpoint as fallback
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ sql: stmt + ';' }),
      });
      if (!res.ok) {
        const text = await res.text();
        // 404 or 400 with "function not found" means rpc approach not available
        if (res.status === 404 || text.includes('function not found')) {
          console.log('    -> pg_rpc exec() not available; trying anon endpoint workaround...');
          // Use the SQL tool via a POST to /rest/v1/ with _count header workaround isn't possible
          // Instead, check if table already exists and skip
          if (stmt.includes('CREATE TABLE')) {
            const tableName = stmt.match(/CREATE TABLE (\w+)/i)?.[1];
            if (tableName) {
              const { error: checkErr } = await supabase.from(tableName).select('id').limit(1);
              if (!checkErr) {
                console.log(`    -> Table ${tableName} already exists, skipping`);
                continue;
              }
            }
          }
          console.error(`    ERROR: ${text.slice(0, 200)}`);
          throw new Error(`Statement failed: ${stmt.slice(0, 80)}`);
        } else {
          console.error(`    ERROR: ${text.slice(0, 200)}`);
          throw new Error(`Statement failed: ${stmt.slice(0, 80)}`);
        }
      }
      const result = await res.json();
      if (result.error) {
        console.error(`    ERROR: ${JSON.stringify(result.error)}`);
        throw new Error(`Statement failed: ${stmt.slice(0, 80)}`);
      }
      console.log('    -> ok (via RPC)');
    } else {
      console.log('    -> ok');
    }
  }

  console.log('\nMigration complete.');
}

applyMigration().catch(err => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
