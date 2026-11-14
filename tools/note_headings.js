// 애플 메모 "상해여행 일정 (최신) 🥟"에 진짜 제목/머리말/부머리말 스타일을 입힌다 (접기 화살표용).
// HTML로 body를 덮어쓰면 스타일이 굵은 글씨로만 들어가서, 손쉬운 사용(AX)으로 줄을 선택해 포맷 메뉴를 누른다.
// 실행: osascript -l JavaScript tools/note_headings.js   (cmux에 손쉬운 사용 권한 필요)
const NOTE = '상해여행 일정 (최신) 🥟';
const Notes = Application('Notes');
Notes.activate();
Notes.show(Notes.notes.byName(NOTE));
delay(1.0);
const se = Application('System Events');
const p = se.processes['Notes'];
const fmt = p.menuBars[0].menuBarItems.byName('포맷').menus[0];
function ta() { return p.attributes['AXFocusedUIElement'].value(); }
const t = ta();
if (t.role() !== 'AXTextArea') throw new Error('메모 본문에 포커스가 없음: ' + t.role());
const text = t.attributes['AXValue'].value();
const SECTIONS = ['✅', '🛵', '🎢', '📅', '📍'];
const CATS = ['🍽', '🍰', '🛍', '🏛', '🍸'];
const jobs = [];
let pos = 0;
text.split('\n').forEach((line, i) => {
  const s = pos; pos += line.length + 1;
  if (!line.trim()) return;
  let style = null;
  if (i === 0) style = '제목';
  else if (SECTIONS.some((e) => line.startsWith(e))) style = '머리말';
  else if (/^\d{1,2}\/\d{1,2}\(.\) /.test(line) || CATS.some((e) => line.startsWith(e))) style = '부머리말';
  if (style) jobs.push([s, line.length, style, line]);
});
const done = [];
for (const [s, len, style, line] of jobs) {
  t.attributes['AXSelectedTextRange'].value = [s + 1, s + len];
  delay(0.15);
  fmt.menuItems.byName(style).click();
  delay(0.2);
  done.push(style + ': ' + line);
}
t.attributes['AXSelectedTextRange'].value = [1, 0];
done.join('\n');
