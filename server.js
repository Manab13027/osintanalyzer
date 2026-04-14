// Load TensorFlow Node.js backend BEFORE face-api.js to prevent "backend undefined" crash
require('@tensorflow/tfjs-node');

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const config = require('config');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { exec, execSync } = require('child_process');

// Patch face-api.js for Node.js (createCanvasElement is required to avoid 0-width canvas bug)
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData, createCanvasElement: () => canvas.createCanvas(1, 1) });

const cheerio = require('cheerio');

const app = express();
const PORT = config.get('server.port');
const OLLAMA_URL = config.get('ollama.url');
const DEFAULT_MODEL = config.get('ollama.defaultModel');
const MODEL_PATH = path.resolve(config.get('faceRecognition.modelPath'));
const CONFIDENCE_THRESHOLD = config.get('faceRecognition.confidenceThreshold');

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(__dirname));

// Upload storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      fs.ensureDirSync(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ===== STATE =====
let faceModelsLoaded = false;
let ollamaAvailable = false;
let subjectDescriptors = []; // stored face descriptors from uploaded photos

// ===== INITIALIZATION =====
async function loadFaceModels() {
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH),
      faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_PATH),
    ]);
    faceModelsLoaded = true;
    console.log('Face recognition models loaded (SSD MobileNet + TinyFaceDetector)');
  } catch (err) {
    console.error('Failed to load face models:', err.message);
  }
}

async function checkOllama() {
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    ollamaAvailable = true;
    const models = res.data.models.map(m => m.name);
    console.log('Ollama available. Models:', models.join(', '));
  } catch {
    ollamaAvailable = false;
    console.log('Ollama not available — AI analysis will be disabled');
  }
}

// ===== FACE DETECTION HELPER =====
// Uses SSD MobileNet (accurate) first, falls back to TinyFaceDetector
async function detectFaces(img) {
  // Try SSD MobileNet with low threshold first
  let detections = await faceapi
    .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }))
    .withFaceLandmarks()
    .withFaceDescriptors()
    .withFaceExpressions();

  // Fallback to TinyFaceDetector if SSD finds nothing
  if (detections.length === 0) {
    detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.2 }))
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();
  }

  return detections;
}

// ===== API ROUTES =====

// System status
app.get('/api/status', (req, res) => {
  res.json({
    system: 'online',
    faceModels: faceModelsLoaded,
    ollama: ollamaAvailable,
    subjectPhotos: subjectDescriptors.length,
    ollamaModel: DEFAULT_MODEL,
    tor: torAvailable,
    vpn: vpnAvailable,
  });
});

// Upload subject photos and extract face descriptors
app.post('/api/upload', upload.array('photos', 5), async (req, res) => {
  if (!faceModelsLoaded) {
    return res.status(503).json({ error: 'Face models not loaded yet' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No photos uploaded' });
  }

  subjectDescriptors = [];
  const results = [];

  for (const file of req.files) {
    try {
      const img = await canvas.loadImage(file.path);
      const detections = await detectFaces(img);

      if (detections.length === 0) {
        results.push({ file: file.originalname, status: 'no_face', faces: 0 });
        continue;
      }

      // Take the largest face
      const sorted = detections.sort((a, b) => b.detection.box.area - a.detection.box.area);
      const best = sorted[0];

      subjectDescriptors.push({
        file: file.originalname,
        descriptor: Array.from(best.descriptor),
        box: best.detection.box,
        confidence: best.detection.score,
        expressions: best.expressions
      });

      results.push({
        file: file.originalname,
        status: 'ok',
        faces: detections.length,
        confidence: best.detection.score,
        expressions: best.expressions,
        box: {
          x: Math.round(best.detection.box.x),
          y: Math.round(best.detection.box.y),
          width: Math.round(best.detection.box.width),
          height: Math.round(best.detection.box.height)
        }
      });
    } catch (err) {
      results.push({ file: file.originalname, status: 'error', error: err.message });
    }
  }

  res.json({
    uploaded: req.files.length,
    processed: results,
    descriptorsStored: subjectDescriptors.length
  });
});

// Analyze a face image against subject descriptors
app.post('/api/compare', upload.single('photo'), async (req, res) => {
  if (!faceModelsLoaded) {
    return res.status(503).json({ error: 'Face models not loaded' });
  }
  if (subjectDescriptors.length === 0) {
    return res.status(400).json({ error: 'No subject photos uploaded yet' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No photo provided' });
  }

  try {
    const img = await canvas.loadImage(req.file.path);
    const detections = await detectFaces(img);

    if (detections.length === 0) {
      return res.json({ match: false, reason: 'No face detected in comparison image' });
    }

    const results = [];
    for (const det of detections) {
      for (const subject of subjectDescriptors) {
        const subjectDesc = new Float32Array(subject.descriptor);
        const distance = faceapi.euclideanDistance(det.descriptor, subjectDesc);
        const similarity = Math.max(0, 1 - distance / 0.6);

        results.push({
          subjectFile: subject.file,
          distance,
          similarity,
          isMatch: similarity >= CONFIDENCE_THRESHOLD
        });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);

    res.json({
      facesDetected: detections.length,
      comparisons: results,
      bestMatch: results[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ollama AI analysis
app.post('/api/analyze', async (req, res) => {
  if (!ollamaAvailable) {
    return res.status(503).json({ error: 'Ollama is not available' });
  }

  const { prompt, context } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const fullPrompt = context
      ? `Context: ${JSON.stringify(context)}\n\nTask: ${prompt}`
      : prompt;

    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: DEFAULT_MODEL,
      prompt: fullPrompt,
      stream: false,
      options: { temperature: 0.7, top_p: 0.9, num_predict: 2048 }
    }, { timeout: 300000 });

    res.json({
      model: DEFAULT_MODEL,
      response: response.data.response,
      totalDuration: response.data.total_duration,
      evalCount: response.data.eval_count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile analysis via Ollama
app.post('/api/analyze-profile', async (req, res) => {
  if (!ollamaAvailable) {
    return res.status(503).json({ error: 'Ollama is not available' });
  }

  const { targetName, platforms, faceData } = req.body;

  const prompt = `You are an OSINT analyst. Analyze the following information about a target:
Name: ${targetName || 'Unknown'}
Platforms selected for search: ${(platforms || []).join(', ')}
Face data available: ${faceData ? 'Yes — ' + faceData.length + ' descriptors' : 'No'}

Provide:
1. A search strategy recommendation for finding this person across the selected platforms
2. Common username patterns to look for based on the name
3. Key identifiers to cross-reference between platforms
4. Confidence assessment of potential matches

Be concise and actionable.`;

  try {
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: DEFAULT_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7, num_predict: 2048 }
    }, { timeout: 300000 });

    res.json({
      model: DEFAULT_MODEL,
      analysis: response.data.response,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== TOR + VPN =====
const TOR_SOCKS = 'socks5://127.0.0.1:9050';
let torAgent = null;
let torAvailable = false;
let vpnAvailable = false;

// Known VPN process names (third-party clients on macOS)
const VPN_PROCESSES = [
  'nordvpnd', 'nordvpn', 'expressvpnd', 'mullvad', 'mullvad-vpn',
  'surfshark', 'tunnelblick', 'viscosity', 'openvpn', 'wireguard',
  'v2ray', 'xray', 'clash', 'sing-box', 'trojan', 'proxyman',
  'surge', 'shadowsocks', 'ssr-local', 'ss-local',
];

function detectVPN() {
  try {
    // 1. Check scutil for connected macOS VPN services
    const ncList = execSync('scutil --nc list 2>/dev/null', { timeout: 3000 }).toString();
    if (/Connected|Running/i.test(ncList)) {
      console.log('VPN detected: active macOS VPN service (scutil)');
      return true;
    }
  } catch {}

  try {
    // 2. Check for running third-party VPN processes
    const procs = execSync('pgrep -lx ' + VPN_PROCESSES.join(' -lx ') + ' 2>/dev/null || true', { timeout: 3000 }).toString();
    if (procs.trim()) {
      console.log('VPN detected: process', procs.trim().split('\n')[0]);
      return true;
    }
  } catch {}

  try {
    // 3. Check for active utun interfaces with routable IPs (not VM/loopback ranges)
    const ifout = execSync('ifconfig 2>/dev/null', { timeout: 3000 }).toString();
    const utunBlocks = ifout.split(/(?=^utun\d+:)/m);
    for (const block of utunBlocks) {
      const ipMatch = block.match(/inet\s+([\d.]+)/);
      if (!ipMatch) continue;
      const ip = ipMatch[1];
      // Skip macOS system tunnels (link-local, VM ranges, loopback)
      if (ip.startsWith('192.168.64.') || ip.startsWith('169.254.') ||
          ip.startsWith('127.') || ip === '0.0.0.0') continue;
      // A utun with a non-system IP is almost certainly a VPN
      console.log(`VPN detected: active tunnel interface with IP ${ip}`);
      return true;
    }
  } catch {}

  return false;
}

async function startTorIfNeeded() {
  // Try to connect to an already-running Tor first
  try {
    const agent = new SocksProxyAgent(TOR_SOCKS);
    await axios.get('https://check.torproject.org/api/ip', {
      httpsAgent: agent, httpAgent: agent, timeout: 8000,
    });
    return agent; // already running
  } catch {}

  // Not running — find the tor binary and launch it
  let torBin = '';
  try { torBin = execSync('which tor 2>/dev/null || echo /opt/homebrew/bin/tor', { timeout: 3000 }).toString().trim(); } catch {}
  if (!torBin || !fs.existsSync(torBin)) {
    console.log('Tor binary not found — cannot auto-start');
    return null;
  }

  console.log('Starting Tor daemon...');
  exec(`${torBin} --RunAsDaemon 1 --PidFile /tmp/tor.pid --Log "notice file /tmp/tor.log" --SocksPort 9050 --ControlPort 9051`);

  // Poll until bootstrapped (up to 60s)
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const log = fs.readFileSync('/tmp/tor.log', 'utf8');
      if (log.includes('Bootstrapped 100%')) {
        const agent = new SocksProxyAgent(TOR_SOCKS);
        await axios.get('https://check.torproject.org/api/ip', {
          httpsAgent: agent, httpAgent: agent, timeout: 8000,
        });
        return agent;
      }
    } catch {}
  }
  return null;
}

async function checkTorAndVPN() {
  // VPN detection (synchronous)
  vpnAvailable = detectVPN();

  // Tor auto-start
  const agent = await startTorIfNeeded();
  if (agent) {
    torAgent = agent;
    torAvailable = true;
    console.log('Tor SOCKS5 proxy: CONNECTED (port 9050)');
  } else {
    torAvailable = false;
    console.log('Tor: not available');
  }

  if (vpnAvailable) console.log('VPN: active — Chinese platforms will use system network');
  if (!torAvailable && !vpnAvailable) console.log('No VPN or Tor — geo-blocked platforms will be skipped');
}

// Platforms routed via VPN/Tor — either geo-blocked or defence sites requiring anonymity
const GEO_BLOCKED_PLATFORMS = new Set([
  // Chinese platforms (geo-blocked outside China)
  'Weibo', 'Bilibili', 'Zhihu', 'Douyin', 'Kuaishou', 'Xiaohongshu',
  'Baidu Tieba', 'WeChat', 'QQ', 'Youku', 'iQiyi', 'Tencent Video', 'PLAP',
  // Pakistani defence sites (route via Tor for anonymity — confirmed accessible)
  'Pakistan Defence', 'PPRA', 'NDMA',
]);

// ===== USERNAME CHECKER (Sherlock-style) =====
const USERNAME_TEMPLATES = {
  'LinkedIn':     { url: 'https://www.linkedin.com/in/{}', method: 'head' },
  'GitHub':       { url: 'https://github.com/{}', method: 'head' },
  'X / Twitter':  { url: 'https://x.com/{}', method: 'head' },
  'Instagram':    { url: 'https://www.instagram.com/{}/', method: 'head' },
  'Facebook':     { url: 'https://www.facebook.com/{}', method: 'head' },
  'TikTok':       { url: 'https://www.tiktok.com/@{}', method: 'head' },
  'YouTube':      { url: 'https://www.youtube.com/@{}', method: 'head' },
  'Reddit':       { url: 'https://www.reddit.com/user/{}', method: 'head' },
  'Pinterest':    { url: 'https://www.pinterest.com/{}/', method: 'head' },
  'Twitch':       { url: 'https://www.twitch.tv/{}', method: 'head' },
  'Snapchat':     { url: 'https://www.snapchat.com/add/{}', method: 'head' },
  'Medium':       { url: 'https://medium.com/@{}', method: 'head' },
  'Tumblr':       { url: 'https://{}.tumblr.com', method: 'head' },
  'Flickr':       { url: 'https://www.flickr.com/people/{}/', method: 'head' },
  'Spotify':      { url: 'https://open.spotify.com/user/{}', method: 'head' },
  'Patreon':      { url: 'https://www.patreon.com/{}', method: 'head' },
  'Telegram':     { url: 'https://t.me/{}', method: 'head' },
  'VKontakte':    { url: 'https://vk.com/{}', method: 'head' },
  'Threads':      { url: 'https://www.threads.net/@{}', method: 'head' },
  'Discord':      { url: null, method: 'skip' },
  'Clubhouse':    { url: 'https://www.clubhouse.com/@{}', method: 'head' },
  'Quora':        { url: 'https://www.quora.com/profile/{}', method: 'head' },
  'OK.ru':        { url: 'https://ok.ru/{}', method: 'head' },
  'Rumble':       { url: 'https://rumble.com/user/{}', method: 'head' },
  'Signal':       { url: null, method: 'skip' },
  'Viber':        { url: null, method: 'skip' },
  'Weibo':        { url: 'https://weibo.com/{}', method: 'get' },
  'Bilibili':     { url: null, method: 'skip' },
  'LINE':         { url: null, method: 'skip' },
  'PLAP':         { url: 'https://www.plap.mil.cn/freecms-glht/site/juncai/cggg/index.html', method: 'get', directUrl: true },
  // Pakistani platforms
  'Rozee.pk':          { url: 'https://www.rozee.pk/~{}', method: 'get' },
  'PakWheels':         { url: 'https://www.pakwheels.com/users/{}', method: 'get' },
  'Zameen':            { url: null, method: 'skip' },
  'Daraz PK':          { url: 'https://www.daraz.pk/shop/{}/', method: 'get' },
  'Urdu Point':        { url: null, method: 'skip' },
  'Hamariweb':         { url: 'https://hamariweb.com/profiles/{}', method: 'get' },
  'Cricingif':         { url: null, method: 'skip' },
  'Ary News':          { url: null, method: 'skip' },
  // Pakistani defence sites — accessible via Tor (confirmed)
  'Pakistan Defence':  { url: 'https://www.defence.pk/forums/members/{}/', method: 'get' },
  'PPRA':              { url: 'https://www.ppra.gov.pk', method: 'get', directUrl: true },
  'NDMA':              { url: 'https://www.ndma.gov.pk', method: 'get', directUrl: true },
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
};

async function checkUsername(username, platform) {
  const template = USERNAME_TEMPLATES[platform];
  if (!template || !template.url || template.method === 'skip') {
    return { platform, username, status: 'unsupported', url: null };
  }

  const isGeoBlocked = GEO_BLOCKED_PLATFORMS.has(platform);

  // For geo-blocked platforms: VPN (system-wide) > Tor > skip
  if (isGeoBlocked) {
    if (!vpnAvailable && !torAvailable) {
      return { platform, username, status: 'geo_blocked', url: null };
    }
  }

  const url = template.directUrl ? template.url : template.url.replace('{}', encodeURIComponent(username));

  // If VPN is active, make a direct request — the OS routes it through the VPN tunnel
  // If no VPN but Tor is available, route via SOCKS5
  const useTor = isGeoBlocked && !vpnAvailable && torAvailable;
  const proxyOpts = useTor ? { httpsAgent: torAgent, httpAgent: torAgent } : {};

  const reqOpts = {
    timeout: useTor ? 20000 : 6000,
    maxRedirects: 2,
    validateStatus: () => true,
    headers: BROWSER_HEADERS,
    ...proxyOpts,
  };

  try {
    // Try HEAD first (fast) unless template prefers GET
    let response;
    if (template.method !== 'get') {
      response = await axios({ method: 'head', url, ...reqOpts });
      // If HEAD is blocked or not supported, fall back to GET
      if (response.status === 405 || response.status === 0) {
        response = await axios({ method: 'get', url, ...reqOpts });
      }
    } else {
      response = await axios({ method: 'get', url, ...reqOpts });
    }

    // Only HTTP 200 counts as confirmed found — 3xx usually means login wall
    if (response.status === 200) {
      return { platform, username, status: 'found', code: response.status, url, viaTor: useTor, viaVpn: isGeoBlocked && vpnAvailable };
    } else if (response.status === 404) {
      return { platform, username, status: 'not_found', code: response.status, url: null };
    } else if (response.status === 429 || response.status === 999) {
      return { platform, username, status: 'blocked', code: response.status, url: null };
    } else {
      return { platform, username, status: 'not_found', code: response.status, url: null };
    }
  } catch (err) {
    return { platform, username, status: 'error', error: err.code || err.message, url: null };
  }
}

// Username check API
app.post('/api/check-username', async (req, res) => {
  const { username, platforms } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const selectedPlatforms = platforms || Object.keys(USERNAME_TEMPLATES);
  const results = [];

  // Run checks in parallel batches of 5
  for (let i = 0; i < selectedPlatforms.length; i += 5) {
    const batch = selectedPlatforms.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(p => checkUsername(username, p))
    );
    results.push(...batchResults);
  }

  res.json({
    username,
    checked: results.length,
    found: results.filter(r => r.status === 'found').length,
    results: results.sort((a, b) => {
      if (a.status === 'found' && b.status !== 'found') return -1;
      if (a.status !== 'found' && b.status === 'found') return 1;
      return 0;
    })
  });
});

// ===== NEWS SEARCH (Google News RSS — multi-angle) =====
async function fetchGoogleNewsRSS(query, maxResults = 10) {
  const articles = [];
  try {
    const encodedQuery = encodeURIComponent(query);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en&gl=US&ceid=US:en`;

    const response = await axios.get(rssUrl, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });

    const $ = cheerio.load(response.data, { xmlMode: true });

    $('item').slice(0, maxResults).each((i, el) => {
      const title = $(el).find('title').text().trim();
      const link = $(el).find('link').text().trim();
      const pubDate = $(el).find('pubDate').text().trim();
      const source = $(el).find('source').text().trim();
      const description = $(el).find('description').text().trim();
      const cleanDesc = description.replace(/<[^>]*>/g, '').trim();

      articles.push({
        title,
        link,
        source,
        date: pubDate,
        dateFormatted: new Date(pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        description: cleanDesc.substring(0, 300),
        angle: query
      });
    });
  } catch (err) {
    console.error(`News fetch error [${query}]:`, err.message);
  }
  return articles;
}

// Multi-angle news aggregator: searches primary name + key angles in parallel
async function searchNews(name, maxResults = 20) {
  const angles = [
    name,
    `"${name}" latest news`,
    `"${name}" statement controversy`,
  ];

  // Fetch all angles in parallel
  const results = await Promise.all(angles.map(q => fetchGoogleNewsRSS(q, 8)));
  const all = results.flat();

  // Deduplicate by title (case-insensitive first 60 chars)
  const seen = new Set();
  const deduped = [];
  for (const a of all) {
    const key = a.title.toLowerCase().slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(a);
    }
  }

  // Sort by date descending
  deduped.sort((a, b) => new Date(b.date) - new Date(a.date));

  return deduped.slice(0, maxResults);
}

// News search API endpoint
app.post('/api/news', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const articles = await searchNews(query);
  res.json({ query, count: articles.length, articles });
});

// ===== MAIN SEARCH ENDPOINT (multipart form — used by frontend) =====
app.post('/api/search-multipart', upload.array('photos', 5), async (req, res) => {
  const t0 = Date.now();
  const tick = (label) => console.log(`[TIMER] ${label}: ${((Date.now()-t0)/1000).toFixed(1)}s`);

  const targetName = req.body.targetName || '';
  const platforms = JSON.parse(req.body.platforms || '[]');
  const threshold = parseFloat(req.body.threshold) || 0.45;
  const files = req.files || [];
  console.log(`[SEARCH] "${targetName}" — ${platforms.length} platforms, ${files.length} photos`);

  const searchResults = {
    query: { targetName, threshold, platformCount: platforms.length },
    platformsSearched: platforms.length,
    faceAnalysis: null,
    news: null,
    usernameCheck: null,
    aiAnalysis: null,
    prediction: null,
    results: [],
    timestamp: new Date().toISOString()
  };

  // 1. Face detection on uploaded files
  if (files.length > 0 && faceModelsLoaded) {
    subjectDescriptors = [];
    const faceResults = [];

    for (const file of files) {
      try {
        const image = await canvas.loadImage(file.path);
        const detections = await detectFaces(image);

        if (detections.length > 0) {
          const sorted = detections.sort((a, b) => b.detection.box.area - a.detection.box.area);
          const best = sorted[0];
          subjectDescriptors.push({ file: file.originalname, descriptor: Array.from(best.descriptor) });
          faceResults.push({
            file: file.originalname, faces: detections.length,
            confidence: best.detection.score, expressions: best.expressions
          });
        } else {
          faceResults.push({ file: file.originalname, faces: 0, error: 'No face detected' });
        }
      } catch (err) {
        faceResults.push({ file: file.originalname, error: err.message });
      }
    }

    searchResults.faceAnalysis = {
      photosProcessed: files.length,
      facesExtracted: subjectDescriptors.length,
      details: faceResults
    };
  }

  tick('face-done');
  // 2. News search + Username check in parallel
  if (targetName) {
    const usernames = generateUsernames(targetName);

    // Run news search and username check concurrently
    const [newsArticles, usernameResults] = await Promise.all([
      searchNews(targetName),
      // Run ALL username × platform checks fully in parallel (no sequential batches)
      // Hard cap: race against 12s so this never blocks the whole response
      Promise.race([
        Promise.all(
          usernames.slice(0, 3).flatMap(username =>
            platforms.map(p => checkUsername(username, p).catch(() => ({ platform: p, username, status: 'error', url: null })))
          )
        ),
        new Promise(resolve => setTimeout(() => resolve([]), 12000))
      ])
    ]);

    tick('news+username-done');
    searchResults.news = {
      query: targetName,
      count: newsArticles.length,
      articles: newsArticles
    };

    searchResults.usernameCheck = {
      usernames,
      total: usernameResults.length,
      found: usernameResults.filter(r => r.status === 'found'),
      notFound: usernameResults.filter(r => r.status === 'not_found').length,
      errors: usernameResults.filter(r => r.status === 'error').length
    };
  }

  // 3. AI Analysis + Prediction via Ollama — run BOTH in parallel, cap tokens
  if (ollamaAvailable && targetName) {
    // Use only top 8 headlines to keep prompt short and response fast
    const newsHeadlines = (searchResults.news?.articles || [])
      .slice(0, 8)
      .map((a, i) => `${i + 1}. [${a.source}] ${a.title} (${a.dateFormatted})`)
      .join('\n');

    const foundProfiles = (searchResults.usernameCheck?.found || [])
      .map(f => `${f.platform}: @${f.username}`)
      .join(', ') || 'None detected.';

    const analysisPrompt = `[SYSTEM: You are an OSINT intelligence analyst. The news headlines below have already been fetched by a separate system — do NOT say you cannot access the internet or news. Analyze only what is given.]

TARGET: ${targetName}
ONLINE PROFILES FOUND: ${foundProfiles}

RECENT NEWS HEADLINES (pre-fetched):
${newsHeadlines || 'No headlines available — base analysis on general knowledge about this person.'}

Write an intelligence brief with exactly these 5 sections (2-3 sentences each). Use the headlines above as your primary source:

1. SITUATION SUMMARY
2. KEY THEMES
3. SENTIMENT ANALYSIS
4. NOTABLE PATTERNS
5. INFLUENCE & REACH`;

    const predictionPrompt = `[SYSTEM: You are a strategic forecasting analyst. The news headlines below have already been fetched — do NOT say you cannot access the internet. Base your forecast on the headlines provided.]

TARGET: ${targetName}

RECENT NEWS HEADLINES (pre-fetched):
${newsHeadlines || 'No headlines available — base forecast on general knowledge about this person.'}

Write a predictive forecast with exactly these 5 sections (2-3 sentences each). Reference specific headlines where relevant:

1. SHORT-TERM FORECAST (next 1-4 weeks)
2. MEDIUM-TERM FORECAST (1-3 months)
3. LONG-TERM OUTLOOK (3-12 months)
4. KEY RISKS & WILDCARDS
5. CONFIDENCE ASSESSMENT (Low/Medium/High + reason)`;

    // Run Ollama calls SEQUENTIALLY — parallel causes CPU contention on local models
    // 250 tokens × 2 calls ≈ 40s total at typical local inference speed
    const ollamaCall = async (prompt, temp) => {
      try {
        const r = await axios.post(`${OLLAMA_URL}/api/generate`, {
          model: DEFAULT_MODEL, prompt, stream: false,
          options: { temperature: temp, num_predict: 600 }
        }, { timeout: 120000 });
        return r.data.response;
      } catch (e) { return null; }
    };

    const analysisText = await ollamaCall(analysisPrompt, 0.5);
    tick('ollama-analysis-done');
    const predictionText = await ollamaCall(predictionPrompt, 0.6);

    tick('ollama-done');
    searchResults.aiAnalysis = analysisText
      ? { model: DEFAULT_MODEL, brief: analysisText }
      : { error: 'Ollama did not respond in time' };

    searchResults.prediction = predictionText
      ? { model: DEFAULT_MODEL, forecast: predictionText }
      : { error: 'Ollama did not respond in time' };
  }

  res.json(searchResults);
});

// Generate username variations from a name
function generateUsernames(name) {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const usernames = new Set();

  if (parts.length === 0) return [name.toLowerCase()];

  // Basic: full name joined
  usernames.add(parts.join(''));
  usernames.add(parts.join('.'));
  usernames.add(parts.join('_'));
  usernames.add(parts.join('-'));

  // First + last initial, last + first initial
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    usernames.add(first + last);
    usernames.add(last + first);
    usernames.add(first + '.' + last);
    usernames.add(first[0] + last);
    usernames.add(first + last[0]);
    usernames.add(first);
    usernames.add(last);
  }

  return Array.from(usernames).slice(0, 5); // Limit to 5 variations
}

// Search endpoint (processes images from base64 — API use)
app.post('/api/search', async (req, res) => {
  const { targetName, platforms, images, threshold, profileSearch, reverseImage } = req.body;

  const searchResults = {
    query: { targetName, threshold, platformCount: (platforms || []).length },
    platformsSearched: (platforms || []).length,
    faceAnalysis: null,
    aiAnalysis: null,
    results: [],
    timestamp: new Date().toISOString()
  };

  // Process uploaded base64 images for face detection
  if (images && images.length > 0 && faceModelsLoaded) {
    subjectDescriptors = [];
    const faceResults = [];

    for (const img of images) {
      try {
        // Convert base64 to temp file then load (avoids 0-width canvas bug)
        const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const tmpDir = path.join(__dirname, 'uploads');
        await fs.ensureDir(tmpDir);
        const tmpPath = path.join(tmpDir, `tmp-${Date.now()}-${img.name}`);
        await fs.writeFile(tmpPath, buffer);
        const image = await canvas.loadImage(tmpPath);
        await fs.remove(tmpPath).catch(() => {});

        const detections = await detectFaces(image);

        if (detections.length > 0) {
          const sorted = detections.sort((a, b) => b.detection.box.area - a.detection.box.area);
          const best = sorted[0];

          subjectDescriptors.push({
            file: img.name,
            descriptor: Array.from(best.descriptor)
          });

          faceResults.push({
            file: img.name,
            faces: detections.length,
            confidence: best.detection.score,
            expressions: best.expressions
          });
        } else {
          faceResults.push({ file: img.name, faces: 0, error: 'No face detected' });
        }
      } catch (err) {
        faceResults.push({ file: img.name, error: err.message });
      }
    }

    searchResults.faceAnalysis = {
      photosProcessed: images.length,
      facesExtracted: subjectDescriptors.length,
      details: faceResults
    };
  }

  // Run Ollama analysis if available
  if (ollamaAvailable && targetName) {
    try {
      const prompt = `You are an OSINT analyst. A search is being conducted for "${targetName}".
${subjectDescriptors.length} face descriptors have been extracted from uploaded photos.
${(platforms || []).length} platforms are selected for search.

Generate a realistic intelligence brief with:
1. Likely username variations for "${targetName}"
2. Search strategy across platforms: ${(platforms || []).slice(0, 10).join(', ')}${(platforms || []).length > 10 ? '...' : ''}
3. Cross-referencing recommendations
4. Risk assessment

Be concise.`;

      const aiResponse = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 1024 }
      }, { timeout: 300000 });

      searchResults.aiAnalysis = {
        model: DEFAULT_MODEL,
        brief: aiResponse.data.response
      };
    } catch (err) {
      searchResults.aiAnalysis = { error: err.message };
    }
  }

  res.json(searchResults);
});

// List available Ollama models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    res.json({ models: response.data.models });
  } catch {
    res.json({ models: [], error: 'Ollama not available' });
  }
});

// ===== GRACEFUL SHUTDOWN =====
function freePort(port) {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(`lsof -ti :${port}`, (err, stdout) => {
      if (stdout && stdout.trim()) {
        const pids = stdout.trim().split('\n').filter(p => p !== String(process.pid));
        if (pids.length > 0) {
          exec(`kill -9 ${pids.join(' ')}`, () => setTimeout(resolve, 500));
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}

const server = app;
let httpServer;

function shutdown() {
  console.log('\nShutting down...');
  if (httpServer) {
    httpServer.close(() => process.exit(0));
  }
  setTimeout(() => process.exit(0), 2000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', () => {}); // ignore terminal hangup — do not shut down
process.on('uncaughtException', (err) => { console.error('[CRASH] uncaughtException:', err.stack); });
process.on('unhandledRejection', (reason) => { console.error('[CRASH] unhandledRejection:', reason); });

// ===== START =====
async function start() {
  await freePort(PORT);
  await loadFaceModels();
  await checkOllama();
  await checkTorAndVPN();

  httpServer = app.listen(PORT, () => {
    console.log(`\nPHANTOM TRACE — Recon Command Center`);
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Face models: ${faceModelsLoaded ? 'LOADED' : 'FAILED'}`);
    console.log(`Ollama (${DEFAULT_MODEL}): ${ollamaAvailable ? 'CONNECTED' : 'OFFLINE'}`);
    console.log(`Descriptors in memory: ${subjectDescriptors.length}\n`);
  });
}

start().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});
