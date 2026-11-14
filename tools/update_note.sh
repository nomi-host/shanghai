#!/bin/bash
# data.js → 애플 메모 "상해여행 일정 (최신) 🥟" 덮어쓰기 (친구와 공유한 "상해여행🥟" 메모는 건드리지 않음)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${TMPDIR:-/tmp}/sh26_note.html"
node "$ROOT/tools/make_note.js" "$ROOT" "$OUT" >/dev/null
osascript -e "set b to read POSIX file \"$OUT\" as «class utf8»" -e 'tell application "Notes" to set body of note "상해여행 일정 (최신) 🥟" to b'
echo "updated"
# 주의: body 덮어쓰기는 제목/머리말/부머리말 스타일(접기)을 지움. 민영님이 손으로 스타일을 입혀 둠 → 덮어쓰기 전에 꼭 알릴 것.
# (tools/note_headings.js 의 AX 자동 적용은 실제로 안 먹혀서 뺌, 2026-11-14)
