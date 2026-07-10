const fs = require('fs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function getConn() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: 30000,
  });
}

(async () => {
  const c = await getConn();

  // Drop old table if exists, create new one
  await c.query('DROP TABLE IF EXISTS ip_abuse_json');
  await c.query(`
    CREATE TABLE ip_abuse_json (
      ip_address VARCHAR(45) NOT NULL PRIMARY KEY,
      json_data JSON NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
  `);
  console.log('Table ip_abuse_json created');
  await c.end();

  // Read file line by line, insert one by one
  const stream = fs.createReadStream('blacklist_20260630.txt.json', {
    encoding: 'utf-8',
    highWaterMark: 4 * 1024 * 1024,
  });
  let buffer = '',
    lineCount = 0,
    conn = await getConn();

  for await (const chunk of stream) {
    buffer += chunk;
    while (buffer.includes('\n')) {
      const idx = buffer.indexOf('\n');
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (!line.trim()) continue;

      const obj = JSON.parse(line);
      const ip = obj.data.ipAddress;

      try {
        await conn.query(
          'INSERT INTO ip_abuse_json (ip_address, json_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data)',
          [ip, JSON.stringify(obj.data)],
        );
      } catch (err) {
        // Reconnect and retry
        console.error(
          `\nError at line ${lineCount + 1} (${ip}): ${err.message}. Reconnecting...`,
        );
        try {
          await conn.end();
        } catch (_) {}
        conn = await getConn();
        await conn.query(
          'INSERT INTO ip_abuse_json (ip_address, json_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE json_data = VALUES(json_data)',
          [ip, JSON.stringify(obj.data)],
        );
      }

      lineCount++;
      if (lineCount % 1000 === 0)
        process.stdout.write(`\rImported: ${lineCount}`);
    }
  }

  console.log(`\nDone! Total: ${lineCount} rows`);

  const [cnt] = await conn.query('SELECT COUNT(*) as cnt FROM ip_abuse_json');
  console.log('Rows in ip_abuse_json:', cnt[0].cnt);

  // Show sample
  const [sample] = await conn.query(
    'SELECT ip_address, JSON_KEYS(json_data) as keys FROM ip_abuse_json LIMIT 3',
  );
  for (const row of sample) {
    console.log(`  ${row.ip_address}: keys = ${JSON.stringify(row.keys)}`);
  }

  await conn.end();
})();
