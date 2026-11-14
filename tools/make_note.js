// 애플 메모용 HTML: 날짜별 일정은 표(시간 | 일정 | 메모), 섹션 사이 빈 줄 유지
global.window={};require(process.argv[2]+"/data.js");const {DAYS,PLACES,TRIP}=window.TRIP_DATA;
const e=s=>String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
const BL="<div><br></div>";
const li=a=>"<ul>"+a.map(x=>`<li>${e(x)}</li>`).join("")+"</ul>";
const table=(rows)=>"<div><table>"+rows.map(r=>"<tr>"+r.map((c,i)=>`<td>${i===0?`<b>${c}</b>`:c}</td>`).join("")+"</tr>").join("")+"</table></div>";
const today=new Date().toLocaleDateString("ko-KR",{month:"numeric",day:"numeric",timeZone:"Asia/Seoul"});
let h=`<div><h1>상해여행 일정 (최신) 🥟</h1></div><div>${e(TRIP.sub)} · ${today} 업데이트</div><div>웹앱 https://nomi-host.github.io/shanghai/</div>`+BL;
h+="<div><h2>✅ 미리 할 것</h2></div>"+li([
"온라인 입국신고(NIA 12367 앱·알리페이) → QR 캡처","알리페이 해외카드 연결·소액 결제 테스트, 디디 준비","런허관 본점 따종띠엔핑 예약 (11/23 11:00) — 완료 화면 캡처","르메르 위챗 예약 (11/22 15:30) — 매장 15km 안 규칙이면 11/21 도착 후","디즈니 공식 앱(上海迪士尼度假区) 설치, 전날 운영시간 확인","사계민복·리바이시에·헌저우이치엔·좌정우원(11/22): 당일 원격 줄서기(따종띠엔핑·위챗)","보조배터리 3C 마크·1인 2개 · 멀티어댑터 · 소액 현금 · 로밍/eSIM"])+BL;
h+="<div><h2>🛵 배달</h2></div>"+li([
"알리페이 → \"饿了么\" / 위챗 → \"美团外卖\" 미니프로그램 (우상단 ··· 번역)","주소: 上海市黄浦区人民路388号 上海外滩智选假日酒店 + 객실번호 · 로비에서 수령 · 막히면 프런트에 대리 주문","과일: 鲜切水果 · 水果捞 · 水果拼盘 — 草莓, 阳光玫瑰, 芒果, 砂糖橘 / 百果园 · 盒马","밀크티: 茉莉奶白(苹果茉莉奶白+芝士奶盖), 喜茶(多肉葡萄·芝芝莓莓), 霸王茶姬(伯牙绝弦) · 옵션 半糖/少冰/热","양즈깐루: 黄氏壹品汇·水牛奶甜品(瞿溪路店, 새벽 2시까지) · 满记甜品 · 杨枝甘露/双皮奶/姜撞奶","털게(11/23 밤): 熟大闸蟹/现蒸大闸蟹, 11월 하순은 公蟹(수컷, 배딱지 뾰족)"])+BL;
h+="<div><h2>🎢 디즈니 요령</h2></div>"+li(["여권 필수 · 입장 즉시 앱에서 프리미어 액세스(尊享卡) TRON·주토피아","해 질 무렵 퍼레이드 → 폐장 1~2시간 전 인기 어트랙션 → 야간 쇼(성 정면 이매지네이션 가든 奇想花园, 45~60분 전 자리)","디디 승차: 上海迪士尼停车场小型客车上下客区(申迪西路) · 쇼 끝나기 직전에 호출 · 11호선 디즈니역 막차 약 22:30","고덕 즐겨찾기에 奇想花园·米奇大街·승차 구역·디즈니역 저장"])+BL;
h+="<div><h2>📅 일정</h2></div>"+BL;
for(const d of DAYS){
  h+=`<div><h3>${+d.date.slice(5,7)}/${+d.date.slice(8)}(${d.w}) ${e(d.title)}</h3></div>`;
  if(d.sub) h+=`<div>${e(d.sub)}</div>`;
  const rows=[];
  for(const it of d.items){
    const p=it.place?PLACES[it.place]:null; const skip=["hotel","sha"].includes(it.place);
    const name=e(it.title||(p&&p.name)||"")+(p&&!skip&&p.cn?`<br>${e(p.cn)}`:"");
    const memo=[]; if(p&&!skip&&p.addr)memo.push(e(p.addr)); if(p&&!skip&&p.hours)memo.push(e(p.hours)); if(it.note)memo.push(e(it.note));
    let m=memo.join("<br>"); if(it.warn) m+=(m?"<br>":"")+"⚠️ "+e(it.warn);
    rows.push([e(it.t),name,m]);
  }
  h+=table(rows); if(d.foot)h+=`<div>${e(d.foot)}</div>`; h+=BL;
}
const cats=[["🍽 식당",["food"]],["🍰 디저트·차",["dessert","tea"]],["🛍 쇼핑",["shop"]],["🏛 건축·명소",["architecture","street","sight"]],["🍸 바",["bar"]]];
h+="<div><h2>📍 장소 (★=일정)</h2></div>"+BL;
for(const [t,cs] of cats){
  const ps=Object.values(PLACES).filter(p=>cs.includes(p.cat)).sort((a,b)=>(a.status==="planned"?0:1)-(b.status==="planned"?0:1));
  h+=`<div><h3>${t}</h3></div>`+table(ps.map(p=>[(p.status==="planned"?"★ ":"")+e(p.name),e(p.cn)+(p.addr?`<br>${e(p.addr)}`:""),[p.hours,p.memo].filter(Boolean).map(e).join("<br>")]))+BL;
}
require("fs").writeFileSync(process.argv[3],h);console.log(h.length);
