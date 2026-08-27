/*
 * inspect7.js — Reduced-motion + Mobile crop 联合验证
 * 场景：390px 移动视口 + prefers-reduced-motion: reduce
 * 期望：video 存在且 paused=true；--hero-media-pos-mobile 已注入；
 *       object-position 计算值来自 mobile 变量
 * 用法: node inspect7.js <url>
 */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const port = 9230 + Math.floor(Math.random() * 100);
const chromePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.argv[2] || 'http://localhost:8081/';

const userDataDir = 'C:/Users/Administrator/AppData/Local/Temp/edge-inspect7-' + Date.now();
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions', '--autoplay-policy=no-user-gesture-required',
  '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir,
  '--window-size=390,844', 'about:blank'
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
    await sendSession('Runtime.enable');
    // 1) 移动视口 390px
    await sendSession('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    // 2) 模拟 prefers-reduced-motion: reduce
    await sendSession('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await sendSession('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 5000));

    const inspect = await sendSession('Runtime.evaluate', {
      expression: `
        (() => {
          const media = document.querySelector('.hero__media');
          const video = media?.querySelector('video');
          const cs = media ? getComputedStyle(media) : null;
          const videoCS = video ? getComputedStyle(video) : null;
          const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          return {
            viewportW: window.innerWidth,
            mqReduce,
            hasVideo: !!video,
            videoPaused: video ? video.paused : null,
            videoReady: video ? (video.readyState >= 2) : null,
            cssVarDesktop: media ? media.style.getPropertyValue('--hero-media-pos').trim() : null,
            cssVarMobile: media ? media.style.getPropertyValue('--hero-media-pos-mobile').trim() : null,
            videoObjectPosition: videoCS ? videoCS.objectPosition : null,
            noiseExists: !!document.querySelector('.hero__media-noise'),
            vignetteExists: !!document.querySelector('.hero__media-vignette'),
          };
        })()
      `,
      returnByValue: true
    });

    console.log('STATE:', JSON.stringify(inspect.result.value, null, 2));

    ws.close(); cleanup(); process.exit(0);
  } catch (e) { fail(e.message); }
}, 1500);
