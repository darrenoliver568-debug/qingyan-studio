#!/bin/bash
# QingYan Studio — 一键推送脚本
# 用法：在 Git Bash 里运行 bash _capture/deploy.sh "改了什么"
# 或双击运行后输入提交信息

MSG="${1:-update: $(date '+%Y-%m-%d %H:%M')}"

cd "$(dirname "$0")/.." || exit 1

echo "===== QingYan Studio Deploy ====="
echo "Commit: $MSG"

GIT="/c/Users/Administrator/.workbuddy/binaries/PortableGit/versions/1.2.0/mingw64/bin/git.exe"

"$GIT" add -A
"$GIT" commit -m "$MSG" 2>/dev/null || echo "(nothing to commit)"
"$GIT" push origin main

echo ""
echo "===== Done ====="
echo "Live: https://darrenoliver568-debug.github.io/qingyan-studio/"
echo "Repo: https://github.com/darrenoliver568-debug/qingyan-studio"
