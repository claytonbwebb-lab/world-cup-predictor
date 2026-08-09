#!/usr/bin/env node
/**
 * Run SQL migrations directly against Supabase Postgres using the service role key.
 * 
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   node scripts/run-migrations-pg.js [migration-prefix]
 *
 * Example - run only migration 010:
 *   node scripts/run-migrations-pg.js 010
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract host from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];
const host = `db.${projectRef}.supabase.co`;

const client = new Client({
  host,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: serviceKey,
  ssl: { rejectUnauthorized: false },
  connectionString: undefined,
});

async function run() {
  const targetArg = process.argv[2];
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let toRun = files;
  if (targetArg) {
    toRun = files.filter(f => f.startsWith(targetArg));
    if (toRun.length === 0) {
      console.error(`No migrations found starting with: ${targetArg}`);
      process.exit(1);
    }
  }

  try {
    console.log(`Connecting to ${host}...`);
    await client.connect();
    console.log('Connected ✅\n');

    for (const file of toRun) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`\nRunning: ${file}`);
      console.log('─'.repeat(50));
      
      try {
        await client.query(sql);
        console.log(`✅ ${file} — applied`);
      } catch (err) {
        if (err.code === '42P07' || err.code === '42710' || err.code === '23505') {
          // Table already exists or duplicate key — that's fine
          console.log(`⚠️  ${file} — skipped (already exists: ${err.code})`);
        } else if (err.code === '42723' || err.message.includes('does not exist')) {
          // Function/procedure doesn't exist — this is expected for some migrations
          console.log(`⚠️  ${file} — skipped (${err.code}): ${err.message.substring(0, 100)}`);
        } else {
          console.error(`❌ ${file} failed: ${err.message}`);
          // Continue with other migrations
        }
      }
    }

    console.log('\n\nDone!');
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
