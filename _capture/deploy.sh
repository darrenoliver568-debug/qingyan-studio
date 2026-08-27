#!/bin/bash
# QingYan Studio — 一键推送脚本
# 用法：bash _capture/deploy.sh "改了什么"
# 凭据自动从 Windows Credential Manager 提取，无需手动登录

MSG="${1:-update: $(date '+%Y-%m-%d %H:%M')}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

GIT="C:/Users/Administrator/.workbuddy/binaries/PortableGit/versions/1.2.0/mingw64/bin/git.exe"
WINCRED="C:/Users/Administrator/.workbuddy/binaries/PortableGit/versions/1.2.0/mingw64/bin/git-credential-wincred.exe"
REPO="darrenoliver568-debug/qingyan-studio"

echo "===== QingYan Studio Deploy ====="
echo "Commit: $MSG"
echo ""

# git add + commit
"$GIT" add -A
"$GIT" -c user.name="QingYan Studio" -c user.email="local@qy-studio.local" commit -m "$MSG" 2>/dev/null || echo "(nothing to commit)"

# 提取缓存的 GitHub 凭据
CRED=$(echo -e "protocol=https\nhost=github.com\n" | "$WINCRED" get 2>/dev/null)
USER=$(echo "$CRED" | grep ^username= | cut -d= -f2)
PASS=$(echo "$CRED" | grep ^password= | cut -d= -f2)

if [ -z "$PASS" ]; then
  echo "ERROR: No cached GitHub credentials found."
  echo "Run this in Git Bash first: git push origin main"
  exit 1
fi

# push（token 不回显）
"$GIT" push "https://${USER}:${PASS}@github.com/${REPO}.git" main:main 2>&1 | tail -3
unset CRED USER PASS

echo ""
echo "===== Done ====="
echo "Live: https://darrenoliver568-debug.github.io/qingyan-studio/"
echo "Repo: https://github.com/darrenoliver568-debug/qingyan-studio"
