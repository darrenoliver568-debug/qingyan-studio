#!/usr/bin/env bash
# QingYan Studio — 本地静态预览服务器
# 用 Node 内联实现，绑定 127.0.0.1 防 IPv6 抢端口。
# 在 Windows 下比 `python -m http.server` 稳定（Python 版本并发后会 Empty Reply）。

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8080}"
exec "C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2/node.exe" -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const mime = {
  '.html':'text/html;charset=utf-8',
  '.css':'text/css;charset=utf-8',
  '.js':'application/javascript;charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.svg':'image/svg+xml',
  '.json':'application/json',
  '.ico':'image/x-icon',
  '.woff2':'font/woff2',
  '.txt':'text/plain;charset=utf-8',
  '.md':'text/markdown;charset=utf-8',
};
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); res.end('403'); return; }
  fs.stat(f,(e,s)=>{
    if (e || !s.isFile()) { res.writeHead(404); res.end('404'); return; }
    const type = mime[path.extname(f)] || 'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Content-Length':s.size,'Cache-Control':'no-cache'});
    fs.createReadStream(f).pipe(res);
  });
}).listen($PORT,'127.0.0.1',()=>console.log('listening http://127.0.0.1:$PORT'));
" -- "$@"