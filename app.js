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
    wifi: 'wifi', apps: 'apps', sos: 'sos', castle: 'castle', ticket: 'confirmation_number', receipt: 'receipt_long', pin: 'location_on', luggage: 'luggage', photo: 'photo_library',
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
    if (p.gq) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.gq)}`;
    const q = p.addr ? `${p.cn || p.name} ${p.addr}` : `${p.q || p.cn || p.name} 上海`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }
  const gmapPill = (p, label = '구글맵') => p.g === false ? '' : `<a class="pill" href="${gmapUrl(p)}" target="_blank" rel="noopener">${ms('map', 'fill')}${label}</a>`;
  const mapPill = (p, label = '고덕지도') => `<a class="pill" href="${amapUrl(p)}" target="_blank" rel="noopener">${PIN}${label}</a>`;
  const showPill = (ko, zh) => `<button class="pill pill-gray" data-show-ko="${esc(ko)}" data-show-zh="${esc(zh)}">크게 보여주기</button>`;

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
      const figs = ph.map((p, i) => `<figure class="hero"><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async">${ph.length > 1 ? `<span class="hero-count">${i + 1}/${ph.length}</span>` : ''}</figure>`).join('');
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
    // 대안 목록(여러 묶음 가능: altGroups)
    const groups = it.altGroups || (it.alts && it.alts.length ? [{ title: it.altsTitle || '대안', items: it.alts }] : []);
    groups.forEach((g) => {
      h += `<h4>${esc(g.title)}</h4>`;
      h += g.items.map((a) => `<div class="alt${g.pick ? ' alt-pick' : ''}"><div class="alt-main"><div class="alt-name">${esc(a.name)} <span lang="zh-CN" style="font-weight:400;color:var(--label2)">${esc(a.cn || '')}</span></div><div class="alt-meta">${esc(a.meta || '')}</div></div><div class="alt-btns">${mapPill(a, '고덕')}${gmapPill(a, '구글')}</div></div>`).join('');
    });
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
  // 설명글: ' · ' 로 나눈 덩어리를 한 묶음으로 → 줄이 넘어가면 덩어리 사이(· 뒤)에서 바꿈
  const noteHtml = (t) => String(t).split(' · ').map((x, i, a) => `<span class="nseg">${esc(x)}${i < a.length - 1 ? ' ·' : ''}</span>`).join(' ');
  function itemHtml(it, i, dIdx, nowI, open, nums = {}) {
    const p = it.place ? PLACES[it.place] : null;
    const pn = it.place && nums[it.place] && it.cat !== 'move' ? `<span class="row-n" aria-label="지도 ${nums[it.place]}번">${nums[it.place]}</span>` : '';
    const cat = it.cat || (p && p.cat) || 'move';
    const title = it.title || (p && p.name) || '';
    const zh = it.cn !== undefined ? it.cn : p ? p.cn : '';
    const hasDetail = !!(it.detail || it.alts || it.altGroups || it.warn || p || EXTRA[it.extra]);
    const id = `d${dIdx}-${i}`;
    const nowCls = i === nowI ? ' is-now' : '';
    const inner = `<span class="row-lead"><span class="row-time">${esc(it.t)}</span>${icon(cat)}</span><span class="row-main"><span class="row-title" style="display:block">${pn}${esc(title)}${it.warn ? ' <span style="color:var(--warn)" aria-label="주의">•</span>' : ''}</span>${zh ? `<span class="row-zh" lang="zh-CN" style="display:block">${esc(zh)}</span>` : ''}${it.note ? `<span class="row-note" style="display:block">${noteHtml(it.note)}</span>` : ''}</span>`;
    const rid = ` id="r${dIdx}-${i}"`;
    if (!hasDetail) return `<div class="row${nowCls}"${rid} style="--inset:16px">${inner}</div>`;
    if (open) {
      // 전체 보기: 버튼이 아닌 일반 블록이라 글자 선택·복사가 됨
      return `<div class="row${nowCls}"${rid} style="--inset:16px">${inner}</div><div class="detail is-open"><div class="detail-inner"><div class="detail-pad">${detailHtml(it, p)}</div></div></div>`;
    }
    return `<button class="row${nowCls}"${rid} style="--inset:16px" aria-expanded="false" aria-controls="${id}" data-toggle="${id}">${inner}${CHEV}</button><div class="detail" id="${id}"><div class="detail-inner"><div class="detail-pad">${detailHtml(it, p)}</div></div></div>`;
  }

  /* ---------- 날짜별 동선 지도 (tools/build_maps.py 가 만든 이미지 + 핀) ---------- */
  const MAPS = window.TRIP_MAPS || {};
  function pinNums(dIdx) {
    // 일정 줄 번호 표시용: place → 핀 번호(호텔은 0)
    const m = MAPS[dIdx]; const o = {};
    if (m) m.pins.forEach((p) => { o[p.p] = p.n; });
    return o;
  }
  function mapHtml(dIdx) {
    const m = MAPS[dIdx];
    if (!m) return '';
    const d = DAYS[dIdx];
    const lines = m.pins.filter((p) => p.dx !== undefined).map((p) => `<line x1="${p.x}" y1="${p.y}" x2="${p.dx}" y2="${p.dy}"/>`).join('');
    const dots = m.pins.filter((p) => p.dx !== undefined).map((p) => `<i class="dmap-dot" style="left:${p.x}%;top:${p.y}%"></i>`).join('');
    const pins = m.pins.map((p) => {
      const pl = PLACES[p.p] || {};
      // 이동 줄(예: 루자쭈이 → 디즈니)이 아닌 실제 방문 줄을 가리키게
      const vi = d.items.findIndex((x) => x.place === p.p && x.cat !== 'move');
      if (vi >= 0 && p.n) p = { ...p, i: vi };
      const it = p.i != null ? d.items[p.i] : null;
      const name = (it && it.title) || pl.name || '';
      const x = p.dx !== undefined ? p.dx : p.x, y = p.dx !== undefined ? p.dy : p.y;
      const label = p.n ? `${p.n}. ${name}` : `호텔: ${pl.name || ''}`;
      const pc = (it && it.cat) || pl.cat || 'move';
      return `<button class="dmap-pin c-${esc(pc)}${p.n ? '' : ' is-home'}" style="left:${x}%;top:${y}%" ${p.i != null ? `data-goto="r${dIdx}-${p.i}"` : 'disabled'} aria-label="${esc(label)}">${p.n ? p.n : ms('hotel', 'fill')}</button>`;
    }).join('');
    const km = (v) => (v >= 10 ? Math.round(v) : v.toFixed(1));
    const z = m.zoom;
    let zoomH = '';
    if (z) {
      // 동네 확대 지도(예: 디즈니 승차 위치). 핀은 아이콘 + 이름표, 누르면 그 일정으로
      const gi = d.items.findIndex((x, i) => i >= (z.goto || 0) && x.place === d.items[z.goto]?.place && x.cat !== 'move');
      const target = gi >= 0 ? gi : z.goto;
      const zl = z.pins.filter((p) => p.dx !== undefined).map((p) => `<line x1="${p.x}" y1="${p.y}" x2="${p.dx}" y2="${p.dy}"/>`).join('');
      const zd = z.pins.filter((p) => p.dx !== undefined).map((p) => `<i class="dmap-dot" style="left:${p.x}%;top:${p.y}%"></i>`).join('');
      const zp = z.pins.map((p) => {
        const x = p.dx !== undefined ? p.dx : p.x, y = p.dx !== undefined ? p.dy : p.y;
        const pl = PLACES[p.p] || {};
        return `<button class="dmap-pin dmap-tag c-${esc(p.cat)}" style="left:${x}%;top:${y}%" ${target != null ? `data-goto="r${dIdx}-${target}"` : 'disabled'} aria-label="${esc(pl.name || p.label)}">${ms(p.ic, 'fill')}<span>${esc(p.label)}</span></button>`;
      }).join('');
      zoomH = `<figure class="dmap dmap-zoom"><figcaption class="dmap-title">${esc(z.title)}</figcaption><div class="dmap-box" style="aspect-ratio:${z.w}/${z.h}"><div class="dmap-layer" ${projAttr(z)}><img src="${z.img}" alt="${esc(z.title)}" width="${z.w}" height="${z.h}" draggable="false"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${zl}</svg>${zd}${zp}<i class="dmap-me" hidden></i></div>${GPS_BTN}<button class="dmap-reset" data-map-reset aria-label="지도 원래 크기로" hidden>${ms('zoom_out_map')}</button></div></figure>`;
    }
    return `<figure class="dmap"><div class="dmap-box" style="aspect-ratio:${m.w}/${m.h}"><div class="dmap-layer" ${projAttr(m)}><img src="${m.img}" alt="${esc(d.title)} 동선 지도" width="${m.w}" height="${m.h}" draggable="false"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${dots}${pins}<i class="dmap-me" hidden></i></div>${GPS_BTN}<button class="dmap-reset" data-map-reset aria-label="지도 원래 크기로" hidden>${ms('zoom_out_map')}</button></div><figcaption><span><b>차</b> 약 ${km(m.car)}km <i class="dmap-dash is-solid" aria-hidden="true"></i></span><span><b>걷기</b> 약 ${km(m.walk)}km <i class="dmap-dash" aria-hidden="true"></i></span></figcaption></figure>${zoomH}`;
  }

  /* ---------- 내 위치(GPS) ----------
     휴대폰 GPS는 WGS-84, 중국 지도(구글·고덕)는 GCJ-02라 변환해서 찍는다. */
  const projAttr = (m) => `data-proj="${m.proj.z},${m.proj.left},${m.proj.top},${m.proj.f},${m.w},${m.h}"`;
  const GPS_BTN = `<button class="dmap-gps" data-gps aria-label="내 위치 보기" aria-pressed="false">${ms('my_location', 'fill')}</button><span class="dmap-gpsmsg" hidden></span>`;
  function wgs2gcj(lat, lng) {
    const A = 6378245.0, EE = 0.00669342162296594323, PI = Math.PI;
    const x = lng - 105, y = lat - 35;
    let dLat = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    dLat += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    dLat += (20 * Math.sin(y * PI) + 40 * Math.sin(y / 3 * PI)) * 2 / 3;
    dLat += (160 * Math.sin(y / 12 * PI) + 320 * Math.sin(y * PI / 30)) * 2 / 3;
    let dLng = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    dLng += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    dLng += (20 * Math.sin(x * PI) + 40 * Math.sin(x / 3 * PI)) * 2 / 3;
    dLng += (150 * Math.sin(x / 12 * PI) + 300 * Math.sin(x / 30 * PI)) * 2 / 3;
    const rl = lat / 180 * PI; const mm = 1 - EE * Math.sin(rl) ** 2; const sm = Math.sqrt(mm);
    return [lat + dLat * 180 / ((A * (1 - EE)) / (mm * sm) * PI), lng + dLng * 180 / (A / sm * Math.cos(rl) * PI)];
  }
  let gpsWatch = null, gpsFix = null, gpsErr = '';
  function drawMe() {
    document.querySelectorAll('.dmap-layer[data-proj]').forEach((layer) => {
      const box = layer.closest('.dmap-box');
      const me = layer.querySelector('.dmap-me'), msg = box.querySelector('.dmap-gpsmsg'), btn = box.querySelector('[data-gps]');
      btn.setAttribute('aria-pressed', String(gpsWatch !== null));
      let text = '';
      if (gpsWatch === null) { me.hidden = true; }
      else if (!gpsFix) { me.hidden = true; text = gpsErr || '위치 찾는 중…'; }
      else {
        const [z, left, top, f, w, h] = layer.dataset.proj.split(',').map(Number);
        const [lat, lng] = wgs2gcj(gpsFix.lat, gpsFix.lng);
        const n = 256 * 2 ** z, sn = Math.sin(lat * Math.PI / 180);
        const x = ((lng + 180) / 360 * n - left) * f / w * 100;
        const y = ((0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI)) * n - top) * f / h * 100;
        const inside = x >= 0 && x <= 100 && y >= 0 && y <= 100;
        me.hidden = !inside;
        if (inside) { me.style.left = `${x}%`; me.style.top = `${y}%`; } else text = '지금 위치는 이 지도 밖이에요';
      }
      msg.hidden = !text; msg.textContent = text;
    });
  }
  /* 바라보는 방향(나침반): 아이폰은 webkitCompassHeading, 안드로이드는 deviceorientationabsolute */
  let heading = null, hdOn = false, hdRaf = 0;
  function onOrient(e) {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) h = e.webkitCompassHeading;
    else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha;
    if (h === null) return;
    const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;  // 가로로 돌렸을 때 보정
    heading = (h + so + 360) % 360;
    if (!hdRaf) hdRaf = requestAnimationFrame(() => { hdRaf = 0; drawHeading(); });
  }
  function drawHeading() {
    document.querySelectorAll('.dmap-me').forEach((me) => {
      if (heading === null) { me.removeAttribute('data-hd'); return; }
      me.setAttribute('data-hd', ''); me.style.setProperty('--hd', `${heading}deg`);
    });
  }
  function headingStart() {
    if (hdOn) return;
    const add = () => {
      hdOn = true;
      if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', onOrient);
      else window.addEventListener('deviceorientation', onOrient);
    };
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      // 아이폰: 탭(사용자 동작) 안에서만 권한 요청 가능
      DOE.requestPermission().then((r) => { if (r === 'granted') add(); }).catch(() => {});
    } else if (DOE) add();
  }
  function headingStop() {
    window.removeEventListener('deviceorientationabsolute', onOrient); window.removeEventListener('deviceorientation', onOrient);
    hdOn = false; heading = null; drawHeading();
  }

  function gpsStart(fromTap = true) {
    if (!('geolocation' in navigator)) { gpsErr = '이 브라우저는 위치를 못 써요'; return; }
    if (fromTap) headingStart();
    else document.addEventListener('click', headingStart, { once: true });   // 자동으로 켰을 땐 다음 탭에서 방향 권한
    gpsErr = ''; store.set('gps', true);
    gpsWatch = navigator.geolocation.watchPosition(
      (p) => { gpsFix = { lat: p.coords.latitude, lng: p.coords.longitude }; gpsErr = ''; drawMe(); },
      (e) => {
        gpsErr = e.code === 1 ? '위치 권한이 꺼져 있어요 (설정 › 개인정보 › 위치)' : '위치를 못 찾았어요';
        if (e.code === 1) { gpsStop(); gpsErr = ''; store.set('gps', false); alertMap('위치 권한이 꺼져 있어요 (설정 › 개인정보 보호 › 위치 서비스)'); return; }
        drawMe();
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
    drawMe();
  }
  function gpsStop() { if (gpsWatch !== null) navigator.geolocation.clearWatch(gpsWatch); gpsWatch = null; gpsFix = null; store.set('gps', false); headingStop(); drawMe(); }
  function alertMap(t) { document.querySelectorAll('.dmap-gpsmsg').forEach((m) => { m.hidden = false; m.textContent = t; setTimeout(() => { m.hidden = true; }, 4000); }); }

  /* 지도 확대: 두 손가락 핀치·두 번 탭, 확대된 상태에서 한 손가락으로 이동 */
  function initMapZoom(root) {
    root.querySelectorAll('.dmap-box').forEach((box) => {
      const layer = box.querySelector('.dmap-layer');
      const reset = box.querySelector('.dmap-reset');
      let k = 1, tx = 0, ty = 0;
      const pts = new Map();
      let start = null, lastTap = 0;
      const MAXK = 4;
      function clamp() {
        const w = box.clientWidth, h = box.clientHeight;
        k = Math.min(MAXK, Math.max(1, k));
        tx = Math.min(0, Math.max(w - w * k, tx));
        ty = Math.min(0, Math.max(h - h * k, ty));
      }
      function apply(anim) {
        clamp();
        layer.style.transition = anim ? 'transform .25s ease' : 'none';
        layer.style.transform = `translate(${tx}px, ${ty}px) scale(${k})`;
        layer.style.setProperty('--k', k);
        box.classList.toggle('is-zoomed', k > 1.01);
        reset.hidden = k <= 1.01;
      }
      function zoomAt(nk, cx, cy, anim) {
        nk = Math.min(MAXK, Math.max(1, nk));
        tx = cx - (cx - tx) * (nk / k); ty = cy - (cy - ty) * (nk / k); k = nk; apply(anim);
      }
      const local = (e) => { const r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      box.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.dmap-reset, .dmap-gps')) return;
        pts.set(e.pointerId, local(e));
        box.dataset.moved = '0';
        if (pts.size === 2) {
          const [a, b] = [...pts.values()];
          start = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k, tx, ty, c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
        } else if (pts.size === 1) {
          start = { p: local(e), tx, ty };
        }
        if (k > 1.01 || pts.size === 2) box.setPointerCapture?.(e.pointerId);
      });
      box.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId) || !start) return;
        pts.set(e.pointerId, local(e));
        if (pts.size === 2 && start.d) {
          const [a, b] = [...pts.values()];
          const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          const c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          const nk = Math.min(MAXK, Math.max(1, start.k * d / start.d));
          tx = c[0] - (start.c[0] - start.tx) * (nk / start.k); ty = c[1] - (start.c[1] - start.ty) * (nk / start.k); k = nk;
          box.dataset.moved = '1'; apply(false);
        } else if (pts.size === 1 && k > 1.01 && start.p) {
          const p = local(e);
          if (Math.hypot(p[0] - start.p[0], p[1] - start.p[1]) > 6) box.dataset.moved = '1';
          tx = start.tx + p[0] - start.p[0]; ty = start.ty + p[1] - start.p[1]; apply(false);
        }
      });
      const end = (e) => {
        if (!pts.has(e.pointerId)) return;
        pts.delete(e.pointerId);
        if (pts.size === 1) { const p = [...pts.values()][0]; start = { p, tx, ty }; } else if (!pts.size) start = null;
        if (e.type === 'pointerup' && !pts.size && box.dataset.moved !== '1' && !e.target.closest('.dmap-pin, .dmap-reset, .dmap-gps')) {
          const now2 = Date.now();
          if (now2 - lastTap < 300) { const [cx, cy] = local(e); k > 1.01 ? zoomAt(1, cx, cy, true) : zoomAt(2.5, cx, cy, true); lastTap = 0; } else lastTap = now2;
        }
      };
      box.addEventListener('pointerup', end);
      box.addEventListener('pointercancel', end);
      reset.addEventListener('click', (e) => { e.stopPropagation(); k = 1; tx = 0; ty = 0; apply(true); });
      // iOS 사파리: 지도 위 핀치가 페이지 확대로 새지 않게
      box.addEventListener('gesturestart', (e) => e.preventDefault());
      box.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || k > 1.01) e.preventDefault(); }, { passive: false });
    });
  }

  function renderPlan() {
    const el = $('#screen-plan');
    const head = `<div class="title-row"><h1 class="large-title brand"><img src="mascot.png" alt="" width="42" height="45">${esc(TRIP.title)}</h1><button class="refresh refresh-inline" data-refresh aria-label="새로고침"><span class="ms" aria-hidden="true">refresh</span></button></div><p class="subhead">${esc(TRIP.sub)}</p>`;
    let h = '';
    const allOn = planMode === 'all';
    const dayBtns = DAYS.map((x, i) => `<button class="day${i === todayIdx ? ' is-today' : ''}" role="tab" aria-selected="${!allOn && i === dayIdx}" data-day="${i}"><span class="day-w">${esc(x.w)}</span><span class="day-n">${Number(x.date.slice(8))}</span></button>`).join('');
    const allBtn = `<button class="day day-all" role="tab" aria-selected="${allOn}" data-pm="all" aria-label="전체 일정 펼쳐 보기"><span class="day-w">전체</span><span class="day-n"><span class="ms" aria-hidden="true">view_agenda</span></span></button>`;
    h += `<div class="trip-card">${nowCard()}<div class="days" role="tablist" aria-label="날짜">${dayBtns}${allBtn}</div></div>${allOn ? '' : `<div class="wx-drawer${store.get('wxOpen', true) ? ' is-open' : ''}" data-wx="${DAYS[dayIdx].date}" data-drawer="1"></div>`}`;
    if (planMode === 'all') {
      h += `<p class="group-f" style="margin:0 4px 6px">모든 일정이 펼쳐져 있어요. 길게 눌러 글자를 선택하고 복사할 수 있어요.</p>`;
      DAYS.forEach((d, dIdx) => {
        const nowI = dIdx === todayIdx ? d.items.reduce((acc, it, i) => (/^\d/.test(it.t) && it.t <= now.hm ? i : acc), -1) : -1;
        h += `<div class="day-head" style="margin-top:26px"><h2><span class="day-no">Day ${dIdx + 1}.</span> ${Number(d.date.slice(5, 7))}/${Number(d.date.slice(8))}(${esc(d.w)}) ${esc(d.title)}</h2>${d.sub ? `<p>${esc(d.sub)}</p>` : ''}</div><div data-wx="${d.date}"></div>`;
        h += `<div class="list selectable">${d.items.map((it, i) => itemHtml(it, i, dIdx, nowI, true)).join('')}</div>`;
        if (d.foot) h += `<p class="group-f">${esc(d.foot)}</p>`;
      });
    } else {
      const d = DAYS[dayIdx];
      h += `<div class="day-head"><h2><span class="day-no">Day ${dayIdx + 1}.</span> ${esc(d.title)}</h2>${d.sub ? `<p>${esc(d.sub)}</p>` : ''}</div>`;
      h += mapHtml(dayIdx);
      const nowI = dayIdx === todayIdx ? d.items.reduce((acc, it, i) => (/^\d/.test(it.t) && it.t <= now.hm ? i : acc), -1) : -1;
      const nums = pinNums(dayIdx);
      h += `<div class="list">${d.items.map((it, i) => itemHtml(it, i, dayIdx, nowI, false, nums)).join('')}</div>`;
      if (d.foot) h += `<p class="group-f">${esc(d.foot)}</p>`;
    }
    h += `<p class="foot">조사 기준 ${esc(TRIP.asOf)} · 출발 전 영업시간 재확인</p>`;
    // 제목(마스코트)은 한 번만 그리고, 날짜를 바꿀 땐 아래만 갈아끼움 → 아이콘 깜박임 방지
    let body = el.querySelector('#plan-body');
    if (!body) { el.innerHTML = `${head}<div id="plan-body"></div>`; body = el.querySelector('#plan-body'); }
    body.innerHTML = h;
    fillWx(body);
    initMapZoom(body);
    drawMe(); drawHeading();
  }

  function nowCard() {
    const start = DAYS[0].date;
    if (now.date < start) {
      const diff = Math.round((Date.parse(start) - Date.parse(now.date)) / 86400000);
      return `<div class="trip-top"><div class="trip-big">D-${diff}</div><div class="trip-info"><div class="trip-k">출발까지</div><div class="trip-s">${esc(TRIP.flightOut)}</div></div></div>`;
    }
    const top = (big, k, rest) => `<div class="trip-top">${big ? `<div class="trip-big">${big}</div>` : ''}<div class="trip-info"><div class="trip-k">${k}</div>${rest}</div></div>`;
    const lastIdx = DAYS.length - 1;
    const tripEnd = '<div class="trip-top"><div class="trip-info"><div class="trip-k">여행 끝</div><div class="trip-s">즐거웠어요</div></div></div>';
    if (todayIdx < 0 || (todayIdx === lastIdx && now.hm >= '12:00')) return tripEnd;
    const dayNo = `Day ${todayIdx + 1}`;
    // 마지막 날 오전: 공항 도착 시각 + 귀국편
    if (todayIdx === lastIdx) return top(dayNo, `홍차오 공항 T1 ${esc(TRIP.airportBy)}까지`, `<div class="trip-s">${esc(TRIP.flightBack)}</div>`);
    const d = DAYS[todayIdx];
    const next = d.items.find((it) => /^\d/.test(it.t) && it.t > now.hm);
    if (!next) return top(dayNo, '오늘 일정 끝', '<div class="trip-s">푹 쉬기</div>');
    const p = next.place ? PLACES[next.place] : null;
    return top(dayNo, `다음 일정 · ${esc(next.t)}`, `<div class="trip-s trip-strong">${esc(next.title || (p && p.name))}</div>${p ? `<div class="trip-s" lang="zh-CN">${esc(p.cn)}</div>` : ''}`);
  }


  /* ---------- 날씨: Open-Meteo(오픈소스, 키 없음) 시간별 예보 · 3시간 캐시 ---------- */
  const WX_URL = 'https://api.open-meteo.com/v1/forecast?latitude=31.23&longitude=121.47&hourly=temperature_2m,precipitation_probability,precipitation&timezone=Asia%2FShanghai&forecast_days=16';
  let wxData = store.get('wx', null);
  let wxLoading = null;
  function loadWx() {
    if (wxData && Date.now() - wxData.at < 3 * 3600e3) return Promise.resolve(wxData);
    if (!wxLoading) {
      wxLoading = fetch(WX_URL).then((r) => r.json()).then((j) => {
        wxData = { at: Date.now(), h: j.hourly }; store.set('wx', wxData); return wxData;
      }).catch(() => wxData).finally(() => { wxLoading = null; });
    }
    return wxLoading;
  }
  function outfit(lo, hi, wet) {
    let o = hi >= 20 ? '얇은 니트·셔츠 + 가벼운 겉옷' : hi >= 15 ? '니트·맨투맨 + 트렌치·바람막이' : hi >= 10 ? '니트 + 경량 패딩이나 코트' : '코트·패딩 + 머플러';
    if (lo < 8) o += ' · 밤엔 한 겹 더';
    if (wet) o += ' · 우산 챙기기';
    return o;
  }
  function wxHtml(date, drawer) {
    if (!wxData || !wxData.h) return '<div class="wx-card wx-empty">날씨를 불러오지 못했어요. 인터넷 연결 후 새로고침해 주세요.</div>';
    const h = wxData.h; const idx = h.time.map((t, i) => (t.startsWith(date) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) {
      const days = Math.round((Date.parse(date) - Date.now()) / 86400000) - 15;
      return `<div class="wx-card wx-empty">${ms('partly_cloudy_day', 'fill')}<span>아직 예보 범위 밖이에요. ${days > 0 ? `${days}일 뒤부터` : '곧'} 나와요. 11월 하순 평년: 최저 5–12°C · 최고 13–18°C</span></div>`;
    }
    const at = (hr) => { const i = idx.find((k) => h.time[k].endsWith(`${String(hr).padStart(2, '0')}:00`)); return i == null ? null : Math.round(h.temperature_2m[i]); };
    const day = idx.filter((k) => { const hr = +h.time[k].slice(11, 13); return hr >= 8 && hr <= 23; });
    const temps = day.map((k) => h.temperature_2m[k]);
    const lo = Math.round(Math.min(...temps)); const hi = Math.round(Math.max(...temps));
    const pop = Math.max(...day.map((k) => h.precipitation_probability[k] ?? 0));
    const mm = Math.round(day.reduce((s, k) => s + (h.precipitation[k] || 0), 0) * 10) / 10;
    const wet = pop >= 50 || mm >= 1;
    const sum = `<button class="wx-sum" data-wx-toggle aria-label="날씨 접기·펴기">${ms('partly_cloudy_day', 'fill')}<span class="wx-sum-t"><b class="num">${lo}°–${hi}°</b> · 강수 <span class="num${wet ? ' wx-wet' : ''}">${pop}%</span> · ${esc(outfit(lo, hi, wet).split(' · ')[0])}</span><span class="ms wx-chev" aria-hidden="true">expand_more</span></button>`;
    const cell = (label, v) => `<div class="wx-cell"><span class="wx-l">${label}</span><span class="wx-v num">${v == null ? '–' : v + '°'}</span></div>`;
    return `${drawer ? sum : ''}<div class="wx-card">
      <div class="wx-row">${cell('아침 8시', at(8))}${cell('낮 2시', at(14))}${cell('밤 9시', at(21))}
        <div class="wx-cell"><span class="wx-l">강수확률</span><span class="wx-v num${wet ? ' wx-wet' : ''}">${pop}%</span></div>
        <div class="wx-cell"><span class="wx-l">강수량</span><span class="wx-v num">${mm}<small>mm</small></span></div></div>
      <div class="wx-outfit">${ms('checkroom', 'fill')}<span>${esc(outfit(lo, hi, wet))}</span></div>
      <div class="wx-src">Open-Meteo 예보 · 08–23시 기준 · 앱 열 때마다 갱신(3시간 캐시)</div></div>`;
  }
  function fillWx(root) {
    const slots = root.querySelectorAll('[data-wx]');
    if (!slots.length) return;
    loadWx().then(() => slots.forEach((el) => { el.innerHTML = wxHtml(el.dataset.wx, !!el.dataset.drawer); }));
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
      el.innerHTML = `<div class="title-row"><h1 class="large-title">Places</h1><button class="refresh refresh-inline" data-refresh aria-label="새로고침"><span class="ms" aria-hidden="true">refresh</span></button></div><p class="subhead">누르면 사진·주소와 고덕지도·구글맵 버튼이 펼쳐져요. 주요 장소는 고덕 즐겨찾기에 저장돼 있어요.</p>
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
      g.forEach(([k, p]) => {
        // 장소를 누르면 펼쳐서 사진·주소·지도 버튼
        const id = `pl-${k}`;
        const ex = EXTRA[k];
        const body = `<span class="row-main"><span class="row-title" style="display:block">${esc(p.name)}${p.status === 'planned' ? '' : ' <span style="font-size:13px;color:var(--label2)">후보</span>'}${ex && ex.photos && ex.photos.length ? ' <span class="ms has-photo" aria-label="사진 있음">photo_library</span>' : ''}</span><span class="row-zh" lang="zh-CN" style="display:block">${esc(p.cn)}</span><span class="row-note" style="display:block">${esc([p.area, p.hours, p.memo].filter(Boolean).join(' · '))}</span></span>`;
        const chips = [mapPill(p, '고덕지도'), gmapPill(p, '구글맵')];
        if (p.addr) chips.push(showPill(p.name, `${p.cn}\n${p.addr}`));
        h += `<button class="row" style="--inset:57px" aria-expanded="false" aria-controls="${id}" data-toggle="${id}">${icon(p.cat)}${body}${CHEV}</button>`;
        h += `<div class="detail" id="${id}"><div class="detail-inner"><div class="detail-pad">${extraHtml(ex ? { photos: ex.photos, must: ex.must, menu: ex.menu } : null)}${p.addr ? `<p lang="zh-CN" style="color:var(--label2)">${esc(p.addr)}</p>` : ''}<div class="chips">${chips.join('')}</div></div></div></div>`;
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
        h += `<div class="detail" id="${id}"><div class="detail-inner"><div class="detail-pad" style="padding-left:57px">${detailHtml(r, null)}${(r.show || r.links) ? `<div class="chips">${(r.links || []).map(([t, u]) => `<a class="pill" href="${esc(u)}" target="_blank" rel="noopener">${ms('open_in_new')}${esc(t)}</a>`).join('')}${r.show ? showPill(r.show[0], r.show[1]) : ''}</div>` : ''}</div></div></div>`;
      });
      h += `</div>`;
      if (g.foot) h += `<p class="group-f">${esc(g.foot)}</p>`;
    });
    const done = store.get('check', {});
    CHECKLIST.forEach((g) => {
      h += `<h3 class="group-h">체크리스트 · ${esc(g.group)}</h3><div class="list">`;
      g.items.forEach((c) => {
        h += `<label class="check"><input type="checkbox" data-check="${esc(c)}"${done[c] ? ' checked' : ''}><span>${esc(c)}</span></label>`;
      });
      h += `</div>`;
    });
    h += `<p class="group-f">체크 상태는 이 기기에만 저장돼요.</p>`;
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
    const gb = e.target.closest('[data-gps]');
    if (gb) { gpsWatch === null ? gpsStart() : gpsStop(); return; }
    const go = e.target.closest('[data-goto]');
    if (go) {
      if (go.closest('.dmap-box')?.dataset.moved === '1') return;   // 끌어서 옮긴 건 탭이 아님
      const row = document.getElementById(go.dataset.goto);
      if (!row) return;
      if (row.hasAttribute('data-toggle')) { row.setAttribute('aria-expanded', 'true'); document.getElementById(row.dataset.toggle)?.classList.add('is-open'); }
      const y = row.getBoundingClientRect().top + window.scrollY - (navbar.offsetHeight + 12);
      window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      row.classList.remove('is-flash'); void row.offsetWidth; row.classList.add('is-flash');
      return;
    }
    const wt = e.target.closest('[data-wx-toggle]');
    if (wt) { const dr = wt.closest('.wx-drawer'); const open = !dr.classList.contains('is-open'); dr.classList.toggle('is-open', open); store.set('wxOpen', open); return; }
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
  if (store.get('gps', false)) gpsStart(false);
  /* iOS 홈 화면 앱: 처음 열 때 상단이 흐리게 그려지고 스크롤하면 풀리는 현상 → 열자마자 1px 스크롤로 다시 그리게 */
  const nudge = () => { if (window.scrollY === 0) { window.scrollTo(0, 1); requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, 0))); } };
  if (document.readyState === 'complete') setTimeout(nudge, 60); else window.addEventListener('load', () => setTimeout(nudge, 60));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(nudge, 60); });   // 지난번에 켜 뒀으면 이어서
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
