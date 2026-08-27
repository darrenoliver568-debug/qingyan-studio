const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9223;
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8081/';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-inspect-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions',
  '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir,
  '--window-size=1440,900', 'about:blank'
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
    await sendSession('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await sendSession('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2500));

    const inspect = await sendSession('Runtime.evaluate', {
      expression: `
        const media = document.querySelector('.hero__media');
        const noise = document.querySelector('.hero__media-noise');
        const vignette = document.querySelector('.hero__media-vignette');
        const label = document.querySelector('.hero__media-label');
        const video = document.querySelector('.hero__media video');
        const img = document.querySelector('.hero__media img');
        const result = {
          mediaChildCount: media ? media.children.length : -1,
          mediaInnerHTML: media ? media.innerHTML.slice(0, 200) : null,
          hasNoise: !!noise,
          noiseOpacity: noise ? getComputedStyle(noise).opacity : null,
          noisePosition: noise ? getComputedStyle(noise).position : null,
          hasVignette: !!vignette,
          hasLabel: !!label,
          hasVideo: !!video,
          hasImg: !!img,
          videoReadyState: video ? video.readyState : null,
          videoError: video && video.error ? video.error.code : null,
          videoNetworkState: video ? video.networkState : null,
          videoCurrentSrc: video ? video.currentSrc.slice(-40) : null,
        };
        JSON.stringify(result, null, 2);
      `,
      returnByValue: true
    });

    console.log(inspect.result.value);

    ws.close(); cleanup(); process.exit(0);
  } catch (e) { fail(e.message); }
}, 1500);
