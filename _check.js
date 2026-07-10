const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  const p = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 5
  });
  const [r] = await p.execute('SELECT COUNT(*) AS c FROM ip_check_history');
  console.log('ip_check_history total rows:', r[0].c);
  const [r2] = await p.execute("SELECT COUNT(*) AS c FROM ip_check_history WHERE json_data IS NOT NULL AND (JSON_EXTRACT(json_data, '$.reports') IS NULL OR JSON_EXTRACT(json_data, '$.reports') = JSON_ARRAY())");
  console.log('history rows missing reports:', r2[0].c);
  const [r3] = await p.execute("SELECT COUNT(*) AS c FROM ip_abuse_json WHERE JSON_EXTRACT(json_data, '$.reports') IS NULL OR JSON_EXTRACT(json_data, '$.reports') = JSON_ARRAY()");
  console.log('blacklist rows missing reports:', r3[0].c);
  const [r4] = await p.execute('SELECT COUNT(*) AS c FROM blacklist_snapshot');
  console.log('blacklist_snapshot rows:', r4[0].c);
  await p.end();
})();
