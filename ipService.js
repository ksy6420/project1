const axios = require('axios');

const ABUSEIPDB_CHECK_URL = 'https://api.abuseipdb.com/api/v2/check';
const ABUSEIPDB_BLACKLIST_URL = 'https://api.abuseipdb.com/api/v2/blacklist';

const COUNTRY_NAMES = {
  AF: 'Afghanistan',
  AX: 'Aland Islands',
  AL: 'Albania',
  DZ: 'Algeria',
  AS: 'American Samoa',
  AD: 'Andorra',
  AO: 'Angola',
  AI: 'Anguilla',
  AQ: 'Antarctica',
  AG: 'Antigua and Barbuda',
  AR: 'Argentina',
  AM: 'Armenia',
  AW: 'Aruba',
  AU: 'Australia',
  AT: 'Austria',
  AZ: 'Azerbaijan',
  BS: 'Bahamas',
  BH: 'Bahrain',
  BD: 'Bangladesh',
  BB: 'Barbados',
  BY: 'Belarus',
  BE: 'Belgium',
  BZ: 'Belize',
  BJ: 'Benin',
  BM: 'Bermuda',
  BT: 'Bhutan',
  BO: 'Bolivia',
  BQ: 'Bonaire',
  BA: 'Bosnia and Herzegovina',
  BW: 'Botswana',
  BV: 'Bouvet Island',
  BR: 'Brazil',
  IO: 'British Indian Ocean Territory',
  BN: 'Brunei Darussalam',
  BG: 'Bulgaria',
  BF: 'Burkina Faso',
  BI: 'Burundi',
  KH: 'Cambodia',
  CM: 'Cameroon',
  CA: 'Canada',
  CV: 'Cape Verde',
  KY: 'Cayman Islands',
  CF: 'Central African Republic',
  TD: 'Chad',
  CL: 'Chile',
  CN: 'China',
  CX: 'Christmas Island',
  CC: 'Cocos Islands',
  CO: 'Colombia',
  KM: 'Comoros',
  CG: 'Congo',
  CD: 'Congo (DRC)',
  CK: 'Cook Islands',
  CR: 'Costa Rica',
  CI: "Cote d'Ivoire",
  HR: 'Croatia',
  CU: 'Cuba',
  CW: 'Curacao',
  CY: 'Cyprus',
  CZ: 'Czech Republic',
  DK: 'Denmark',
  DJ: 'Djibouti',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  EC: 'Ecuador',
  EG: 'Egypt',
  SV: 'El Salvador',
  GQ: 'Equatorial Guinea',
  ER: 'Eritrea',
  EE: 'Estonia',
  ET: 'Ethiopia',
  FK: 'Falkland Islands',
  FO: 'Faroe Islands',
  FJ: 'Fiji',
  FI: 'Finland',
  FR: 'France',
  GF: 'French Guiana',
  PF: 'French Polynesia',
  TF: 'French Southern Territories',
  GA: 'Gabon',
  GM: 'Gambia',
  GE: 'Georgia',
  DE: 'Germany',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GR: 'Greece',
  GL: 'Greenland',
  GD: 'Grenada',
  GP: 'Guadeloupe',
  GU: 'Guam',
  GT: 'Guatemala',
  GG: 'Guernsey',
  GN: 'Guinea',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HT: 'Haiti',
  HM: 'Heard Island',
  VA: 'Holy See',
  HN: 'Honduras',
  HK: 'Hong Kong',
  HU: 'Hungary',
  IS: 'Iceland',
  IN: 'India',
  ID: 'Indonesia',
  IR: 'Iran',
  IQ: 'Iraq',
  IE: 'Ireland',
  IM: 'Isle of Man',
  IL: 'Israel',
  IT: 'Italy',
  JM: 'Jamaica',
  JP: 'Japan',
  JE: 'Jersey',
  JO: 'Jordan',
  KZ: 'Kazakhstan',
  KE: 'Kenya',
  KI: 'Kiribati',
  KP: 'North Korea',
  KR: 'South Korea',
  KW: 'Kuwait',
  KG: 'Kyrgyzstan',
  LA: 'Laos',
  LV: 'Latvia',
  LB: 'Lebanon',
  LS: 'Lesotho',
  LR: 'Liberia',
  LY: 'Libya',
  LI: 'Liechtenstein',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MO: 'Macao',
  MK: 'North Macedonia',
  MG: 'Madagascar',
  MW: 'Malawi',
  MY: 'Malaysia',
  MV: 'Maldives',
  ML: 'Mali',
  MT: 'Malta',
  MH: 'Marshall Islands',
  MQ: 'Martinique',
  MR: 'Mauritania',
  MU: 'Mauritius',
  YT: 'Mayotte',
  MX: 'Mexico',
  FM: 'Micronesia',
  MD: 'Moldova',
  MC: 'Monaco',
  MN: 'Mongolia',
  ME: 'Montenegro',
  MS: 'Montserrat',
  MA: 'Morocco',
  MZ: 'Mozambique',
  MM: 'Myanmar',
  NA: 'Namibia',
  NR: 'Nauru',
  NP: 'Nepal',
  NL: 'Netherlands',
  NC: 'New Caledonia',
  NZ: 'New Zealand',
  NI: 'Nicaragua',
  NE: 'Niger',
  NG: 'Nigeria',
  NU: 'Niue',
  NF: 'Norfolk Island',
  MP: 'Northern Mariana Islands',
  NO: 'Norway',
  OM: 'Oman',
  PK: 'Pakistan',
  PW: 'Palau',
  PS: 'Palestine',
  PA: 'Panama',
  PG: 'Papua New Guinea',
  PY: 'Paraguay',
  PE: 'Peru',
  PH: 'Philippines',
  PN: 'Pitcairn',
  PL: 'Poland',
  PT: 'Portugal',
  PR: 'Puerto Rico',
  QA: 'Qatar',
  RE: 'Reunion',
  RO: 'Romania',
  RU: 'Russian Federation',
  RW: 'Rwanda',
  BL: 'Saint Barthélemy',
  SH: 'Saint Helena',
  KN: 'Saint Kitts and Nevis',
  LC: 'Saint Lucia',
  MF: 'Saint Martin',
  PM: 'Saint Pierre and Miquelon',
  VC: 'Saint Vincent and the Grenadines',
  WS: 'Samoa',
  SM: 'San Marino',
  ST: 'Sao Tome and Principe',
  SA: 'Saudi Arabia',
  SN: 'Senegal',
  RS: 'Serbia',
  SC: 'Seychelles',
  SL: 'Sierra Leone',
  SG: 'Singapore',
  SX: 'Sint Maarten',
  SK: 'Slovakia',
  SI: 'Slovenia',
  SB: 'Solomon Islands',
  SO: 'Somalia',
  ZA: 'South Africa',
  GS: 'South Georgia and the South Sandwich Islands',
  SS: 'South Sudan',
  ES: 'Spain',
  LK: 'Sri Lanka',
  SD: 'Sudan',
  SR: 'Suriname',
  SJ: 'Svalbard and Jan Mayen',
  SZ: 'Swaziland',
  SE: 'Sweden',
  CH: 'Switzerland',
  SY: 'Syrian Arab Republic',
  TW: 'Taiwan',
  TJ: 'Tajikistan',
  TZ: 'Tanzania',
  TH: 'Thailand',
  TL: 'Timor-Leste',
  TG: 'Togo',
  TK: 'Tokelau',
  TO: 'Tonga',
  TT: 'Trinidad and Tobago',
  TN: 'Tunisia',
  TR: 'Turkey',
  TM: 'Turkmenistan',
  TC: 'Turks and Caicos Islands',
  TV: 'Tuvalu',
  UG: 'Uganda',
  UA: 'Ukraine',
  AE: 'United Arab Emirates',
  GB: 'United Kingdom',
  US: 'United States',
  UM: 'United States Minor Outlying Islands',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VU: 'Vanuatu',
  VE: 'Venezuela',
  VN: 'Vietnam',
  VG: 'Virgin Islands (British)',
  VI: 'Virgin Islands (US)',
  WF: 'Wallis and Futuna',
  EH: 'Western Sahara',
  YE: 'Yemen',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};

function getCountryName(code) {
  return code ? COUNTRY_NAMES[code] || code : null;
}

function mapApiData(apiData, ipAddress) {
  return {
    ipAddress: apiData.ipAddress || ipAddress,
    domain: apiData.domain || null,
    hostnames: apiData.hostnames || [],
    isWhitelisted: apiData.isWhitelisted === true,
    abuseConfidenceScore: apiData.abuseConfidenceScore || 0,
    totalReports: apiData.totalReports || 0,
    numDistinctUsers: apiData.numDistinctUsers || 0,
    countryName: getCountryName(apiData.countryCode),
    countryCode: apiData.countryCode || null,
    usageType: apiData.usageType || null,
    isp: apiData.isp || null,
    lastReportedAt: apiData.lastReportedAt || null,
    requestTime: apiData.requestTime || null,
    reports: apiData.reports || [],
    isPublic: apiData.isPublic || false,
    isTor: apiData.isTor || false,
    ipVersion: apiData.ipVersion || 4,
  };
}

async function ensureHistoryTable(pool) {
  try {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS ip_check_history (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        json_data JSON NOT NULL,
        checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ip_address (ip_address),
        INDEX idx_checked_at (checked_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    );
    try {
      await pool.execute(
        `ALTER TABLE ip_check_history DROP COLUMN is_external_fetch`,
      );
    } catch (_) {}
  } catch (err) {
    console.error('[DB] ip_check_history 테이블 생성 실패:', err.message);
  }
}

async function ensureBlacklistTable(pool) {
  try {
    await pool.execute(
      `ALTER TABLE ip_abuse_json ADD COLUMN is_api_sourced TINYINT(1) NOT NULL DEFAULT 0 AFTER json_data`,
    );
  } catch (_) {}
  try {
    await pool.execute(
      `ALTER TABLE ip_abuse_json ADD COLUMN checked_at DATETIME NULL DEFAULT NULL AFTER is_api_sourced`,
    );
  } catch (_) {}
  try {
    await pool.execute(
      `ALTER TABLE ip_abuse_json ADD INDEX idx_checked_at (checked_at)`,
    );
  } catch (_) {}
  try {
    await pool.execute(`ALTER TABLE ip_abuse_json DROP COLUMN is_fetched`);
  } catch (_) {}
}

async function ensureBlacklistDailyTable(pool) {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS blacklist_daily (
        snapshot_date DATE NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        json_data JSON NOT NULL,
        PRIMARY KEY (snapshot_date, ip_address),
        INDEX idx_ip_address (ip_address)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      PARTITION BY RANGE COLUMNS(snapshot_date) (
        PARTITION p_initial VALUES LESS THAN ('2026-01-01'),
        PARTITION p_future VALUES LESS THAN MAXVALUE
      )
    `);
    await ensureDailyPartitions(pool);
  } catch (err) {
    console.error('[DB] blacklist_daily 테이블 생성 실패:', err.message);
  }
}

async function ensureDailyPartitions(pool) {
  const today = new Date();
  for (let i = 0; i <= 2; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const lessThan = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(nextMonth.getDate()).padStart(2, '0')}`;
    const pName = 'p_' + y + '_' + m;
    try {
      await pool.execute(
        'ALTER TABLE blacklist_daily REORGANIZE PARTITION p_future INTO (PARTITION ' +
          pName +
          " VALUES LESS THAN ('" +
          lessThan +
          "'), PARTITION p_future VALUES LESS THAN MAXVALUE)",
      );
    } catch (_) {}
  }
  for (let i = -3; i < 0; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    try {
      await pool.execute(
        'ALTER TABLE blacklist_daily DROP PARTITION p_' + y + '_' + m,
      );
    } catch (_) {}
  }
}

async function fetchDailyBlacklist(pool) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) {
    console.error('[Blacklist] ABUSEIPDB_API_KEY가 설정되지 않았습니다.');
    return 0;
  }

  try {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const [[{ cnt }]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM blacklist_daily WHERE snapshot_date = ?',
      [today],
    );
    if (cnt > 0) {
      console.log(
        '[Blacklist] 오늘 데이터가 이미 존재합니다. API 호출을 건너뜁니다.',
        today,
      );
      return 0;
    }

    const response = await axios.get(ABUSEIPDB_BLACKLIST_URL, {
      params: { confidenceMinimum: 25, limit: parseInt(process.env.BLACKLIST_LIMIT, 10) || 500000 },
      headers: { Key: apiKey, Accept: 'application/json' },
      timeout: 30000,
    });

    const { data } = response.data;
    if (!data || data.length === 0) return 0;

    const placeholders = data.map(() => '(?, ?, ?)').join(',');
    const flat = [];
    for (const item of data) {
      flat.push(today, item.ipAddress, JSON.stringify(item));
    }

    await pool.execute(
      'INSERT IGNORE INTO blacklist_daily (snapshot_date, ip_address, json_data) VALUES ' +
        placeholders,
      flat,
    );
    return data.length;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error(
        '[Blacklist] API 요청 한도를 초과했습니다. 내일 다시 시도합니다.',
      );
    } else {
      console.error('[Blacklist Fetch Error]', error.message);
    }
    return 0;
  }
}

async function saveToBlacklist(pool, ipAddress, apiData) {
  const jsonStr = JSON.stringify(apiData);
  await pool.execute(
    `INSERT INTO ip_abuse_json (ip_address, json_data, is_api_sourced, checked_at) VALUES (?, ?, 1, NOW())
     ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), is_api_sourced = 1, checked_at = NOW()`,
    [ipAddress, jsonStr],
  );
}

async function fetchFromAbuseIpDb(ipAddress) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) {
    throw new Error('ABUSEIPDB_API_KEY가 .env에 설정되지 않았습니다.');
  }

  const response = await axios.get(ABUSEIPDB_CHECK_URL, {
    params: { ipAddress, maxAgeInDays: 90 },
    headers: {
      Key: apiKey,
      Accept: 'application/json',
    },
    timeout: 10000,
  });

  return response.data.data;
}

async function saveHistory(pool, ipAddress, apiData) {
  try {
    const jsonStr = JSON.stringify(apiData);
    await pool.execute(
      `INSERT INTO ip_check_history (ip_address, json_data) VALUES (?, ?)`,
      [ipAddress, jsonStr],
    );
  } catch (err) {
    console.error('[saveHistory Error] IP:', ipAddress, err.message);
  }
}

function buildResult(row, isExternal) {
  const json =
    typeof row.json_data === 'string'
      ? JSON.parse(row.json_data)
      : row.json_data;

  return {
    data: {
      ...mapApiData(json, row.ip_address),
      isExternalFetch: isExternal,
    },
  };
}

async function checkIpFromLocalDb(pool, ipAddress) {
  try {
    const [blackRows] = await pool.execute(
      `SELECT ip_address, json_data FROM ip_abuse_json WHERE ip_address = ?`,
      [ipAddress],
    );

    if (blackRows.length > 0) {
      return buildResult(blackRows[0], false);
    }

    const [historyRows] = await pool.execute(
      `SELECT ip_address, json_data FROM ip_check_history WHERE ip_address = ? ORDER BY checked_at DESC LIMIT 1`,
      [ipAddress],
    );

    if (historyRows.length > 0) {
      return buildResult(historyRows[0], true);
    }

    const apiData = await fetchFromAbuseIpDb(ipAddress);
    const score = apiData.abuseConfidenceScore || 0;

    if (score >= 25) {
      await saveToBlacklist(pool, ipAddress, apiData);
    } else {
      await saveHistory(pool, ipAddress, apiData);
    }

    return {
      data: {
        ...mapApiData(apiData, ipAddress),
        isExternalFetch: true,
      },
    };
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error(
        'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('외부 IP 조회 API 연결 시간이 초과되었습니다.');
    }
    console.error('[IP Service Error]', error.message);
    throw new Error(error.message || 'IP 정보 조회 중 오류가 발생했습니다.');
  }
}

async function getHistoryByDate(pool, dateStr) {
  try {
    const [rows] = await pool.execute(
      `SELECT ip_address, json_data, checked_at FROM ip_check_history WHERE DATE(checked_at) = ? ORDER BY checked_at DESC`,
      [dateStr],
    );
    return rows.map((row) => ({
      ip: row.ip_address,
      checkedAt: row.checked_at,
      ...JSON.parse(row.json_data),
    }));
  } catch (error) {
    console.error('[getHistoryByDate Error]', error.message);
    throw error;
  }
}

async function getBlacklistByDate(pool, dateStr, page = 1, limit = 200) {
  try {
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM blacklist_daily WHERE snapshot_date = ?',
      [dateStr],
    );
    const [rows] = await pool.query(
      'SELECT ip_address, json_data FROM blacklist_daily WHERE snapshot_date = ? ORDER BY ip_address LIMIT ? OFFSET ?',
      [dateStr, limit, offset],
    );
    return {
      data: rows.map((row) => {
        const parsed =
          typeof row.json_data === 'string'
            ? JSON.parse(row.json_data)
            : row.json_data;
        return {
          ip: row.ip_address,
          ...parsed,
          countryName: getCountryName(parsed.countryCode),
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[getBlacklistByDate Error]', error.message);
    throw error;
  }
}

async function searchIpInBlacklist(pool, ip, dateStr, limit = 200) {
  try {
    const [allDateRows] = await pool.query(
      'SELECT DISTINCT snapshot_date FROM blacklist_daily WHERE ip_address = ? ORDER BY snapshot_date DESC',
      [ip],
    );
    const allDates = allDateRows.map((r) => {
      const d = new Date(r.snapshot_date);
      return (
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0')
      );
    });

    if (dateStr) {
      const [[{ total }]] = await pool.query(
        'SELECT COUNT(*) AS total FROM blacklist_daily WHERE snapshot_date = ?',
        [dateStr],
      );
      const [[{ rank }]] = await pool.query(
        'SELECT COUNT(*) AS rank FROM blacklist_daily WHERE snapshot_date = ? AND ip_address <= ?',
        [dateStr, ip],
      );
      const [rows] = await pool.query(
        'SELECT ip_address, json_data FROM blacklist_daily WHERE snapshot_date = ? AND ip_address = ?',
        [dateStr, ip],
      );
      const found = rows.length > 0;
      const page = found ? Math.ceil(rank / limit) : 1;
      return {
        found,
        dates: allDates,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }

    return { found: allDates.length > 0, dates: allDates };
  } catch (error) {
    console.error('[searchIpInBlacklist Error]', error.message);
    throw error;
  }
}

module.exports = {
  checkIpFromLocalDb,
  getHistoryByDate,
  getBlacklistByDate,
  searchIpInBlacklist,
  ensureHistoryTable,
  ensureBlacklistTable,
  ensureBlacklistDailyTable,
  fetchDailyBlacklist,
  ensureDailyPartitions,
};
