// CDP-based Hero diagnostic: evaluate state + screenshot
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9226;
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8080/';
const width = parseInt(process.argv[3] || '1440', 10);
const height = parseInt(process.argv[4] || '900', 10);
const outFile = process.argv[5] || 'docs/screenshots/hero-asset/_diag.png';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-hero-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions',
  '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir,
  '--window-size=' + width + ',' + height, 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let killed = false;
function cleanup() { if (killed) return; killed = true; try { chrome.kill(); } catch {} try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {} }
function fail(msg) { console.error('FAIL:', msg); cleanup(); process.exit(1); }

setTimeout(async () => {
  try {
    const info = await new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}/json/version`, (res) => {
        let body = ''; res.on('data', d => body += d);
        res.on('end', () => resolve(JSON.parse(body))); res.on('error', reject);
      }).on('error', reject);
    });

    const ws = new WebSocket(info.webSocketDebuggerUrl, { perMessageDeflate: false });
    ws.on('error', (e) => fail('ws error: ' + e.message));
    await new Promise(r => ws.once('open', r));

    let msgId = 0;
    const pending = new Map();
    const events = [];
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      } else if (msg.method) {
        events.push(msg);
      }
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++msgId;
      pending.set(id, (m) => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Target.setDiscoverTargets', { discover: true });
    const targets = await send('Target.getTargets', {});
    const pageTarget = targets.targetInfos.find(t => t.type === 'page');
    const session = await send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });
    const sessionId = session.sessionId;
    const sendS = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++msgId;
      pending.set(id, (m) => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
      ws.send(JSON.stringify({ sessionId, id, method, params }));
    });

    await sendS('Page.enable');
    await sendS('Runtime.enable');
    await sendS('DOM.enable');
    await sendS('Network.enable');
    await sendS('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });

    const loadPromise = new Promise((resolve) => {
      const check = (m) => {
        if (m.method === 'Page.loadEventFired') resolve();
      };
      const orig = events.length;
      const interval = setInterval(() => {
        const ev = events.find((e, i) => i >= orig && e.method === 'Page.loadEventFired');
        if (ev) { clearInterval(interval); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(interval); resolve(); }, 15000);
    });
    await sendS('Page.navigate', { url });
    await loadPromise;
    await new Promise(r => setTimeout(r, 2000));

    // Eval diagnostic state
    const evalRes = await sendS('Runtime.evaluate', {
      expression: `
        (function() {
          const heroMedia = document.querySelector(".hero__media");
          const heroContainer = document.querySelector(".hero__container");
          const heroNoise = document.querySelector(".hero__media-noise");
          const heroVignette = document.querySelector(".hero__media-vignette");
          const heroLabel = document.querySelector(".hero__media-label");
          const heroScene = document.querySelector(".hero__scene");
          const heroImg = heroMedia ? heroMedia.querySelector("img") : null;
          const get = (el) => {
            if (!el) return null;
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return {
              rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
              display: s.display,
              opacity: s.opacity,
              mixBlendMode: s.mixBlendMode,
              zIndex: s.zIndex,
              background: s.background ? s.background.slice(0, 80) : null,
            };
          };
          return JSON.stringify({
            viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
            heroContainer: get(heroContainer),
            heroMedia: get(heroMedia),
            heroMediaChildren: heroMedia ? Array.from(heroMedia.children).map(c => c.tagName + (c.className ? "." + c.className.split(" ").join(".") : "")) : [],
            heroScene: get(heroScene),
            heroNoise: get(heroNoise),
            heroVignette: get(heroVignette),
            heroLabel: get(heroLabel),
            heroImg: heroImg ? {
              src: heroImg.src,
              naturalWidth: heroImg.naturalWidth,
              naturalHeight: heroImg.naturalHeight,
              complete: heroImg.complete,
              objectFit: getComputedStyle(heroImg).objectFit,
              objectPosition: getComputedStyle(heroImg).objectPosition,
              ...get(heroImg),
            } : null,
            cssVars: {
              heroMediaPos: getComputedStyle(document.documentElement).getPropertyValue("--hero-media-pos").trim(),
              heroMediaPosMobile: getComputedStyle(document.documentElement).getPropertyValue("--hero-media-pos-mobile").trim(),
              heroOverlay: getComputedStyle(document.documentElement).getPropertyValue("--hero-overlay").trim(),
            },
          });
        })();
      `,
      returnByValue: true,
    });

    console.log('=== STATE ===');
    console.log(evalRes.result.value);

    // Screenshot
    const ss = await sendS('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outFile, Buffer.from(ss.data, 'base64'));
    console.log('SCREENSHOT:', outFile);
  } catch (e) {
    fail(e.message);
  } finally {
    cleanup();
    process.exit(0);
  }
}, 1500);