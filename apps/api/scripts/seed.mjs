import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.resolve(__dirname, '..');

const isRemote = process.argv.includes('--remote');
const flag = isRemote ? '--remote' : '--local';

console.log(`🌱 Seeding D1 Database (${isRemote ? 'REMOTE' : 'LOCAL'})...`);

try {
  console.log('1. Applying Initial Schema Migration...');
  execSync(`npx wrangler d1 execute merch-band-d1 ${flag} --file=migrations/0001_initial.sql -y`, {
    cwd: apiDir,
    stdio: 'inherit'
  });

  console.log('2. Inserting Seed Products and Variants...');
  execSync(`npx wrangler d1 execute merch-band-d1 ${flag} --file=migrations/0002_seed.sql -y`, {
    cwd: apiDir,
    stdio: 'inherit'
  });

  console.log('3. Inserting Tour Tickets Products and Variants...');
  execSync(`npx wrangler d1 execute merch-band-d1 ${flag} --file=migrations/0003_tour_tickets.sql -y`, {
    cwd: apiDir,
    stdio: 'inherit'
  });

  console.log('✅ D1 Database successfully seeded!');
} catch (err) {
  console.error('❌ Failed to seed D1 database:', err);
  process.exit(1);
}
