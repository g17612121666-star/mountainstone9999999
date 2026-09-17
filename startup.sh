#!/bin/sh
set -eu
cd /workspace
node scripts/preview.mjs stop || true

ok() {
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 3 http://127.0.0.1:8080/ || echo 000)
  [ "$code" = "200" ]
}

if ok; then
  exit 0
fi

# A process can keep :8080 while serving 500 (SSR HTTPError). Kill it and start clean.
for d in /proc/[0-9]*; do
  pid=${d#/proc/}
  cmd=$(tr "\0" " " < "$d/cmdline" 2>/dev/null || true)
  case "$cmd" in
    *vite\ dev*|*with-app-env.mjs\ vite*)
      kill "$pid" 2>/dev/null || true
      ;;
  esac
done
sleep 1
for d in /proc/[0-9]*; do
  pid=${d#/proc/}
  cmd=$(tr "\0" " " < "$d/cmdline" 2>/dev/null || true)
  case "$cmd" in
    *vite\ dev*|*with-app-env.mjs\ vite*)
      kill -9 "$pid" 2>/dev/null || true
      ;;
  esac
done
sleep 0.5

npm run dev >>/tmp/app-startup.log 2>&1 &

i=0
while [ "$i" -lt 40 ]; do
  if ok; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done

exit 0
