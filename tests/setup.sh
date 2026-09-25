#!/bin/sh
# reinstalls the headless test harness (node_modules + system chromium aren't kept between sessions)
cd "$(dirname "$0")"
[ -d node_modules/playwright-core ] || npm i playwright-core@1.47 >/dev/null 2>&1
[ -x /usr/bin/chromium ] || { sudo apt-get update -qq >/dev/null; sudo apt-get install -y -qq chromium fonts-noto-color-emoji >/dev/null 2>&1; }
echo harness ready
