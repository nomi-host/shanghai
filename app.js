(() => {
  'use strict';
  const { PLACES, DAYS, INFO, CHECKLIST, PHRASES, TRIP, EXTRA = {}, CREDITS = {} } = window.TRIP_DATA;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('sh26:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('sh26:' + k, JSON.stringify(v)); } catch { /* 저장 불가 환경 */ } },
  };

  /* ---------- 아이콘: Google Material Symbols Rounded ---------- */
  const MS = {
    food: 'restaurant', dessert: 'icecream', tea: 'emoji_food_beverage', shop: 'shopping_bag', sight: 'photo_camera',
    architecture: 'villa', street: 'directions_walk', bar: 'local_bar', move: 'directions_subway', plane: 'flight',
    stay: 'hotel', info: 'info', weather: 'partly_cloudy_day', passport: 'badge', money: 'payments', plug: 'power',
    wifi: 'wifi', apps: 'apps', sos: 'sos', castle: 'castle', ticket: 'confirmation_number', pin: 'location_on', luggage: 'luggage', photo: 'photo_library',
  };
  const ms = (name, cls = '') => `<span class="ms ${cls}" aria-hidden="true">${name}</span>`;
  const icon = (cat) => `<span class="ico ${esc(cat)}" aria-hidden="true">${ms(MS[cat] || 'info', 'fill')}</span>`;
  const CHEV = ms('chevron_right', 'chev');
  const PIN = ms('location_on', 'fill');
  const SPK = ms('volume_up', 'fill');
  const CAT_KO = { food: '식당', dessert: '디저트', tea: '차', shop: '편집샵·숍', sight: '명소', architecture: '건축', street: '거리', bar: '바', stay: '숙소', move: '이동' };

  /* ---------- 고덕지도 링크 ---------- */
  function amapUrl(p) {
    const name = encodeURIComponent(p.cn || p.name);
    if (p.lng && p.lat) {
      return `https://uri.amap.com/marker?position=${p.lng},${p.lat}&name=${name}&src=sh26trip&coordinate=gaode&callnative=1`;
    }
    const kw = encodeURIComponent(p.q || p.cn || p.name);
    return `https://uri.amap.com/search?keyword=${kw}&city=310000&src=sh26trip&callnative=1`;
  }
  function gmapUrl(p) {
    const q = p.addr ? `${p.cn || p.name} ${p.addr}` : `${p.q || p.cn || p.name} 上海`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }
  const gmapPill = (p, label = '구글맵') => `<a class="pill" href="${gmapUrl(p)}" target="_blank" rel="noopener">${ms('map', 'fill')}${label}</a>`;
  const mapPill = (p, label = '고덕지도') => `<a class="pill" href="${amapUrl(p)}" target="_blank" rel="noopener">${PIN}${label}</a>`;
  const showPill = (ko, zh) => `<button class="pill" data-show-ko="${esc(ko)}" data-show-zh="${esc(zh)}">크게 보여주기</button>`;

  /* ---------- 시간 ---------- */
  function shanghaiNow() {
    const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const parts = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, hm: `${parts.hour}:${parts.minute}` };
  }
  const now = shanghaiNow();
  const todayIdx = DAYS.findIndex((d) => d.date === now.date);

  /* ---------- 일정 ---------- */
  let dayIdx = todayIdx >= 0 ? todayIdx : store.get('day', 0);
  if (!(dayIdx >= 0 && dayIdx < DAYS.length)) dayIdx = 0;

  function extraHtml(ex) {
    if (!ex) return '';
    let h = '';
    const ph = ex.photos || [];
    if (ph.length) {
      const figs = ph.map((p, i) => `<figure class="hero"><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">${p.credit ? `<figcaption>${esc(p.credit)}</figcaption>` : ''}${ph.length > 1 ? `<span class="hero-count">${i + 1}/${ph.length}</span>` : ''}</figure>`).join('');
      h += ph.length > 1
        ? `<div class="gallery" aria-label="사진 ${ph.length}장, 옆으로 넘겨 보기"><div class="gallery-track">${figs}</div><div class="gallery-dots" aria-hidden="true">${ph.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div></div>`
        : figs;
    }
    if (ex.must && ex.must.length) {
      h += `<h4>Must-do</h4><ul class="must">${ex.must.map((x) => `<li>${ms('star', 'fill')}<span>${esc(x)}</span></li>`).join('')}</ul>`;
    }
    if (ex.menu && ex.menu.length) {
      h += `<h4>대표 메뉴</h4><div class="menu">${ex.menu.map(([zh, ko, tag]) => {
        const body = `<span class="menu-main">${zh ? `<span class="menu-zh" lang="zh-CN">${esc(zh)}</span>` : ''}<span class="menu-ko">${esc(ko)}</span></span>${tag ? `<span class="menu-tag">${esc(tag)}</span>` : ''}`;
        return zh && /[一-鿿]/.test(zh)
          ? `<button class="menu-item" data-show-ko="${esc(ko)}" data-show-zh="${esc(zh)}" aria-label="${esc(ko)} 크게 보여주기">${body}</button>`
          : `<div class="menu-item">${body}</div>`;
      }).join('')}</div>${ex.menu.some(([zh]) => /[\u4e00-\u9fff]/.test(zh)) ? '<p class="menu-hint">중국어 메뉴명을 누르면 크게 보여줘요. 직원에게 그대로 보여주세요.</p>' : ''}`;
    }
    return h;
  }

  function detailHtml(it, p) {
    let h = '';
    const exKey = it.extra !== undefined ? it.extra : it.place;
    h += extraHtml(exKey ? EXTRA[exKey] : null);
    if (it.warn) h += `<div class="warn">${esc(it.warn)}</div>`;
    (it.detail || []).forEach((s) => {
      h += `<h4>${esc(s.h)}</h4>`;
      if (s.li) h += `<ul>${s.li.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
      if (s.p) h += `<p>${esc(s.p)}</p>`;
    });
    if (it.alts && it.alts.length) {
      h += `<h4>${esc(it.altsTitle || '대안')}</h4>`;
      h += it.alts.map((a) => `<div class="alt"><div class="alt-main"><div class="alt-name">${esc(a.name)} <span lang="zh-CN" style="font-weight:400;color:var(--label2)">${esc(a.cn || '')}</span></div><div class="alt-meta">${esc(a.meta || '')}</div></div><div class="alt-btns">${mapPill(a, '고덕')}${gmapPill(a, '구글')}</div></div>`).join('');
    }
    const chips = [];
    if (p) {
      chips.push(mapPill(p, '고덕지도'));
      chips.push(gmapPill(p, '구글맵'));
      if (p.addr) chips.push(showPill(p.name, `${p.cn}\n${p.addr}`));
    }
    if (chips.length) h += `<div class="chips">${chips.join('')}</div>`;
    return h;
  }

  let planMode = store.get('planMode', 'day');
  function itemHtml(it, i, dIdx, nowI, open) {
    const p = it.place ? PLACES[it.place] : null;
    const cat = it.cat || (p && p.cat) || 'move';
    const title = it.title || (p && p.name) || '';
    const zh = it.cn !== undefined ? it.cn : p ? p.cn : '';
    const hasDetail = !!(it.detail || it.alts || it.warn || p || EXTRA[it.extra]);
    const id = `d${dIdx}-${i}`;
    const nowCls = i === nowI ? ' is-now' : '';
    const inner = `<span class="row-time">${esc(it.t)}</span>${icon(cat)}<span class="row-main"><span class="row-title" style="display:block">${esc(title)}${it.warn ? ' <span style="color:var(--warn)" aria-label="주의">•</span>' : ''}</span>${zh ? `<span class="row-zh" lang="zh-CN" style="display:block">${esc(zh)}</span>` : ''}${it.note ? `<span class="row-note" style="display:block">${esc(it.note)}</span>` : ''}</span>`;
    if (!hasDetail) return `<div class="row${nowCls}" style="--inset:74px">${inner}</div>`;
    if (open) {
      // 전체 보기: 버튼이 아닌 일반 블록이라 글자 선택·복사가 됨
      return `<div class="row${nowCls}" style="--inset:74px">${inner}</div><div class="detail is-open"><div class="detail-inner"><div class="detail-pad">${detailHtml(it, p)}</div></div></div>`;
    }
    return `<button class="row${nowCls}" style="--inset:74px" aria-expanded="false" aria-controls="${id}" data-toggle="${id}">${inner}${CHEV}</button><div class="detail" id="${id}"><div class="detail-inner"><div class="detail-pad">${detailHtml(it, p)}</div></div></div>`;
  }

  function renderPlan() {
    const el = $('#screen-plan');
    let h = `<div class="title-row"><h1 class="large-title brand"><img src="mascot.png" alt="" width="42" height="45">${esc(TRIP.title)}</h1><button class="refresh refresh-inline" data-refresh aria-label="새로고침"><span class="ms" aria-hidden="true">refresh</span></button></div><p class="subhead">${esc(TRIP.sub)}</p>`;
    const allOn = planMode === 'all';
    const dayBtns = DAYS.map((x, i) => `<button class="day${i === todayIdx ? ' is-today' : ''}" role="tab" aria-selected="${!allOn && i === dayIdx}" data-day="${i}"><span class="day-w">${esc(x.w)}</span><span class="day-n">${Number(x.date.slice(8))}</span></button>`).join('');
    const allBtn = `<button class="day day-all" role="tab" aria-selected="${allOn}" data-pm="all" aria-label="전체 일정 펼쳐 보기"><span class="day-w">전체</span><span class="day-n"><span class="ms" aria-hidden="true">view_agenda</span></span></button>`;
    h += `<div class="trip-card">${nowCard()}<div class="days" role="tablist" aria-label="날짜">${dayBtns}${allBtn}</div></div>`;
    if (planMode === 'all') {
      h += `<p class="group-f" style="margin:0 4px 6px">모든 일정이 펼쳐져 있어요. 길게 눌러 글자를 선택하고 복사할 수 있어요.</p>`;
      DAYS.forEach((d, dIdx) => {
        const nowI = dIdx === todayIdx ? d.items.reduce((acc, it, i) => (/^\d/.test(it.t) && it.t <= now.hm ? i : acc), -1) : -1;
        h += `<div class="day-head" style="margin-top:26px"><h2>${Number(d.date.slice(5, 7))}/${Number(d.date.slice(8))}(${esc(d.w)}) ${esc(d.title)}</h2>${d.sub ? `<p>${esc(d.sub)}</p>` : ''}</div>`;
        h += `<div class="list selectable">${d.items.map((it, i) => itemHtml(it, i, dIdx, nowI, true)).join('')}</div>`;
        if (d.foot) h += `<p class="group-f">${esc(d.foot)}</p>`;
      });
    } else {
      const d = DAYS[dayIdx];
      h += `<div class="day-head"><h2>${esc(d.title)}</h2>${d.sub ? `<p>${esc(d.sub)}</p>` : ''}</div>`;
      const nowI = dayIdx === todayIdx ? d.items.reduce((acc, it, i) => (/^\d/.test(it.t) && it.t <= now.hm ? i : acc), -1) : -1;
      h += `<div class="list">${d.items.map((it, i) => itemHtml(it, i, dayIdx, nowI, false)).join('')}</div>`;
      if (d.foot) h += `<p class="group-f">${esc(d.foot)}</p>`;
    }
    h += `<p class="foot">조사 기준 ${esc(TRIP.asOf)} · 출발 전 영업시간 재확인</p>`;
    el.innerHTML = h;
  }

  function nowCard() {
    const start = DAYS[0].date;
    if (now.date < start) {
      const diff = Math.round((Date.parse(start) - Date.parse(now.date)) / 86400000);
      return `<div class="trip-top"><div class="trip-big">D-${diff}</div><div class="trip-info"><div class="trip-k">출발까지</div><div class="trip-s">${esc(TRIP.flightOut)}</div></div></div>`;
    }
    if (todayIdx < 0) return '<div class="trip-top"><div class="trip-info"><div class="trip-k">여행 끝</div><div class="trip-s">즐거웠어요</div></div></div>';
    const d = DAYS[todayIdx];
    const next = d.items.find((it) => /^\d/.test(it.t) && it.t > now.hm);
    if (!next) return `<div class="trip-top"><div class="trip-info"><div class="trip-k">오늘 일정 끝</div><div class="trip-s">푹 쉬기</div></div></div>`;
    const p = next.place ? PLACES[next.place] : null;
    return `<div class="trip-top"><div class="trip-big">${esc(next.t)}</div><div class="trip-info"><div class="trip-k">다음 일정</div><div class="trip-s trip-strong">${esc(next.title || (p && p.name))}</div>${p ? `<div class="trip-s" lang="zh-CN">${esc(p.cn)}</div>` : ''}</div></div>`;
  }

  /* ---------- 장소 ---------- */
  let placeFilter = 'all';
  let placeQuery = '';
  let placeCat = 'all';
  const CAT_ORDER = ['food', 'dessert', 'tea', 'shop', 'architecture', 'street', 'sight', 'bar', 'stay', 'move'];
  /* 칩은 비슷한 카테고리를 묶어서 보여줌 */
  const CAT_CHIPS = [
    ['all', '전체', 'apps'], ['food', '식당', 'restaurant', ['food']], ['sweet', '디저트·차', 'icecream', ['dessert', 'tea']],
    ['shop', '숍', 'shopping_bag', ['shop']], ['see', '건축·명소', 'villa', ['architecture', 'street', 'sight']],
    ['bar', '바', 'local_bar', ['bar']], ['etc', '숙소·이동', 'hotel', ['stay', 'move']],
  ];
  const chipBar = (attr, items, cur, label) => `<div class="chipbar" role="group" aria-label="${label}">${items.map(([k, t, ic]) =>
    `<button class="chip" data-${attr}="${esc(k)}" aria-pressed="${k === cur}">${ic ? ms(ic, 'fill') : ''}${esc(t)}</button>`).join('')}</div>`;
  /* 다시 그려도 선택된 칩이 칩 줄 안에 보이게 */
  function keepChipVisible(root) {
    const bar = root.querySelector('.chipbar'); const on = bar && bar.querySelector('.chip[aria-pressed="true"]');
    if (!on) return;
    const over = on.offsetLeft + on.offsetWidth - (bar.scrollLeft + bar.clientWidth);
    if (over > 0) bar.scrollLeft += over + 16; else if (on.offsetLeft < bar.scrollLeft) bar.scrollLeft = on.offsetLeft - 16;
  }
  function renderPlaces() {
    const el = $('#screen-places');
    if (!el.dataset.built) {
      el.innerHTML = `<div class="title-row"><h1 class="large-title">Places</h1><button class="refresh refresh-inline" data-refresh aria-label="새로고침"><span class="ms" aria-hidden="true">refresh</span></button></div><p class="subhead">누르면 고덕지도 앱에서 열려요. 주요 장소는 고덕 즐겨찾기(food·shopping·place)에 저장돼 있어요.</p>
      ${chipBar('pc', CAT_CHIPS, placeCat, '카테고리')}
      <label class="search">${ms('search')}<input type="search" id="placeQ" placeholder="이름, 중국어, 지역 검색" aria-label="장소 검색"></label>
      <div class="seg" role="group" aria-label="장소 필터"><button data-pf="all" aria-pressed="true">전체</button><button data-pf="planned" aria-pressed="false">일정</button><button data-pf="backup" aria-pressed="false">후보</button></div>
      <div id="placeList"></div>
      <p class="group-f" style="margin-top:20px">한 번에 저장하려면 <a href="gaode.html">고덕지도 빠른 저장 목록</a>을 쓰세요.</p>`;
      el.dataset.built = '1';
    }
    const q = placeQuery.trim().toLowerCase();
    const catSet = (CAT_CHIPS.find((c) => c[0] === placeCat) || [])[3];
    const items = Object.entries(PLACES).filter(([, p]) => (placeFilter === 'all' || p.status === placeFilter) &&
      (!catSet || catSet.includes(p.cat)) &&
      (!q || [p.name, p.cn, p.area, p.addr, CAT_KO[p.cat]].join(' ').toLowerCase().includes(q)));
    let h = '';
    CAT_ORDER.forEach((c) => {
      const g = items.filter(([, p]) => p.cat === c);
      if (!g.length) return;
      h += `<h3 class="group-h">${esc(CAT_KO[c])}</h3><div class="list">`;
      g.forEach(([, p]) => {
        h += `<a class="row" style="--inset:57px" href="${amapUrl(p)}" target="_blank" rel="noopener">${icon(p.cat)}<span class="row-main"><span class="row-title" style="display:block">${esc(p.name)}${p.status === 'planned' ? '' : ' <span style="font-size:13px;color:var(--label2)">후보</span>'}</span><span class="row-zh" lang="zh-CN" style="display:block">${esc(p.cn)}</span><span class="row-note" style="display:block">${esc([p.area, p.hours, p.memo].filter(Boolean).join(' · '))}</span></span>${CHEV}</a>`;
      });
      h += `</div>`;
    });
    $('#placeList').innerHTML = h || `<p class="group-f" style="text-align:center;margin-top:30px">검색 결과가 없어요. 다른 이름이나 중국어로 찾아보세요.</p>`;
  }

  /* ---------- 정보 ---------- */
  function renderInfo() {
    const el = $('#screen-info');
    let h = `<div class="title-row"><h1 class="large-title">Info</h1><button class="refresh refresh-inline" data-refresh aria-label="새로고침"><span class="ms" aria-hidden="true">refresh</span></button></div><p class="subhead">출발 전에 한 번, 도착해서 한 번 보면 돼요.</p><div class="chips" style="margin:0 0 4px"><button class="pill" data-expand-all="screen-info">모두 펼치기</button><button class="pill" data-collapse-all="screen-info">모두 접기</button></div>`;
    INFO.forEach((g) => {
      h += `<h3 class="group-h">${esc(g.group)}</h3><div class="list">`;
      g.rows.forEach((r, i) => {
        const id = `info-${esc(g.group)}-${i}`.replace(/\s/g, '');
        h += `<button class="row" style="--inset:57px" aria-expanded="false" aria-controls="${id}" data-toggle="${id}">${icon(r.icon)}<span class="row-main"><span class="row-title" style="display:block">${esc(r.title)}</span>${r.summary ? `<span class="row-sub" style="display:block">${esc(r.summary)}</span>` : ''}</span>${CHEV}</button>`;
        h += `<div class="detail" id="${id}"><div class="detail-inner"><div class="detail-pad" style="padding-left:57px">${detailHtml(r, null)}${r.show ? `<div class="chips">${showPill(r.show[0], r.show[1])}</div>` : ''}</div></div></div>`;
      });
      h += `</div>`;
      if (g.foot) h += `<p class="group-f">${esc(g.foot)}</p>`;
    });
    const done = store.get('check', {});
    h += `<h3 class="group-h">출발 전 체크리스트</h3><div class="list">`;
    CHECKLIST.forEach((c, i) => {
      h += `<label class="check"><input type="checkbox" data-check="${i}"${done[i] ? ' checked' : ''}><span>${esc(c)}</span></label>`;
    });
    h += `</div><p class="group-f">체크 상태는 이 기기에만 저장돼요.</p>`;
    h += creditsHtml();
    h += `<p class="foot">조사 기준 ${esc(TRIP.asOf)}</p>`;
    el.innerHTML = h;
  }

  /* 사진 출처: CC BY/BY-SA는 저작자·라이선스·원본 링크 표기 */
  const LICENSE_URL = {
    'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/', 'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
    'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/', 'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
    'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/', CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
    'Pixabay Content License': 'https://pixabay.com/service/license-summary/',
  };
  function creditsHtml() {
    const list = Object.entries(CREDITS);
    if (!list.length) return '';
    const link = (href, text) => href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text);
    const items = list.map(([k, c]) => {
      const name = c.label || (PLACES[k] && PLACES[k].name) || k;
      const src = c.src === 'pixabay' ? 'Pixabay' : 'Wikimedia Commons';
      return `<li><span class="credit-name">${esc(name)}</span><span class="credit-meta">${esc(c.author)} · ${link(LICENSE_URL[c.license], c.license)} · ${link(c.page, src + ' 원본')}</span></li>`;
    }).join('');
    return `<h3 class="group-h">사진 출처</h3><div class="list"><button class="row" style="--inset:57px" aria-expanded="false" aria-controls="info-credits" data-toggle="info-credits">${icon('photo')}<span class="row-main"><span class="row-title" style="display:block">사진 출처</span><span class="row-sub" style="display:block">대표 사진 ${list.length}장 · 저작자·라이선스·원본</span></span>${CHEV}</button><div class="detail" id="info-credits"><div class="detail-inner"><div class="detail-pad" style="padding-left:57px"><p>상세 화면의 대표 사진은 위키미디어 공용·Pixabay의 자유 이용 사진이에요. ‘참고 이미지’는 그 가게 실물이 아닌 일반 사진이에요. 사진은 원본에서 잘라 썼어요.</p><ul class="credits">${items}</ul></div></div></div></div>`;
  }

  /* ---------- 회화 ---------- */
  let zhVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    zhVoice = vs.find((v) => /zh[-_]CN/i.test(v.lang) && /Ting|Li-mu|Yu-shu|Xiaoxiao/i.test(v.name)) ||
      vs.find((v) => /zh[-_]CN/i.test(v.lang)) || vs.find((v) => /^zh/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  let slow = store.get('slow', false);
  function speak(text, btn) {
    if (!('speechSynthesis' in window)) { alertLine('이 브라우저는 음성 재생을 지원하지 않아요.'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, '，'));
    u.lang = 'zh-CN';
    if (zhVoice) u.voice = zhVoice;
    u.rate = slow ? 0.6 : 0.9;
    document.querySelectorAll('.speak.is-playing').forEach((b) => b.classList.remove('is-playing'));
    if (btn) { btn.classList.add('is-playing'); u.onend = u.onerror = () => btn.classList.remove('is-playing'); }
    speechSynthesis.speak(u);
  }
  function alertLine(msg) {
    const p = document.createElement('p'); p.className = 'warn'; p.textContent = msg;
    $('#screen-talk').prepend(p); setTimeout(() => p.remove(), 3500);
  }
  let talkGroup = 'all';
  const TALK_ICON = { '기본': 'waving_hand', '줄서기·예약': 'confirmation_number', '맛집 주문': 'ramen_dining', '디즈니': 'castle', '식당': 'restaurant', '바·디저트': 'local_bar', '쇼핑': 'shopping_bag', '교통·길': 'local_taxi', '호텔': 'hotel', '급할 때': 'sos' };
  function renderTalk() {
    const el = $('#screen-talk');
    let h = `<div class="title-row"><h1 class="large-title">Phrases</h1><button class="refresh refresh-inline" data-refresh aria-label="새로고침"><span class="ms" aria-hidden="true">refresh</span></button></div><p class="subhead">스피커를 누르면 중국어로 읽어줘요. 문장을 누르면 크게 보여줘요.</p>`;
    h += chipBar('tg', [['all', '전체', 'apps'], ...PHRASES.map((g) => [g.group, g.group, TALK_ICON[g.group]])], talkGroup, '상황');
    h += `<div class="seg" role="group" aria-label="읽는 속도"><button data-speed="0" aria-pressed="${!slow}">보통 속도</button><button data-speed="1" aria-pressed="${slow}">천천히</button></div>`;
    PHRASES.filter((g) => talkGroup === 'all' || g.group === talkGroup).forEach((g) => {
      h += `<h3 class="group-h">${esc(g.group)}</h3><div class="list">`;
      g.items.forEach(([ko, zh, py]) => {
        h += `<div class="phrase"><button class="phrase-open" data-show-ko="${esc(ko)}" data-show-zh="${esc(zh)}" data-show-py="${esc(py)}"><div class="phrase-ko">${esc(ko)}</div><div class="phrase-zh" lang="zh-CN">${esc(zh)}</div><div class="phrase-py">${esc(py)}</div></button><button class="speak" data-say="${esc(zh)}" aria-label="${esc(ko)} 중국어로 듣기">${SPK}</button></div>`;
      });
      h += `</div>`;
    });
    h += `<p class="group-f">음성은 기기에 내장된 중국어 음성을 써요. 아이폰은 설정 › 손쉬운 사용 › 읽기 및 말하기 › 음성 › 중국어에서 고음질 음성을 받아두면 더 자연스러워요.</p>`;
    el.innerHTML = h;
    keepChipVisible(el);
  }

  /* ---------- 크게 보여주기 ---------- */
  const sheet = $('#showSheet');
  let lastFocus = null;
  function openShow(ko, zh, py) {
    lastFocus = document.activeElement;
    $('#showKo').textContent = ko || '';
    $('#showZh').textContent = zh || '';
    $('#showZh').style.whiteSpace = 'pre-line';
    $('#showPy').textContent = py || '';
    $('#showSpeak').dataset.say = zh || '';
    sheet.hidden = false;
    $('#showClose').focus();
  }
  function closeShow() { sheet.hidden = true; if ('speechSynthesis' in window) speechSynthesis.cancel(); lastFocus && lastFocus.focus(); }
  $('#showClose').addEventListener('click', closeShow);
  $('#showSpeak').addEventListener('click', (e) => speak(e.currentTarget.dataset.say));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeShow(); });

  /* ---------- 탭 & 이벤트 ---------- */
  const renderers = { plan: renderPlan, places: renderPlaces, info: renderInfo, talk: renderTalk };
  let tab = store.get('tab', 'plan');
  if (!renderers[tab]) tab = 'plan';
  function setTab(t) {
    tab = t; store.set('tab', t);
    document.querySelectorAll('.tab').forEach((b) => {
      const on = b.dataset.tab === t;
      b.classList.toggle('is-active', on);
      on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.screen').forEach((s) => { s.hidden = s.id !== `screen-${t}`; });
    $('#navbarTitle').textContent = $(`#screen-${t}`).dataset.title;
    renderers[t]();
    window.scrollTo(0, 0);
    onScroll();
  }
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toggle]');
    if (t) {
      const panel = document.getElementById(t.dataset.toggle);
      const open = t.getAttribute('aria-expanded') !== 'true';
      t.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('is-open', open);
      return;
    }
    const day = e.target.closest('[data-day]');
    if (day) { dayIdx = Number(day.dataset.day); store.set('day', dayIdx); planMode = 'day'; store.set('planMode', 'day'); renderPlan(); return; }
    const say = e.target.closest('[data-say]');
    if (say && say.id !== 'showSpeak') { speak(say.dataset.say, say); return; }
    const show = e.target.closest('[data-show-zh]');
    if (show) { openShow(show.dataset.showKo, show.dataset.showZh, show.dataset.showPy); return; }
    const pm = e.target.closest('[data-pm]');
    if (pm) { planMode = pm.dataset.pm; store.set('planMode', planMode); renderPlan(); return; }
    const ea = e.target.closest('[data-expand-all],[data-collapse-all]');
    if (ea) {
      const open = ea.hasAttribute('data-expand-all');
      const root = document.getElementById(ea.dataset.expandAll || ea.dataset.collapseAll);
      root.querySelectorAll('[data-toggle]').forEach((b) => { b.setAttribute('aria-expanded', String(open)); document.getElementById(b.dataset.toggle)?.classList.toggle('is-open', open); });
      return;
    }
    const pc = e.target.closest('[data-pc]');
    if (pc) {
      placeCat = pc.dataset.pc;
      document.querySelectorAll('[data-pc]').forEach((b) => b.setAttribute('aria-pressed', String(b === pc)));
      renderPlaces(); return;
    }
    const tg = e.target.closest('[data-tg]');
    if (tg) { talkGroup = tg.dataset.tg; renderTalk(); return; }
    const pf = e.target.closest('[data-pf]');
    if (pf) {
      placeFilter = pf.dataset.pf;
      document.querySelectorAll('[data-pf]').forEach((b) => b.setAttribute('aria-pressed', String(b === pf)));
      renderPlaces(); return;
    }
    const sp = e.target.closest('[data-speed]');
    if (sp) {
      slow = sp.dataset.speed === '1'; store.set('slow', slow);
      document.querySelectorAll('[data-speed]').forEach((b) => b.setAttribute('aria-pressed', String(b === sp)));
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'placeQ') { placeQuery = e.target.value; renderPlaces(); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.dataset.check !== undefined) {
      const done = store.get('check', {}); done[e.target.dataset.check] = e.target.checked; store.set('check', done);
    }
  });

  /* PWA(홈 화면 앱)엔 새로고침이 없어서 직접 최신 버전 받기 */
  document.addEventListener('click', async (e) => {
    const rb = e.target.closest('#refreshBtn, [data-refresh]');
    if (!rb) return;
    rb.classList.add('is-spinning');
    try {
      if ('caches' in window) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); }
      if (navigator.serviceWorker) { const r = await navigator.serviceWorker.getRegistration(); if (r) await r.update(); }
    } catch { /* 캐시 접근 불가해도 새로고침은 진행 */ }
    location.reload();
  });
  /* 갤러리 점 표시: 가로 스크롤 위치에 맞춰 */
  document.addEventListener('scroll', (e) => {
    const t = e.target;
    if (!(t instanceof Element) || !t.classList.contains('gallery-track')) return;
    const i = Math.round(t.scrollLeft / t.clientWidth);
    t.parentElement.querySelectorAll('.gallery-dots i').forEach((d, j) => d.classList.toggle('on', j === i));
  }, true);
  const navbar = $('#navbar');
  function onScroll() { navbar.classList.toggle('is-solid', window.scrollY > 36); }
  window.addEventListener('scroll', onScroll, { passive: true });

  setTab(tab);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
