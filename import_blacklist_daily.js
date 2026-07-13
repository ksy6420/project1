const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const BLACKLIST_DIR = path.join(__dirname, 'blacklist');

async function getConn() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: 30000,
  });
}

async function ensureAllPartitions(conn) {
  const files = fs.readdirSync(BLACKLIST_DIR).filter(f => f.startsWith('blacklist_') && f.endsWith('.txt'));
  const dates = files.map(f => {
    const m = f.match(/blacklist_(\d{4})(\d{2})(\d{2})\.txt/);
    return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
  }).filter(Boolean).sort();

  const [existingParts] = await conn.query(
    "SELECT PARTITION_NAME FROM information_schema.PARTITIONS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'blacklist_daily'",
    [process.env.DB_DATABASE]
  );
  const existingNames = new Set(existingParts.map(r => r.PARTITION_NAME));

  const monthSet = new Set();
  for (const d of dates) {
    const ym = d.slice(0, 7);
    monthSet.add(ym);
  }

  for (const ym of monthSet) {
    const [y, m] = ym.split('-').map(Number);
    const nextM = m === 12 ? 1 : m + 1;
    const nextY = m === 12 ? y + 1 : y;
    const lessThan = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
    const pName = `p_${y}_${String(m).padStart(2, '0')}`;

    if (existingNames.has(pName)) continue;

    try {
      await conn.query(
        `ALTER TABLE blacklist_daily REORGANIZE PARTITION p_future INTO (PARTITION ${pName} VALUES LESS THAN ('${lessThan}'), PARTITION p_future VALUES LESS THAN MAXVALUE)`
      );
      console.log(`  Created partition ${pName} (< ${lessThan})`);
    } catch (err) {
      if (!err.message.includes('Duplicate partition name')) {
        console.error(`  Partition ${pName} error: ${err.message}`);
      }
    }
  }
}

async function main() {
  const conn = await getConn();

  const files = fs.readdirSync(BLACKLIST_DIR)
    .filter(f => f.startsWith('blacklist_') && f.endsWith('.txt'))
    .sort();

  console.log(`Found ${files.length} blacklist files`);

  await ensureAllPartitions(conn);

  let totalInserted = 0;

  for (const file of files) {
    const m = file.match(/blacklist_(\d{4})(\d{2})(\d{2})\.txt/);
    if (!m) continue;
    const snapshotDate = `${m[1]}-${m[2]}-${m[3]}`;
    const filePath = path.join(BLACKLIST_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const ips = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (ips.length === 0) {
      console.log(`  ${file}: 0 IPs (skipped)`);
      continue;
    }

    const batchSize = 5000;
    let inserted = 0;

    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(?, ?, ?)').join(',');
      const flat = [];
      for (const ip of batch) {
        flat.push(snapshotDate, ip, JSON.stringify({ ipAddress: ip }));
      }
      try {
        const [result] = await conn.query(
          `INSERT IGNORE INTO blacklist_daily (snapshot_date, ip_address, json_data) VALUES ${placeholders}`,
          flat
        );
        inserted += result.affectedRows;
      } catch (err) {
        console.error(`  ${file} batch error: ${err.message}`);
      }
    }

    totalInserted += inserted;
    console.log(`  ${snapshotDate}: ${inserted}/${ips.length} IPs inserted`);
  }

  console.log(`\nTotal inserted: ${totalInserted}`);

  const [cnt] = await conn.query('SELECT COUNT(DISTINCT snapshot_date) as dates, COUNT(*) as total FROM blacklist_daily');
  console.log(`Database now has ${cnt[0].total} rows across ${cnt[0].dates} dates`);

  await conn.end();
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
