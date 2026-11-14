#!/bin/bash
# data.js → 애플 메모 "상해여행 일정 (최신) 🥟" 덮어쓰기 (친구와 공유한 "상해여행🥟" 메모는 건드리지 않음)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${TMPDIR:-/tmp}/sh26_note.html"
node "$ROOT/tools/make_note.js" "$ROOT" "$OUT" >/dev/null
osascript -e "set b to read POSIX file \"$OUT\" as «class utf8»" -e 'tell application "Notes" to set body of note "상해여행 일정 (최신) 🥟" to b'
echo "updated"
# 진짜 제목/머리말/부머리말 스타일 입히기(접기 화살표). 손쉬운 사용 권한 없으면 건너뜀
osascript -l JavaScript "$ROOT/tools/note_headings.js" >/dev/null 2>&1 && echo "headings styled" || echo "headings skipped (권한 확인)"
