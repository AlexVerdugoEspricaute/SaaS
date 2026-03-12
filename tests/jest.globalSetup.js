const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const root = path.resolve(__dirname, '..');
  const dbUrl = process.env.DATABASE_URL || 'file:./test.db';
  const env = { ...process.env, DATABASE_URL: dbUrl };

  // For sqlite test DBs, start from a clean file to keep tests deterministic.
  if (dbUrl === 'file:./test.db') {
    const testDbPath = path.join(root, 'prisma', 'test.db');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  }

  execSync('npx prisma migrate deploy', { cwd: root, stdio: 'inherit', env });
  execSync('node prisma/seed.js', { cwd: root, stdio: 'inherit', env });
};
