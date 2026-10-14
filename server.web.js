const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === '') process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, '.env'));

const app = express();
const PORT = Number(process.env.PROXY_PORT || 3004); // JTGenWeb proxy. The React app stays on 3003.

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Credentials come from JTGenWeb/.env so they are not stored in source.
const JIRA_CONFIG = {
  BASE_URL: process.env.JIRA_BASE_URL || 'https://probuild.atlassian.net',
  PROJECT_KEY: process.env.JIRA_PROJECT_KEY || 'PB',
  PROJECT_NAME: 'ProBuild',
  AUTH_TOKEN: process.env.JIRA_API_TOKEN || '',
  EMAIL: process.env.JIRA_EMAIL || ''
};

if (!JIRA_CONFIG.EMAIL || !JIRA_CONFIG.AUTH_TOKEN) {
  console.error('JTGenWeb proxy is missing JIRA_EMAIL or JIRA_API_TOKEN. Add them to JTGenWeb/.env');
  process.exit(1);
}

// Create axios instance for Jira API
const jiraApi = axios.create({
  baseURL: `${JIRA_CONFIG.BASE_URL}/rest/api/3`,
  auth: {
    username: JIRA_CONFIG.EMAIL,
    password: JIRA_CONFIG.AUTH_TOKEN
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Test connectivity endpoint
app.get('/test-connectivity', async (req, res) => {
  try {
    const response = await jiraApi.get('/project/PB');
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create ticket endpoint
app.post('/create-ticket', async (req, res) => {
  try {
    const response = await jiraApi.post('/issue', req.body);
    
    res.json({
      success: true,
      data: response.data,
      ticketKey: response.data.key,
      ticketUrl: `https://probuild.atlassian.net/browse/${response.data.key}`
    });
    
  } catch (error) {
    console.error('Ticket creation error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Get issue endpoint
app.get('/issue/:issueKey', async (req, res) => {
  try {
    const response = await jiraApi.get(`/issue/${req.params.issueKey}`);
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Get issue error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Update issue endpoint
app.put('/issue/:issueKey', async (req, res) => {
  try {
    const response = await jiraApi.put(`/issue/${req.params.issueKey}`, req.body);
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Update issue error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Search issues endpoint
app.get('/search', async (req, res) => {
  try {
    const response = await jiraApi.get(`/search?jql=${req.query.jql}&fields=${req.query.fields || 'status,summary'}`);
    
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error('Search error:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: error.message,
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Upload attachment endpoint
app.post('/upload-attachment/:issueKey', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }
    
    // Create form data for Jira API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    // Upload to Jira
    const response = await axios.post(
      `https://probuild.atlassian.net/rest/api/3/issue/${req.params.issueKey}/attachments`,
      formData,
      {
        auth: {
          username: JIRA_CONFIG.EMAIL,
          password: JIRA_CONFIG.AUTH_TOKEN
        },
        headers: {
          ...formData.getHeaders(),
          'X-Atlassian-Token': 'no-check'
        }
      }
    );
    
    res.json({
      success: true,
      data: response.data[0] // Jira returns an array, we want the first attachment
    });
    
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// --- JAM extraction helpers (jam.dev API shapes vary; walk nested JSON) ---
const JAM_UI_LABELS = new Set([
  'video', 'audio', 'image', 'screenshot', 'screen', 'recording', 'replay',
  'console', 'network', 'logs', 'devtools', 'jam', 'share', 'copy', 'download',
  'play', 'pause', 'timeline', 'metadata'
]);

function isHttpUrlString(s) {
  if (!s || typeof s !== 'string') return false;
  return /^https?:\/\//i.test(s.trim());
}

function isPlausibleJamTitle(s) {
  if (!s || typeof s !== 'string' || s.length < 2) return false;
  if (s === 'Jam' || s.includes('Sit tight')) return false;
  if (isHttpUrlString(s)) return false;
  const t = s.trim();
  const lo = t.toLowerCase();
  if (JAM_UI_LABELS.has(lo)) return false;
  if (/^word(\s+word)+$/i.test(t) && t.length > 30) return false;
  return true;
}

/** Jam page titles often look like: Jam | Video | https://site/... — strip chrome, keep real text */
function stripJamPipeChrome(text) {
  if (!text || typeof text !== 'string') return text;
  let t = text.replace(/^jam\s*\|\s*/i, '').trim();
  const parts = t.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
  const good = parts.filter((s) => {
    const lo = s.toLowerCase();
    if (lo === 'jam') return false;
    if (JAM_UI_LABELS.has(lo)) return false;
    if (isHttpUrlString(s)) return false;
    return s.length > 1;
  });
  if (good.length > 0) return good.join(' - ');
  const fallback = parts.find((s) => !isHttpUrlString(s) && !JAM_UI_LABELS.has(s.toLowerCase()) && s.length > 1);
  return fallback || '';
}

function jamJsonChildKeyOrder(keys) {
  const preferred = ['session', 'clip', 'recording', 'pageprops', 'pagedata', 'issue', 'bug', 'data', 'props', 'payload'];
  const score = (k) => {
    const lk = k.toLowerCase();
    const i = preferred.findIndex((p) => lk.includes(p));
    return i === -1 ? 1000 : i;
  };
  return [...keys].sort((a, b) => score(a) - score(b));
}

function extractJamSessionFromDeepJson(data, depth = 0) {
  if (depth > 18 || data == null) return null;
  if (typeof data === 'string') return null;
  if (Array.isArray(data)) {
    for (const item of data) {
      const r = extractJamSessionFromDeepJson(item, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof data !== 'object') return null;

  const titleKeys = ['displayTitle', 'sessionTitle', 'clipTitle', 'title', 'name', 'headline', 'label', 'subject', 'summary', 'description'];
  for (const key of titleKeys) {
    const v = data[key];
    if (typeof v === 'string' && isPlausibleJamTitle(v)) {
      const module = typeof data.module === 'string' && isPlausibleJamTitle(data.module)
        ? data.module
        : (typeof data.category === 'string' && isPlausibleJamTitle(data.category) ? data.category : 'General');
      let summary = typeof data.summary === 'string' && !isHttpUrlString(data.summary) ? data.summary
        : (typeof data.description === 'string' && !isHttpUrlString(data.description) ? data.description : v);
      if (isHttpUrlString(summary)) summary = v;
      return { title: v.trim(), module, summary: (summary || v).trim() };
    }
  }
  for (const k of jamJsonChildKeyOrder(Object.keys(data))) {
    const r = extractJamSessionFromDeepJson(data[k], depth + 1);
    if (r) return r;
  }
  return null;
}

// JAM Content Fetching Endpoints
app.get('/jam/fetch-content', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    console.log('🔍 JAM PROXY: Fetching content from:', url);

    // Fetch the JAM content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const htmlContent = response.data;
    
    // Extract title from HTML
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled JAM';

    // Try to extract JAM session data from script tags or meta tags
    let jamData = null;
    
    // Next.js __NEXT_DATA__
    const nextDataMatch = htmlContent.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const props = nextData?.props?.pageProps ?? nextData?.props;
        const session = props?.session ?? props?.clip ?? props?.recording ?? props;
        if (session && (session.title || session.name)) {
          jamData = session;
        }
      } catch (e) { /* ignore */ }
    }
    
    // window.__INITIAL_STATE__ or similar
    if (!jamData) {
      const scriptMatches = htmlContent.match(/<script[^>]*>[\s\S]*?window\.(__INITIAL_STATE__|__DATA__|__NUXT_DATA__)[\s\S]*?<\/script>/gi);
      if (scriptMatches) {
        for (const script of scriptMatches) {
          try {
            const jsonMatch = script.match(/window\.(?:__INITIAL_STATE__|__DATA__|__NUXT_DATA__)\s*=\s*({[\s\S]*?});/);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              const session = jsonData?.session ?? jsonData?.clip ?? jsonData?.data?.session ?? jsonData?.data;
              if (session && (session.title || session.name)) {
                jamData = session;
                break;
              }
            }
          } catch (e) { /* ignore */ }
        }
      }
    }

    // If we found JAM data, extract module and summary
    let module = 'General';
    let summary = 'JAM Session Content';
    
    if (jamData) {
      // Extract module from JAM data
      if (jamData.module || jamData.category) {
        module = jamData.module || jamData.category;
      }
      
      // Extract summary from JAM data
      if (jamData.summary || jamData.description || jamData.title) {
        summary = jamData.summary || jamData.description || jamData.title;
      }
    } else {
      // Fallback: try to extract from meta tags or other patterns
      const metaModule = htmlContent.match(/<meta[^>]*name=["']jam:module["'][^>]*content=["']([^"']+)["']/i);
      const metaSummary = htmlContent.match(/<meta[^>]*name=["']jam:summary["'][^>]*content=["']([^"']+)["']/i);
      
      if (metaModule) {
        module = metaModule[1];
      }
      if (metaSummary) {
        summary = metaSummary[1];
      }
    }

    res.json({
      success: true,
      data: {
        title,
        htmlContent,
        module,
        summary,
        jamData
      }
    });

  } catch (error) {
    console.error('🔍 JAM PROXY: Fetch error:', error.message);
    console.error('🔍 JAM PROXY: Error stack:', error.stack);
    console.error('🔍 JAM PROXY: Failed URL:', url);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/jam/fetch-content-rendered', async (req, res) => {
  let browser = null;
  let capturedSessionFromApi = null;

  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    console.log('🔍 JAM PROXY: Fetching rendered content from:', url);

    // Launch browser with better configuration
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Capture session data from API responses (jam.dev fetches session/clip as JSON)
    await page.route('**/*', (route) => {
      route.continue();
    });
    page.on('response', async (response) => {
      const reqUrl = response.url();
      const rt = response.request().resourceType();
      const isXhrOrFetch = rt === 'xhr' || rt === 'fetch';
      const ct = (response.headers()['content-type'] || '').toLowerCase();
      const looksJson = ct.includes('application/json') || ct.includes('graphql');
      const likelyJamApi = reqUrl.includes('jam.dev') || reqUrl.includes('jam.systems')
        || reqUrl.includes('session') || reqUrl.includes('clip') || reqUrl.includes('/api/')
        || reqUrl.includes('graphql') || /\/c\/[0-9a-f-]{36}/i.test(reqUrl);
      if (!isXhrOrFetch || (!likelyJamApi && !looksJson)) return;
      if (looksJson && !likelyJamApi && !reqUrl.includes('jam')) return;
      try {
        const body = await response.text();
        if (!body || body.length < 10 || body.length > 500000) return;
        const data = JSON.parse(body);
        const fromDeep = extractJamSessionFromDeepJson(data);
        const session = data?.data?.session ?? data?.session ?? data?.clip ?? data?.data?.clip ?? data?.data?.recording ?? data?.recording ?? data?.data;
        const shallowTitle = session?.title ?? session?.name ?? session?.label ?? data?.title ?? data?.name;
        let candidate = fromDeep;
        if (!candidate && typeof shallowTitle === 'string' && isPlausibleJamTitle(shallowTitle)) {
          candidate = {
            title: shallowTitle.trim(),
            module: session?.module ?? session?.category ?? data?.module ?? 'General',
            summary: session?.summary ?? session?.description ?? data?.summary ?? shallowTitle
          };
        }
        if (!candidate || !candidate.title) return;
        const prevLen = capturedSessionFromApi?.title?.length || 0;
        if (candidate.title.length >= prevLen) {
          capturedSessionFromApi = candidate;
          console.log('🔍 JAM PROXY: Captured session from API:', reqUrl.substring(0, 120), capturedSessionFromApi);
        }
      } catch (_) { /* ignore */ }
    });
    
    // Set user agent and viewport (look like a real browser)
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Load + extra wait so jam.dev SPA can fetch clip/session JSON
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 35000
    });
    await page.waitForTimeout(5000);
    // Wait for SPA to finish loading: either title updates, content appears, or network idle
    try {
      await Promise.race([
        page.waitForFunction(
          () => document.title && document.title !== 'Jam' && document.title.length > 4,
          { timeout: 20000 }
        ),
        page.waitForSelector('span[data-text="true"]', { timeout: 20000 }),
        page.waitForSelector(
          'textarea[name="jam-title"], .tiptap.ProseMirror p, div.tiptap.ProseMirror, .tiptap.ProseMirror, div.ProseMirror[contenteditable="true"], [role="textbox"].tiptap, [role="textbox"].ProseMirror',
          { timeout: 20000 }
        )
      ]);
    } catch (e) {
      console.log('🔍 JAM PROXY: Waiting for title/selector finished (timeout or not found)');
    }
    await page.waitForTimeout(3000);
    
    // Wait until ProseMirror/TipTap has real text (not just shell / URL)
    try {
      await page.waitForFunction(
        () => {
          const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
          const ok = (t) =>
            t.length > 12 &&
            !/^https?:\/\//i.test(t) &&
            !/^video\s*\|/i.test(t);
          const ta = document.querySelector('textarea[name="jam-title"]');
          if (ta && ok(norm(ta.value))) return true;
          const pSels = [
            '.tiptap.ProseMirror p',
            'div.tiptap.ProseMirror p',
            '.ProseMirror[contenteditable="true"] p',
            'div[role="textbox"].tiptap.ProseMirror p',
            '[role="textbox"].ProseMirror p'
          ];
          for (const s of pSels) {
            const pel = document.querySelector(s);
            const t = norm(pel && (pel.innerText || pel.textContent));
            if (ok(t)) return true;
          }
          const sels = [
            'div.tiptap.ProseMirror',
            '.tiptap.ProseMirror',
            'div.ProseMirror[contenteditable="true"]',
            '[translate="no"].ProseMirror',
            '.ProseMirror[contenteditable="true"]',
            '[role="textbox"].ProseMirror',
            'div[contenteditable="true"].ProseMirror'
          ];
          for (const s of sels) {
            const el = document.querySelector(s);
            const t = norm(el && (el.innerText || el.textContent));
            if (ok(t)) return true;
          }
          return false;
        },
        { timeout: 25000 }
      );
      console.log('🔍 JAM PROXY: ProseMirror/TipTap has text');
    } catch (e) {
      console.log('🔍 JAM PROXY: ProseMirror wait timeout (continuing anyway)');
    }
    await page.waitForTimeout(1500);
    
    // If we captured session from API, use it and still run DOM extraction as fallback
    if (capturedSessionFromApi) {
      console.log('🔍 JAM PROXY: Using session data captured from API');
    }
    
    // Try to wait for specific JAM content (legacy spans or new TipTap / ProseMirror description)
    try {
      await page.waitForSelector(
        'span[data-text="true"], textarea[name="jam-title"], .tiptap.ProseMirror p, div.tiptap.ProseMirror, .tiptap.ProseMirror, div.ProseMirror[contenteditable="true"]',
        { timeout: 8000 }
      );
      console.log('🔍 JAM PROXY: Found JAM content selector (span or TipTap)');
    } catch (e) {
      console.log('🔍 JAM PROXY: Primary content selectors not found, trying fallbacks...');
      try {
        await page.waitForSelector('h1, h2, h3, [data-testid*="title"], [class*="title"]', { timeout: 3000 });
      } catch (e2) {
        console.log('🔍 JAM PROXY: No specific title selector found, continuing...');
      }
    }
    
    // TipTap/ProseMirror may live in a child frame (Jam embed) — same-origin frames only
    let iframeProseText = '';
    for (const frame of page.frames()) {
      try {
        const txt = await frame.evaluate(() => {
          const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
          const pSels = [
            '.tiptap.ProseMirror p',
            'div.tiptap.ProseMirror p',
            '.ProseMirror[contenteditable="true"] p',
            'div[role="textbox"].tiptap.ProseMirror p',
            '[role="textbox"].ProseMirror p'
          ];
          for (const s of pSels) {
            const pel = document.querySelector(s);
            const t = norm(pel && (pel.innerText || pel.textContent));
            if (t.length > 8 && !/^https?:\/\//i.test(t)) return t;
          }
          const ta = document.querySelector('textarea[name="jam-title"]');
          const tv = ta ? norm(ta.value) : '';
          if (tv.length > 8 && !/^https?:\/\//i.test(tv)) return tv;
          const sels = [
            '.ProseMirror[contenteditable="true"]',
            'div.tiptap.ProseMirror',
            '.tiptap.ProseMirror',
            'div.ProseMirror',
            '[role="textbox"].ProseMirror'
          ];
          let best = '';
          for (const s of sels) {
            document.querySelectorAll(s).forEach((el) => {
              const t = norm(el.innerText || el.textContent);
              if (t.length > best.length && !/^https?:\/\//i.test(t)) best = t;
            });
          }
          return best;
        });
        if (txt && txt.length > iframeProseText.length) iframeProseText = txt;
      } catch (_) { /* cross-origin or detached */ }
    }
    if (iframeProseText) {
      console.log('🔍 JAM PROXY: iframe/ProseMirror text length:', iframeProseText.length, iframeProseText.substring(0, 80));
    }
    
    // Extract the actual JAM content (and try embedded JSON)
    const jamContent = await page.evaluate(() => {
      const UI = new Set(['video', 'audio', 'image', 'screenshot', 'screen', 'recording', 'replay', 'console', 'network', 'logs', 'devtools', 'jam', 'share', 'copy', 'download', 'play', 'pause']);
      const isUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s.trim());
      const stripJamPipeChrome = (text) => {
        if (!text || typeof text !== 'string') return text;
        let t = text.replace(/^jam\s*\|\s*/i, '').trim();
        const parts = t.split(/\s*\|\s*/).map((s) => s.trim()).filter(Boolean);
        const good = parts.filter((s) => {
          const lo = s.toLowerCase();
          if (lo === 'jam') return false;
          if (UI.has(lo)) return false;
          if (isUrl(s)) return false;
          return s.length > 1;
        });
        if (good.length) return good.join(' - ');
        const fallback = parts.find((s) => !isUrl(s) && !UI.has(s.toLowerCase()) && s.length > 1);
        return fallback || '';
      };

      /** Jam often renders description only in visible text — find "Module - Summary" in body lines */
      const extractModuleSummaryFromBody = () => {
        const body = ((document.body && (document.body.innerText || document.body.textContent)) || '').replace(/\r/g, '');
        if (!body || body.length < 25) return null;
        const lines = body.split(/[\n\r]+/).map((l) => l.trim()).filter((l) => l.length > 15);
        let best = null;
        for (const line of lines) {
          if (isUrl(line)) continue;
          if (/^word(\s+word)+$/i.test(line)) continue;
          const idx = line.indexOf(' - ');
          if (idx < 2 || idx > line.length - 12) continue;
          const mod = line.slice(0, idx).trim();
          const sum = line.slice(idx + 3).trim();
          if (mod.length < 3 || mod.length > 180) continue;
          if (UI.has(mod.toLowerCase())) continue;
          if (!sum || sum.length < 8 || isUrl(sum)) continue;
          if (/^https?:\/\//i.test(sum.trim())) continue;
          if (!best || sum.length > best.summary.length) {
            best = { module: mod, summary: sum, full: line };
          }
        }
        if (best) return best;
        const re = /([A-Za-z\u0590-\u05FF][^|\n]{2,140}?)\s-\s([^\n]{12,900})/;
        const mm = body.match(re);
        if (mm) {
          const mod = mm[1].trim();
          const sum = mm[2].trim();
          if (!UI.has(mod.toLowerCase()) && !isUrl(mod) && !isUrl(sum) && sum.length >= 8) {
            return { module: mod, summary: sum, full: `${mod} - ${sum}` };
          }
        }
        return null;
      };

      // Try to get session from embedded JSON (Next.js, Nuxt, or custom __INITIAL_STATE__)
      let embeddedTitle = null;
      let embeddedModule = null;
      let embeddedSummary = null;
      try {
        const og = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
        if (og && og !== 'Jam' && !og.includes('Sit tight') && og.length > 1) {
          embeddedTitle = og;
          embeddedModule = 'General';
          embeddedSummary = og.replace(/^jam\s*\|\s*/i, '').trim() || og;
        }
      } catch (_) {}
      try {
        const win = window;
        const sources = [
          win.__NEXT_DATA__?.props?.pageProps,
          win.__NUXT_DATA__,
          win.__INITIAL_STATE__,
          win.__DATA__
        ];
        for (const src of sources) {
          if (!src) continue;
          const session = src.session ?? src.clip ?? src.recording ?? src;
          const t = session?.title ?? session?.name ?? src?.title;
          if (t && typeof t === 'string' && t.length > 1) {
            embeddedTitle = t;
            embeddedModule = session?.module ?? session?.category ?? src?.module ?? 'General';
            embeddedSummary = session?.summary ?? session?.description ?? src?.summary ?? t;
            break;
          }
        }
        // Also scan script tags for JSON with "title" (session data)
        if (!embeddedTitle) {
          document.querySelectorAll('script[type="application/json"], script:not([src])').forEach((script) => {
            const raw = script.textContent || '';
            if (raw.length < 50 || raw.length > 500000) return;
            try {
              const data = JSON.parse(raw);
              const session = data?.props?.pageProps?.session ?? data?.session ?? data?.clip ?? data?.props?.pageProps ?? data;
              const t = session?.title ?? session?.name ?? data?.title;
              if (t && typeof t === 'string' && t.length > 1 && !t.includes('Sit tight')) {
                embeddedTitle = t;
                embeddedModule = session?.module ?? session?.category ?? 'General';
                embeddedSummary = session?.summary ?? session?.description ?? t;
              }
            } catch (_) {}
          });
        }
      } catch (_) {}
      
      // Get the page title (preserve original for later use)
      const originalTitle = document.title || 'Untitled JAM';
      let title = originalTitle;
      
      // New Jam UI (Radix + TipTap): title field `textarea[name="jam-title"]`; description often in first <p> inside .tiptap.ProseMirror
      const normText = (t) => (t || '').replace(/\s+/g, ' ').trim();
      const isBadTiptap = (t) => {
        const lo = t.toLowerCase();
        return !t || t.length < 6 || isUrl(t) || UI.has(lo) || /^word(\s+word)+$/i.test(t);
      };
      const getBestTiptapText = () => {
        const pSels = [
          '.tiptap.ProseMirror p',
          'div.tiptap.ProseMirror > p',
          '.ProseMirror[contenteditable="true"] p',
          'div[role="textbox"].tiptap.ProseMirror p',
          'div[translate="no"].tiptap.ProseMirror p',
          '[role="textbox"].ProseMirror p',
          '.tiptap.ProseMirror p:first-of-type'
        ];
        let fromP = '';
        let proseRoot = null;
        for (const s of pSels) {
          const pel = document.querySelector(s);
          if (!pel) continue;
          const t = normText(pel.innerText || pel.textContent);
          if (isBadTiptap(t)) continue;
          fromP = t;
          proseRoot = pel.closest('.ProseMirror, .tiptap') || pel.parentElement;
          break;
        }
        const ta = document.querySelector('textarea[name="jam-title"], textarea.rt-TextAreaInput[name="jam-title"]');
        const fromTa = ta ? normText(ta.value) : '';
        let combined = '';
        let rootEl = proseRoot;
        if (fromP && !isBadTiptap(fromP)) {
          combined = fromP;
          if (fromTa && fromTa.length > 0 && !fromP.includes(fromTa) && !fromP.includes(' - ')) {
            combined = `${fromTa} - ${fromP}`;
          }
        } else if (fromTa && !isBadTiptap(fromTa)) {
          combined = fromTa;
          rootEl = ta;
        }
        if (combined && !isBadTiptap(combined)) {
          return { text: combined, el: rootEl };
        }
        const sels = [
          'div.tiptap.ProseMirror',
          '.tiptap.ProseMirror',
          'div.ProseMirror[contenteditable="true"]',
          '[translate="no"].ProseMirror',
          '.ProseMirror[contenteditable="true"]',
          '[role="textbox"].tiptap',
          '[role="textbox"].ProseMirror',
          '.ProseMirror[role="textbox"]',
          'div[contenteditable="true"].ProseMirror',
          'div[class*="ProseMirror"][contenteditable="true"]'
        ];
        let best = '';
        let bestEl = null;
        for (const s of sels) {
          document.querySelectorAll(s).forEach((el) => {
            const t = normText(el.innerText || el.textContent);
            if (isBadTiptap(t)) return;
            if (t.length > best.length) {
              best = t;
              bestEl = el;
            }
          });
        }
        return { text: best, el: bestEl };
      };
      const tiptapPick = getBestTiptapText();
      let tiptapDescription = tiptapPick.text;
      const proseRoot = tiptapPick.el;
      const haveTiptap = tiptapDescription.length > 5 && !isUrl(tiptapDescription);
      
      // Look for the actual JAM session title in various places
      let actualTitle = title;
      let jamContentSpan = null;
      let longestText = '';
      
      if (haveTiptap) {
        actualTitle = tiptapDescription;
        longestText = tiptapDescription;
        jamContentSpan = proseRoot;
        console.log('🔍 JAM PROXY: TipTap/ProseMirror description:', tiptapDescription.substring(0, 100));
      }
      
      // Legacy: span[data-text="true"] (older Jam layouts)
      const jamContentSpans = document.querySelectorAll('span[data-text="true"]');
      
      if (!haveTiptap && jamContentSpans.length > 0) {
        // Find the longest text content (should be the actual session title, not author name)
        jamContentSpans.forEach(span => {
          const text = span.textContent?.trim() || '';
          // Filter out author names - they're typically:
          // - Short (less than 30 chars)
          // - 2-3 words
          // - Don't contain technical terms, Hebrew, or special characters
          const wordCount = text.split(/\s+/).length;
          const hasHebrew = /[\u0590-\u05FF]/.test(text);
          const hasTechnicalTerms = /(popup|display|value|item|order|request|error|bug|issue)/i.test(text);
          const hasSpecialChars = /[&\/\-\|]/.test(text);
          const isLikelyAuthorName = text.length < 30 && wordCount <= 3 && !hasHebrew && !hasTechnicalTerms && !hasSpecialChars;
          
          // Prefer longer, more descriptive text that's not an author name
          if (text.length > longestText.length && !isLikelyAuthorName && text.length > 10) {
            longestText = text;
            jamContentSpan = span;
          }
        });
        
        if (jamContentSpan && longestText) {
          actualTitle = longestText;
          console.log('🔍 JAM PROXY: Found JAM content in span[data-text="true"] (longest):', actualTitle);
        } else if (jamContentSpans.length > 0) {
          // Fallback: longest span text (short titles were wrongly filtered as "author names")
          jamContentSpans.forEach(span => {
            const text = span.textContent?.trim() || '';
            if (text.length > longestText.length && text.length > 2 && !/^word(\s+word)+$/i.test(text)) {
              longestText = text;
              jamContentSpan = span;
            }
          });
          if (longestText) actualTitle = longestText;
          else actualTitle = title;
        } else {
          console.log('🔍 JAM PROXY: span[data-text="true"] found but no suitable content');
          actualTitle = title;
        }
      } else if (!haveTiptap) {
        console.log('🔍 JAM PROXY: span[data-text="true"] not found');
        actualTitle = title;
      }
      
      // Try to find the real JAM session title (skip if TipTap already gave us the description)
      const titleSelectors = [
        'span[data-text="true"]', // Most important - JAM session content
        'h1',
        'h2', 
        'h3',
        '[data-testid*="title"]',
        '[class*="title"]',
        '[class*="session"]',
        '[data-testid*="session"]',
        '.jam-title',
        '.session-title'
      ];
      
      if (!haveTiptap) {
        for (const selector of titleSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent?.trim();
            if (!text || text.length < 4 || text.includes('Loading')) continue;
            const lo = text.toLowerCase();
            if (UI.has(lo) || isUrl(text)) continue;
            actualTitle = text;
            break;
          }
          if (actualTitle !== title) break;
        }
      }
      
      // Parse the title to extract module and summary
      let module = 'General';
      let summary = 'JAM Session Content';
      
      // First try to parse the original title (which often contains the real content)
      // Use the span content if available, otherwise use the original title
      let titleToParse = title || actualTitle;
      
      console.log('🔍 JAM PROXY: Title to parse:', titleToParse);
      console.log('🔍 JAM PROXY: Original title:', title);
      console.log('🔍 JAM PROXY: Actual title:', actualTitle);
      console.log('🔍 JAM PROXY: JamContentSpan found:', !!jamContentSpan);
      console.log('🔍 JAM PROXY: JamContentSpan text:', jamContentSpan?.textContent);
      
      // Prefer the title that contains a separator (has "Module - Summary" format)
      // This ensures we get the module name, not just the summary
      const hasSeparator = (text) => {
        if (!text) return false;
        const separators = [' - ', ' -', ' | ', ' — ', ' – '];
        // Check if text contains separator AND it's not just at the end (incomplete title)
        return separators.some(sep => {
          const index = text.indexOf(sep);
          return index >= 0 && index < text.length - sep.length - 1; // Not at the end
        });
      };
      
      // Use originalTitle for separator checks (not the potentially overwritten title)
      const titleHasSeparator = hasSeparator(originalTitle);
      const spanHasSeparator = hasSeparator(longestText);
      
      // Check if title ends with separator (incomplete title like "Requests -")
      const titleEndsWithSeparator = originalTitle && /[-–—|]\s*$/.test(originalTitle.trim());
      
      // Priority: 1) Title with separator, 2) Combine title ending with separator + span, 3) Span with separator, 4) Longer title, 5) Longer span
      if (originalTitle && originalTitle !== 'Untitled JAM' && originalTitle !== 'Jam') {
        if (titleHasSeparator && !titleEndsWithSeparator) {
          // document.title has separator and is complete - prefer it (usually has full "Module - Summary" format)
          titleToParse = originalTitle;
          console.log('🔍 JAM PROXY: Using document.title (has separator, complete):', titleToParse);
        } else if (titleEndsWithSeparator && longestText) {
          // Title ends with separator (incomplete) - combine with span content
          // Example: originalTitle="Requests -" + span="כמות ע״פ תקציב..." = "Requests - כמות ע״פ תקציב..."
          // Just append span to title (title already has the separator)
          titleToParse = originalTitle.trim() + ' ' + longestText.trim();
          console.log('🔍 JAM PROXY: Combining title ending with separator + span:', titleToParse);
          console.log('🔍 JAM PROXY: Title part:', originalTitle.trim(), 'Span part:', longestText.substring(0, 50));
        } else if (spanHasSeparator && longestText) {
          // Span has separator but title doesn't - use span
          titleToParse = longestText;
          console.log('🔍 JAM PROXY: Using span content (has separator):', titleToParse);
        } else if (originalTitle.length >= (longestText?.length || 0)) {
          // Title is longer or equal - prefer it
          titleToParse = originalTitle;
          console.log('🔍 JAM PROXY: Using document.title (longer):', titleToParse);
        } else if (longestText) {
          // Span is longer - use it
          titleToParse = longestText;
          console.log('🔍 JAM PROXY: Using span content (longer):', titleToParse);
        } else {
          // Fallback to title
          titleToParse = originalTitle;
          console.log('🔍 JAM PROXY: Using document.title (fallback):', titleToParse);
        }
      } else if (jamContentSpan && longestText) {
        // No valid title, use span content
        titleToParse = longestText;
        console.log('🔍 JAM PROXY: Using span content (no valid title):', titleToParse);
      }
      
      // New Jam: description in TipTap/ProseMirror — always prefer for module/summary (e.g. "Module - rest of sentence")
      if (haveTiptap && tiptapDescription) {
        titleToParse = tiptapDescription.trim();
        console.log('🔍 JAM PROXY: TipTap/ProseMirror is primary source for parsing:', titleToParse.substring(0, 100));
      }
      
      if (titleToParse && titleToParse !== 'Untitled JAM') {
        // Remove "Jam | Video | https://..." chrome — keep real description text only
        titleToParse = stripJamPipeChrome(titleToParse) || titleToParse.replace(/^jam\s*\|\s*/i, '').trim();
        
        // Try to split on common separators (check longer separators first)
        const separators = [' - ', ' — ', ' – ', ' | ', ' -', ' |'];
        let parts = [titleToParse];
        let foundSeparator = false;
        
        console.log('🔍 JAM PROXY: Parsing titleToParse:', JSON.stringify(titleToParse));
        
        for (const sep of separators) {
          if (!titleToParse.includes(sep)) continue;
          const candidateParts = titleToParse.split(sep);
          if (candidateParts.length < 2) continue;
          const firstPart = candidateParts[0].trim();
          const restJoined = candidateParts.slice(1).join(sep).trim();
          // Jam tab title is often "Jam | Video | https://..." — never treat as "module | summary"
          if (sep.includes('|')) {
            const fp = firstPart.toLowerCase();
            if (UI.has(fp) || isUrl(restJoined)) {
              console.log('🔍 JAM PROXY: Skipping pipe split (UI chrome or URL tail):', JSON.stringify(firstPart));
              continue;
            }
          }
          parts = candidateParts;
          foundSeparator = true;
          console.log('🔍 JAM PROXY: Found separator:', JSON.stringify(sep), 'Parts:', parts.map(p => JSON.stringify(p)));
          break;
        }
        
        // If no separator found, try regex pattern for "Word - " or "Word – " etc.
        if (!foundSeparator) {
          // Match pattern like "Requests - " or "Module – " at the start
          // More flexible: allow module name with spaces, followed by separator, then summary
          const separatorRegex = /^([A-Za-z][A-Za-z\s]{0,30}?)\s*[-–—|]\s*(.+)$/;
          const match = titleToParse.match(separatorRegex);
          if (match) {
            const m1 = match[1].trim();
            const m2 = match[2].trim();
            if (!UI.has(m1.toLowerCase()) && !isUrl(m2)) {
              parts = [m1, m2];
              foundSeparator = true;
              console.log('🔍 JAM PROXY: Found separator via regex, Parts:', parts.map(p => JSON.stringify(p)));
            }
          }
          if (!foundSeparator) {
            console.log('🔍 JAM PROXY: No separator found, trying first word inference');
          }
        }
        
        if (foundSeparator && parts.length >= 2) {
          module = parts[0].trim();
          summary = parts.slice(1).join(' - ').trim(); // Rejoin in case summary contains separator
          if (UI.has(module.toLowerCase()) || isUrl(summary)) {
            module = 'General';
            summary = haveTiptap && tiptapDescription ? tiptapDescription : titleToParse;
            if (isUrl(summary)) summary = haveTiptap ? tiptapDescription : 'JAM Session';
          }
          console.log('🔍 JAM PROXY: Extracted module:', module, 'summary:', summary.substring(0, 50));
        } else {
          // If no separator, try to infer module from first word
          const words = titleToParse.split(/\s+/);
          if (words.length > 3 && /^[A-Z]/.test(words[0]) && words[0].length <= 20) {
            // First word looks like a module name
            module = words[0];
            summary = words.slice(1).join(' ');
          } else {
            // Use whole title as summary, General as module
            module = 'General';
            summary = titleToParse;
          }
        }
      } else if (titleToParse === 'Jam') {
        // Handle generic "Jam" title
        module = 'General';
        summary = 'JAM Session';
      }
      
      // Also look for any other content that might be useful
      const contentSelectors = [
        'p',
        'div[class*="content"]',
        'div[class*="description"]',
        '[data-testid*="content"]'
      ];
      
      for (const selector of contentSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent?.trim();
          if (!text || text.length < 20 || text.includes('Loading') || text.includes('Error')) continue;
          if (isUrl(text) || /^https?:\/\//i.test(text)) continue;
          if (element.closest('.ProseMirror, .tiptap')) continue;
          if (summary === 'JAM Session Content') {
            summary = text;
          }
        }
      }
      
      // Last resort: Jam UI leaked "Video" + URL into module/summary — restore from TipTap / cleaned title
      const badMod = (m) => m && UI.has(String(m).toLowerCase().trim());
      const badSum = (s) => !s || isUrl(s);
      if (badMod(module) || badSum(summary)) {
        if (haveTiptap && tiptapDescription && !isUrl(tiptapDescription)) {
          let su = tiptapDescription.trim();
          let mod = 'General';
          for (const sep of [' - ', ' – ', ' — ']) {
            if (su.includes(sep)) {
              const p = su.split(sep);
              if (p.length >= 2 && p[0].trim().length > 1 && p[0].trim().length < 120 && !UI.has(p[0].trim().toLowerCase())) {
                mod = p[0].trim();
                su = p.slice(1).join(sep).trim();
                break;
              }
            }
          }
          module = mod;
          summary = su;
        }
      }
      
      // Extract application URL from links in the JAM content
      let applicationUrl = null;
      
      // Get all links in the document
      const allLinks = document.querySelectorAll('a[href]');
      
      // Look for application URLs with more flexible patterns
      const applicationPatterns = [
        'probuild.co.il',
        'admin.probuild',
        'qa-',
        'staging',
        'production',
        'app.',
        'dashboard',
        'admin',
        'probuild',
        'supplier',
        'order',
        'draft'
      ];
      
      // First, try to find links that match our application patterns
      for (const link of allLinks) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('http')) {
          // Skip JAM, localhost, and common non-application URLs
          if (!href.includes('jam.dev') && 
              !href.includes('localhost') && 
              !href.includes('github.com') &&
              !href.includes('atlassian.net') &&
              !href.includes('jira.com')) {
            
            // Check if this looks like an application URL
            const isApplicationUrl = applicationPatterns.some(pattern => 
              href.toLowerCase().includes(pattern.toLowerCase())
            );
            
            if (isApplicationUrl) {
              applicationUrl = href;
              break;
            }
          }
        }
      }
      
      // If no specific application URL found, look for any external links that aren't obviously non-application
      if (!applicationUrl) {
        for (const link of allLinks) {
          const href = link.getAttribute('href');
          if (href && href.startsWith('http')) {
            // Skip obvious non-application URLs
            if (!href.includes('jam.dev') && 
                !href.includes('localhost') && 
                !href.includes('github.com') &&
                !href.includes('atlassian.net') &&
                !href.includes('jira.com') &&
                !href.includes('stackoverflow.com') &&
                !href.includes('google.com') &&
                !href.includes('youtube.com') &&
                !href.includes('facebook.com') &&
                !href.includes('twitter.com') &&
                !href.includes('linkedin.com')) {
              
              applicationUrl = href;
              break;
            }
          }
        }
      }
      
      // If still no URL found, try to extract from the page content itself
      if (!applicationUrl) {
        // Look for URLs in the page text content
        const pageText = document.body.textContent || '';
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = pageText.match(urlRegex);
        
        if (urls) {
          for (const url of urls) {
            if (!url.includes('jam.dev') && 
                !url.includes('localhost') && 
                !url.includes('github.com') &&
                !url.includes('atlassian.net') &&
                !url.includes('jira.com')) {
              
              applicationUrl = url;
              break;
            }
          }
        }
      }
      
      const bodyHit = extractModuleSummaryFromBody();
      const badModFinal = (m) => m && UI.has(String(m).toLowerCase().trim());
      const badSumFinal = (s) => !s || isUrl(s);
      if (bodyHit) {
        if (badModFinal(module) || badSumFinal(summary) || summary === 'JAM Session Content' ||
            (bodyHit.summary && bodyHit.summary.length > (String(summary || '').length + 5))) {
          module = bodyHit.module;
          summary = bodyHit.summary;
          actualTitle = bodyHit.full;
          console.log('🔍 JAM PROXY: Applied body text pattern (Module - Summary):', module, summary.substring(0, 60));
        }
      }
      
      return {
        title: actualTitle,
        module,
        summary,
        url: window.location.href,
        originalTitle: originalTitle,
        applicationUrl: applicationUrl,
        embeddedTitle,
        embeddedModule,
        embeddedSummary
      };
    });
    
    console.log('🔍 JAM PROXY: Extracted content:', jamContent);

    if (iframeProseText && iframeProseText.includes(' - ')) {
      const si = iframeProseText.indexOf(' - ');
      const imod = iframeProseText.slice(0, si).trim();
      const isum = iframeProseText.slice(si + 3).trim();
      if (imod.length >= 3 && isum.length >= 8 &&
          !JAM_UI_LABELS.has(imod.toLowerCase()) && !isHttpUrlString(isum)) {
        jamContent.module = imod;
        jamContent.summary = isum;
        jamContent.title = iframeProseText;
        console.log('🔍 JAM PROXY: Overrode module/summary from iframe ProseMirror');
      }
    }

    // Prefer document.title when visible title is still generic (jam.dev often sets "Jam | …")
    let mergedDomTitle = jamContent.title;
    const ot = jamContent.originalTitle || '';
    if ((!mergedDomTitle || mergedDomTitle === 'Jam' || mergedDomTitle === 'Untitled JAM') && ot && ot !== 'Jam' && ot.length > 4) {
      mergedDomTitle = ot.replace(/^jam\s*\|\s*/i, '').trim() || ot;
    }
    const strippedFromTitle = mergedDomTitle ? stripJamPipeChrome(mergedDomTitle) : '';
    const strippedFromOt = ot ? stripJamPipeChrome(ot) : '';
    mergedDomTitle = strippedFromTitle || strippedFromOt || mergedDomTitle;
    if (!mergedDomTitle || !isPlausibleJamTitle(mergedDomTitle)) {
      const alt = jamContent.title;
      if (alt && isPlausibleJamTitle(alt)) mergedDomTitle = alt;
    }

    // Prefer API-captured or embedded JSON over DOM when DOM has no real content
    const domHasContent = mergedDomTitle && mergedDomTitle !== 'Jam' && mergedDomTitle !== 'Untitled JAM' && mergedDomTitle.length > 2;
    let title = mergedDomTitle;
    let module = jamContent.module;
    let summary = jamContent.summary;
    if (!domHasContent && (capturedSessionFromApi || jamContent.embeddedTitle)) {
      const fromApi = capturedSessionFromApi || {
        title: jamContent.embeddedTitle,
        module: jamContent.embeddedModule || 'General',
        summary: jamContent.embeddedSummary || jamContent.embeddedTitle
      };
      title = fromApi.title;
      module = fromApi.module || module;
      summary = fromApi.summary || summary;
      console.log('🔍 JAM PROXY: Using API/embedded data:', { title, module, summary });
    }

    // If we have a real title but generic module/summary, split "Module - Summary" style
    if (title && title.length > 2 && title !== 'Jam' && module === 'General' &&
        (summary === 'JAM Session Content' || !summary || summary.length < 2)) {
      for (const sep of [' - ', ' – ', ' — ']) {
        if (title.includes(sep)) {
          const parts = title.split(sep);
          if (parts.length >= 2) {
            module = parts[0].trim() || 'General';
            summary = parts.slice(1).join(sep).trim() || title;
            break;
          }
        }
      }
      if (summary === 'JAM Session Content' || !summary) summary = title;
    }

    // DOM leaked "Video" + URL: re-split from a clean title (never use | from browser title here)
    if (title && title.length > 2 && !isHttpUrlString(title) &&
        (JAM_UI_LABELS.has(String(module || '').toLowerCase().trim()) || isHttpUrlString(summary))) {
      module = 'General';
      summary = title;
      for (const sep of [' - ', ' – ', ' — ']) {
        if (title.includes(sep)) {
          const parts = title.split(sep);
          if (parts.length >= 2 &&
              !JAM_UI_LABELS.has(parts[0].trim().toLowerCase()) &&
              !isHttpUrlString(parts.slice(1).join(sep).trim())) {
            module = parts[0].trim();
            summary = parts.slice(1).join(sep).trim();
            break;
          }
        }
      }
    }

    if (isHttpUrlString(summary)) {
      summary = isPlausibleJamTitle(title) ? title : (stripJamPipeChrome(ot) || title || 'JAM Session');
      module = 'General';
    }
    if (module && JAM_UI_LABELS.has(String(module).toLowerCase().trim())) {
      module = 'General';
      if (isHttpUrlString(summary) || !summary || summary === 'JAM Session Content') {
        summary = title && !isHttpUrlString(title) ? title : (stripJamPipeChrome(ot) || 'JAM Session');
      }
    }

    res.json({
      success: true,
      data: {
        title: title || jamContent.title,
        module: module || jamContent.module,
        summary: summary || jamContent.summary,
        url: jamContent.url,
        originalTitle: jamContent.originalTitle,
        applicationUrl: jamContent.applicationUrl
      }
    });

  } catch (error) {
    console.error('🔍 JAM PROXY: Rendered fetch error:', error.message);
    console.error('🔍 JAM PROXY: Error stack:', error.stack);
    console.error('🔍 JAM PROXY: Failed URL:', req.query.url);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to: ${JIRA_CONFIG.BASE_URL}/rest/api/3`);
});
