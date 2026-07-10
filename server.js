const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // 비밀번호 해싱을 위한 bcrypt 모듈
const path = require('path');

const {
  checkIpFromLocalDb,
  getHistoryByDate,
  getBlacklistByDate,
  searchIpInBlacklist,
  ensureHistoryTable,
  ensureBlacklistTable,
  ensureBlacklistDailyTable,
  fetchDailyBlacklist,
  ensureDailyPartitions,
} = require('./ipService');

const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_SECRET',
];
REQUIRED_ENV_VARS.forEach((key) => {
  if (!process.env[key]) {
    console.error(
      `[설정 오류] 환경변수 ${key}가 누락되었습니다. .env 파일을 확인해주세요.`,
    );
    process.exit(1);
  }
});

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json()); // JSON 요청 본문을 파싱하기 위한 미들웨어

// DB 연결 설정
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
});

async function testDBConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('[DB] 데이터베이스 연결 성공!'); // 성공 확인용 로그 추가
  } catch (error) {
    // ⭕ 에러 원인을 화면에 출력하도록 수정!
    console.error('❌ [DB 연결 실패 원인]:', error.message);
    process.exit(1);
  }
}

// Swagger 설정
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: '관리자 API 문서',
    version: '2.0.0',
    description: '관리자용 API 문서입니다.',
    contact: { name: '관리자' },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'API 서버',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰을 사용한 인증 방식입니다.',
      },
    },
  },
  paths: {
    '/api/v2/auth/login': {
      post: {
        summary: '관리자 로그인 및 토큰 발급',
        description:
          '아이디(또는 이메일)와 비밀번호를 검증하여 일치할 경우 Access Token과 Refresh Token을 발급합니다.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: {
                  user_id: {
                    type: 'string',
                    description: '사용자 아이디',
                    example: 'admin@01',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: '사용자 이메일',
                    example: 'admin@01',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    description: '비밀번호',
                    example: 'devpassword12!',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: '로그인 성공' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        userId: { type: 'string' },
                        userName: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: '인증 실패' },
          500: { description: '서버 내부 오류' },
        },
      },
    },
    '/api/v2/auth/refresh': {
      post: {
        summary: 'Access Token 재발급 (Silent Refresh)',
        description:
          'DB 내 Refresh Token 유효성 검증 후 새로운 Access Token을 발급합니다.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: {
                    type: 'string',
                    description: '리프레시 토큰',
                    example: 'eyJhbGciOiJIUzI1NiIsIn...',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: '토큰 재발급 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { accessToken: { type: 'string' } },
                },
              },
            },
          },
          400: { description: '필수 값 누락' },
          403: { description: '유효하지 않은 리프레시 토큰' },
        },
      },
    },
    '/api/v2/auth/logout': {
      post: {
        summary: '사용자 로그아웃 및 토큰 폐기',
        description: 'DB의 refresh_token 값을 제거하여 로그아웃 처리합니다.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['user_id'],
                properties: {
                  user_id: {
                    type: 'string',
                    description: '로그아웃 대상 사용자 ID',
                    example: 'admin@01',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '로그아웃 성공' },
          400: { description: '필수 유저 정보 누락' },
          500: { description: '데이터베이스 에러' },
        },
      },
    },
    '/api/v2/ip/check': {
      get: {
        summary: 'IP 주소 위협 정보 조회',
        description:
          '로컬 DB에서 IP의 블랙리스트 등록 여부 및 위협 점수를 조회합니다.',
        tags: ['IP Check'],
        parameters: [
          {
            name: 'ip',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: '조회할 IP 주소',
            example: '8.8.8.8',
          },
        ],
        responses: {
          200: {
            description: 'IP 정보 조회 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        ipAddress: { type: 'string' },
                        domain: { type: 'string' },
                        hostnames: { type: 'array', items: { type: 'string' } },
                        isWhitelisted: { type: 'boolean' },
                        abuseConfidenceScore: { type: 'integer' },
                        totalReports: { type: 'integer' },
                        numDistinctUsers: { type: 'integer' },
                        countryName: { type: 'string' },
                        countryCode: { type: 'string' },
                        usageType: { type: 'string' },
                        isp: { type: 'string' },
                        lastReportedAt: { type: 'string' },
                        requestTime: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'IP 주소 누락' },
          500: { description: '서버 내부 오류' },
        },
      },
    },
  },
};

app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerSpec));
app.use(
  '/swagger-static',
  express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')),
);
app.get('/api-docs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>API 문서</title>
  <link rel="stylesheet" href="/swagger-static/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/swagger-static/swagger-ui-bundle.js"></script>
  <script src="/swagger-static/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api-docs/swagger.json',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: 'StandaloneLayout'
    });
  </script>
</body>
</html>`);
});

// 관리자 로그인 및 토큰 발급 (POST /api/v2/auth/login)
app.post('/api/v2/auth/login', async (req, res) => {
  const { user_id, email, password } = req.body;
  const identifier = user_id || email;

  try {
    const [rows] = await pool.query('SELECT * FROM tb_user WHERE user_id = ?', [
      identifier,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: '존재하지 않는 계정입니다.' });
    }

    const user = rows[0];
    const dbPassword = String(user.password).trim();
    let isMatch = false;

    // Bcrypt 암호화 형태($2b$, $2a$)인지 체크하여 대조 진행
    if (dbPassword.startsWith('$2b$') || dbPassword.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(password, dbPassword);
    } else {
      isMatch = dbPassword === password;
    }

    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, userName: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    // DB에 생성된 Refresh Token을 업데이트
    await pool.query('UPDATE tb_user SET refresh_token = ? WHERE user_id = ?', [
      refreshToken,
      user.user_id,
    ]);

    // 프론트엔드로 토큰 세트와 사용자 기본 정보 반환
    return res.json({
      message: '로그인 성공',
      accessToken,
      refreshToken,
      user: {
        userId: user.user_id,
        userName: user.user_name,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error.message);
    return res
      .status(500)
      .json({ message: '로그인 처리 중 서버 내부 오류가 발생했습니다.' });
  }
});

// Refresh Token을 이용한 Access Token 재발급 (POST /api/v2/auth/refresh)
app.post('/api/v2/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: '인증 갱신을 위해 Refresh Token이 필요합니다.' });
  }

  try {
    // Refresh Token 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // 토큰 안의 유저 ID와 DB에 저장된 Refresh Token을 대조하여 유효성 확인
    const [rows] = await pool.query(
      'SELECT * FROM tb_user WHERE user_id = ? AND refresh_token = ?',
      [decoded.userId, refreshToken],
    );

    if (rows.length === 0) {
      return res
        .status(403)
        .json({ message: '유효하지 않거나 만료된 Refresh Token입니다.' });
    }

    const user = rows[0];

    const newAccessToken = jwt.sign(
      { userId: user.user_id, userName: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );

    // 프론트엔드로 새로운 Access Token 반환
    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('[Refresh Error]:', error.message);
    return res.status(403).json({ message: '토큰 인증에 실패했습니다.' });
  }
});

// 로그아웃 시 데이터베이스의 세션 Refresh Token을 날려 토큰 재탈취 방어 (POST /api/v2/auth/logout)
app.post('/api/v2/auth/logout', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: '로그아웃을 요청한 유저의 정보가 필요합니다.' });
  }

  try {
    await pool.query(
      'UPDATE tb_user SET refresh_token = NULL WHERE user_id = ?',
      [user_id],
    );
    return res.status(200).json({
      message: '성공적으로 로그아웃 되었습니다. 세션 토큰이 폐기되었습니다.',
    });
  } catch (error) {
    return res.status(500).json({
      message: '로그아웃 처리 중 데이터베이스 연동 에러가 발생했습니다.',
    });
  }
});

// IP 위협 정보 조회 (GET /api/v2/ip/check?ip=1.1.1.1)
app.get('/api/v2/ip/check', async (req, res) => {
  const ip = req.query.ip;

  if (!ip) {
    return res.status(400).json({ message: '조회할 IP 주소를 입력해주세요.' });
  }

  try {
    const result = await checkIpFromLocalDb(pool, ip);
    return res.json(result);
  } catch (error) {
    console.error('[IP Check Error]:', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// IP 검색 이력 날짜별 조회 (GET /api/v2/ip/history?date=2025-01-01)
app.get('/api/v2/ip/history', async (req, res) => {
  const date = req.query.date;

  if (!date) {
    return res
      .status(400)
      .json({ message: '조회할 날짜를 입력해주세요. (YYYY-MM-DD)' });
  }

  try {
    const rows = await getHistoryByDate(pool, date);
    return res.json({ data: rows });
  } catch (error) {
    console.error('[History Error]:', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// 블랙리스트 날짜별 조회 (GET /api/v2/ip/blacklist?date=2025-01-01&page=1)
app.get('/api/v2/ip/blacklist', async (req, res) => {
  const date = req.query.date;
  const page = parseInt(req.query.page, 10) || 1;
  if (!date) {
    return res
      .status(400)
      .json({ message: '조회할 날짜를 입력해주세요. (YYYY-MM-DD)' });
  }
  try {
    const result = await getBlacklistByDate(pool, date, page);
    return res.json(result);
  } catch (error) {
    console.error('[Blacklist Error]:', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// 블랙리스트 IP 검색 (GET /api/v2/ip/blacklist/search?ip=1.1.220.166&date=2025-01-01)
app.get('/api/v2/ip/blacklist/search', async (req, res) => {
  const ip = req.query.ip;
  const date = req.query.date;
  if (!ip) {
    return res.status(400).json({ message: '검색할 IP 주소를 입력해주세요.' });
  }
  try {
    const result = await searchIpInBlacklist(pool, ip, date);
    return res.json(result);
  } catch (error) {
    console.error('[Blacklist Search Error]:', error.message);
    return res.status(500).json({ message: error.message });
  }
});

// 프론트엔드 정적 파일 serving
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// 프론트엔드 SPA 라우트 (API 라우트 다음에)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

testDBConnection().then(async () => {
  await ensureHistoryTable(pool);
  await ensureBlacklistTable(pool);
  await ensureBlacklistDailyTable(pool);

  app.listen(PORT, HOST, () => {
    console.log(`[Server] ${HOST}:${PORT}에서 실행 중`);
  });

  scheduleDailyBlacklistFetch(pool);
});

function scheduleDailyBlacklistFetch(pool) {
  fetchDailyBlacklist(pool);
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const msUntilMidnight = tomorrow.getTime() - now.getTime() + 5000;
  setTimeout(() => {
    fetchDailyBlacklist(pool);
    setInterval(() => fetchDailyBlacklist(pool), 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
  setInterval(() => ensureDailyPartitions(pool), 24 * 60 * 60 * 1000);
}
