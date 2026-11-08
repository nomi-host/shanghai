#!/bin/bash
# data.js → 애플 메모 "상해여행 일정 (최신) 🥟" 덮어쓰기 (친구와 공유한 "상해여행🥟" 메모는 건드리지 않음)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${TMPDIR:-/tmp}/sh26_note.html"
node "$ROOT/tools/make_note.js" "$ROOT" "$OUT" >/dev/null
osascript -e "set b to read POSIX file \"$OUT\" as «class utf8»" -e 'tell application "Notes" to set body of note "상해여행 일정 (최신) 🥟" to b'
echo "updated"
