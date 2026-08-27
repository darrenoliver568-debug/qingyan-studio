const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9222;
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8080/';
const outFile = process.argv[3] || '';
const width = parseInt(process.argv[4] || '1440', 10);
const height = parseInt(process.argv[5] || '900', 10);
const fullPage = (process.argv[6] || 'false') === 'true';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-cdp-' + Date.now();
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
    let msgId = 0;
    const pending = new Map();
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
    ws.on('error', (e) => fail('ws error: ' + e.message));
    await new Promise(r => ws.once('open', r));

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++msgId; pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }
    const targets = await send('Target.getTargets');
    const pageTarget = targets.targetInfos.find(t => t.type === 'page');
    const sessionId = (await send('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true })).sessionId;
    function sendSession(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = ++msgId; pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params, sessionId }));
      });
    }
    await sendSession('Page.enable');

    // 关键：显式锁定 viewport 尺寸，避免 headless 默认 mobile
    const isMobile = width < 600;
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: isMobile
    });

    await sendSession('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 800));

    // 强制 reveal 可见 + 关掉 hero CSS 动画（避免与 captureScreenshot 抢）
    await sendSession('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
        const style = document.createElement('style');
        style.textContent = '*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; } .hero__container, .hero__content, .hero__badge, .hero__title, .hero__card-bl, .hero__cutout { opacity: 1 !important; transform: none !important; }';
        document.head.appendChild(style);
        document.body.offsetHeight;
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    const layout = await sendSession('Page.getLayoutMetrics');
    const cs = layout.cssContentSize || layout.contentSize;
    const pageHeight = Math.ceil(cs.height);
    console.log('PAGE_HEIGHT=' + pageHeight);

    if (fullPage && outFile) {
      // 用 captureBeyondViewport 截全页；viewport 保持 (width, height)，不撑爆 Hero
      const result = await sendSession('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: pageHeight, scale: 1 }
      });
      fs.writeFileSync(outFile, Buffer.from(result.data, 'base64'));
      console.log('SAVED=' + outFile);
    } else if (outFile) {
      const result = await sendSession('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(outFile, Buffer.from(result.data, 'base64'));
      console.log('SAVED=' + outFile);
    }

    ws.close(); cleanup(); process.exit(0);
  } catch (e) { fail(e.message); }
}, 1500);
