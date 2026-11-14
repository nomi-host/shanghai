#!/usr/bin/env python3
"""날짜별 동선 지도 만들기.

구글 지도 타일(가게 표시 끔) 위에 실제 길(OSM 경로: 1.3km 미만은 도보, 그 이상은 차)을 그려
img/map-day{n}.jpg 로 저장하고, 핀 위치(%)·거리를 maps.js 에 쓴다. 핀(빨간 점)은 앱에서 HTML로 얹는다.

  python3 tools/build_maps.py          # 경로는 tools/routes-cache.json 재사용
  python3 tools/build_maps.py --fresh  # 경로 다시 받기

일정(data.js)을 바꾸면 다시 돌리면 된다. 새 장소는 아래 COORDS 에 좌표(구글맵 = GCJ-02)를 넣는다.
"""
import json, math, os, subprocess, sys, time, urllib.parse
from PIL import Image, ImageDraw, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'routes-cache.json')
TILE_CACHE = os.path.join(ROOT, 'tools', '.tiles')
UA = 'shanghai-trip-map/1.0 (personal)'

# 구글맵 좌표(GCJ-02, 중국 지도 타일과 같은 좌표계). 구글맵 검색 결과·주소 검색으로 확인.
COORDS = {
    'hotel': (31.22968, 121.49129),      # 人民路388号 (위위안역 14호선 쪽 7번 출구)
    'sijiminfu': (31.22777, 121.45598),  # 중신태부광장
    'dongliang': (31.21293, 121.42211),  # 우이로 翡悦里
    'columbia': (31.20995, 121.42697),
    'yuyuanlu': (31.21916, 121.42993),   # 愚园路1018号
    'rockbund': (31.24102, 121.48752),
    'libaixie': (31.23030, 121.49382),   # 中山东二路22号
    'bund': (31.23947, 121.49061),
    'yuyuan': (31.22639, 121.49193),
    'zhangshifu': (31.23690, 121.45916), # 石门二路487号
    'zhangyuan': (31.22802, 121.46010),
    'qiansu': (31.24901, 121.44550),     # OSM 天安千树 → GCJ
    'charlietown': (31.24880, 121.44585), # 天安千树 1期 L층 W07 (같은 건물)
    'labelhood': (31.21806, 121.45168),
    'renheguan': (31.22436, 121.44497),  # 愚园路142号
    'iccf': (31.20899, 121.44959),       # 衡山路2号
    'lemaire': (31.21242, 121.44028),    # 武康路40弄
    'onheon': (31.21140, 121.44220),     # 复兴西路49弄, 르메르에서 걸어서 3분
    'psa': (31.20103, 121.49832),
    'chiikawa': (31.23809, 121.48683),   # 南京东路139号
    'miniso': (31.23551, 121.47761),     # 南京东路670号
    'henjiu': (31.23488, 121.47477),
    'notelab': (31.22173, 121.45710),    # 陕西南路15号
    'duoyun': (31.23352, 121.50562),
    'huaihai': (31.22082, 121.46841),    # HAI550 (OSM Matcha Wang → GCJ), 여기서 서쪽 iapm까지 걷기
    'zuoting': (31.22971, 121.51569),    # 浦东南路999号
    'disney': (31.14340, 121.65787),
}
# 확대 지도: 그날 지도 밑에 붙는 작은 동네 지도 (승차장·출구 같은 실용 위치)
ZOOMS = {
    2: {  # 디즈니 날
        'key': 'disney', 'title': '디즈니 확대: 쇼 명당·승차 위치', 'goto': 'disney',
        'points': [
            ('disney_garden', '쇼 명당', 'star', 'sight', (31.14265, 121.66059)),       # 奇想花园 (OSM)
            ('disney_mickey', '미키 애비뉴', 'directions_walk', 'sight', (31.14159, 121.66182)),  # 米奇大街 (구글)
            ('disney_pickup', '디디 승차', 'local_taxi', 'castle', (31.13769, 121.65818)),  # 停车场小型客车上下客区: 고덕 화면 기준, 申迪西路 로터리 서북쪽
            ('disney_taxi', '택시 하차점', 'local_taxi', 'move', (31.13857, 121.65816)),     # 出租车下客点: 고덕 화면 기준, 승차 구역 바로 북쪽
            ('disney_metro', '11호선 디즈니역', 'directions_subway', 'move', (31.14135, 121.66816)),  # 구글
        ],
        'walk': [],   # 공원 안 길은 OSM 경로에 없어 선은 그리지 않음
    },
}
SKIP = {'sha'}           # 공항은 너무 멀어서 뺌
WALK_KM = 1.3            # 이보다 가까우면 걸어서 (아래 MODE 가 우선)
# 일정 메모 기준으로 정한 구간별 이동 수단
MODE = {
    ('rockbund', 'hotel'): 'foot', ('libaixie', 'bund'): 'foot', ('bund', 'yuyuan'): 'foot', ('yuyuan', 'hotel'): 'foot',
    ('labelhood', 'renheguan'): 'car', ('iccf', 'lemaire'): 'foot', ('miniso', 'hotel'): 'car',
}
W, H_MIN, H_MAX = 360, 210, 300   # 지도 크기(논리 px), 2배로 저장
PAD = 26
S = 4                    # 저장 배율(확대해 볼 수 있게 4배)
LINE = (28, 28, 30)      # 동선: 검정 (실선 차, 점선 도보)

# ---------- 좌표 변환 (GCJ-02 ↔ WGS-84) ----------
_A, _EE = 6378245.0, 0.00669342162296594323
def _tlat(x, y):
    r = -100 + 2*x + 3*y + .2*y*y + .1*x*y + .2*math.sqrt(abs(x))
    r += (20*math.sin(6*x*math.pi) + 20*math.sin(2*x*math.pi)) * 2/3
    r += (20*math.sin(y*math.pi) + 40*math.sin(y/3*math.pi)) * 2/3
    r += (160*math.sin(y/12*math.pi) + 320*math.sin(y*math.pi/30)) * 2/3
    return r
def _tlng(x, y):
    r = 300 + x + 2*y + .1*x*x + .1*x*y + .1*math.sqrt(abs(x))
    r += (20*math.sin(6*x*math.pi) + 20*math.sin(2*x*math.pi)) * 2/3
    r += (20*math.sin(x*math.pi) + 40*math.sin(x/3*math.pi)) * 2/3
    r += (150*math.sin(x/12*math.pi) + 300*math.sin(x/30*math.pi)) * 2/3
    return r
def wgs2gcj(lat, lng):
    dlat, dlng = _tlat(lng-105, lat-35), _tlng(lng-105, lat-35)
    rl = lat/180*math.pi; m = 1 - _EE*math.sin(rl)**2; sm = math.sqrt(m)
    dlat = dlat*180 / ((_A*(1-_EE)) / (m*sm) * math.pi)
    dlng = dlng*180 / (_A/sm*math.cos(rl)*math.pi)
    return lat+dlat, lng+dlng
def gcj2wgs(lat, lng):
    g = wgs2gcj(lat, lng)
    return lat-(g[0]-lat), lng-(g[1]-lng)

def hav(a, b):
    r = 6371.0; p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2-p1, math.radians(b[1]-a[1])
    return 2*r*math.asin(math.sqrt(math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))

def fetch(url):
    # 시스템 파이썬의 오래된 SSL 대신 curl 사용
    return subprocess.check_output(['curl', '-sfL', '--retry', '3', '-A', UA, url], timeout=60)

# ---------- 경로 ----------
def route(a, b, mode, cache):
    key = f'foot:{a[0]:.5f},{a[1]:.5f};{b[0]:.5f},{b[1]:.5f}'
    if key in cache: return cache[key]
    wa, wb = gcj2wgs(*a), gcj2wgs(*b)
    # 선 모양은 도보 경로(길을 따라 가장 곧게)로 통일. 차 경로는 일방통행·고가 우회로 꼬여 보여서.
    prof = 'routed-foot/route/v1/foot'
    url = f'https://routing.openstreetmap.de/{prof}/{wa[1]:.6f},{wa[0]:.6f};{wb[1]:.6f},{wb[0]:.6f}?overview=full&geometries=geojson'
    d = json.loads(fetch(url))
    r = d['routes'][0]
    pts = [list(map(lambda v: round(v, 6), wgs2gcj(lat, lng))) for lng, lat in r['geometry']['coordinates']]
    cache[key] = {'km': round(r['distance']/1000, 2), 'min': round(r['duration']/60), 'pts': pts}
    time.sleep(1)
    return cache[key]

# ---------- 지도 타일 ----------
def proj(lat, lng, z):
    n = 256 * 2**z
    x = (lng + 180) / 360 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1+s)/(1-s)) / (4*math.pi)) * n
    return x, y

def tile(x, y, z):
    os.makedirs(TILE_CACHE, exist_ok=True)
    f = os.path.join(TILE_CACHE, f'{z}_{x}_{y}.png')
    if not os.path.exists(f):
        style = urllib.parse.quote('s.t:2|p.v:off,s.t:1|s.e:l|p.v:off', safe='')   # 가게·명소 아이콘, 행정구역 이름 끔
        url = f'https://mt1.google.com/vt/lyrs=m&hl=ko&gl=cn&scale=2&x={x}&y={y}&z={z}&apistyle={style}'
        data = fetch(url)
        open(f, 'wb').write(data)
    return Image.open(f).convert('RGB')

def render(points, legs, out, pad=PAD, padx=None):
    padx = pad if padx is None else padx
    lats = [p[0] for p in points]; lngs = [p[1] for p in points]
    for lg in legs:
        lats += [p[0] for p in lg['pts']]; lngs += [p[1] for p in lg['pts']]
    lo, hi = (min(lats), min(lngs)), (max(lats), max(lngs))
    # 꽉 차는 소수 줌 zf 를 구하고, 타일은 그보다 큰 정수 줌 z 로 받아 f 배로 줄인다
    x0, y1 = proj(lo[0], lo[1], 0); x1, y0 = proj(hi[0], hi[1], 0)
    zf = min(math.log2((W-2*padx)/max(x1-x0, 1e-9)), math.log2((H_MAX-2*pad)/max(y1-y0, 1e-9)), 16.5)
    z = math.ceil(zf) + 1; f = 2**(zf-z)   # 한 단계 더 자세한 타일: 확대해도 길이 보이게
    x0, y1 = proj(lo[0], lo[1], z); x1, y0 = proj(hi[0], hi[1], z)
    h = int(min(H_MAX, max(H_MIN, (y1-y0)*f + 2*pad)))
    cx, cy = (x0+x1)/2, (y0+y1)/2
    cw, ch = W/f, h/f                      # 줌 z 기준 캔버스(논리 px)
    left, top = cx - cw/2, cy - ch/2
    TS = 2   # 타일 원본 배율(scale=2 → 256 논리 px 가 512 px)
    base = Image.new('RGB', (int(cw*TS)+1, int(ch*TS)+1))
    for tx in range(int(left//256), int((left+cw)//256)+1):
        for ty in range(int(top//256), int((top+ch)//256)+1):
            base.paste(tile(tx, ty, z), (int((tx*256-left)*TS), int((ty*256-top)*TS)))
    img = base.resize((W*S, h*S), Image.LANCZOS)
    # 모노톤: 흑백으로 바꾸고 살짝 밝게 → 빨간 동선만 눈에 띄게
    # 앱 회색(iOS 쿨그레이 #3C3C43 계열)으로 물들이고 밝게: 페이지 배경(#F2F2F7)보다 밝아 지도 영역이 떠 보이게
    g = ImageOps.grayscale(img)
    img = ImageOps.colorize(g, black=(56, 59, 70), white=(251, 252, 255), mid=(201, 204, 215))
    img = Image.blend(img, Image.new('RGB', g.size, (250, 251, 255)), 0.22)
    SS = S*2   # 경로는 2배로 그려 줄여서 매끈하게
    ov = Image.new('RGBA', (W*SS, h*SS), (0, 0, 0, 0)); dr = ImageDraw.Draw(ov)
    def px(p):
        x, y = proj(p[0], p[1], z); return ((x-left)*f*SS, (y-top)*f*SS)
    def stroke(seg, dashed):
        dr.line(seg, fill=(255, 255, 255, 220), width=round(3.4*SS), joint='curve')
        dr.line(seg, fill=LINE+(255,), width=round(1.8*SS), joint='curve')
    for lg in legs:
        pts = [px(p) for p in lg['pts']]
        if len(pts) < 2: continue
        if lg['mode'] != 'foot':
            stroke(pts, False); continue
        dash, gap, acc, on = 4*SS, 2.6*SS, 0.0, True   # 걸어가는 구간은 점선
        seg = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            L = math.dist(a, b); t = 0.0
            while L - t > 1e-6:
                need = (dash if on else gap) - acc; step = min(need, L - t); t += step; acc += step
                q = (a[0]+(b[0]-a[0])*t/L, a[1]+(b[1]-a[1])*t/L)
                if on: seg.append(q)
                if acc >= (dash if on else gap) - 1e-6:
                    if on and len(seg) > 1: stroke(seg, True)
                    on = not on; acc = 0.0; seg = [q]
        if on and len(seg) > 1: stroke(seg, True)
    ov = ov.resize((W*S, h*S), Image.LANCZOS)
    img = Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')
    img.save(out, 'JPEG', quality=74, optimize=True, progressive=True)
    def pos(p):
        x, y = px(p); return (round(x/SS/W*100, 2), round(y/SS/h*100, 2))
    # 앱에서 GPS 위치를 같은 방식으로 찍을 수 있게 투영 정보도 돌려줌
    pos.proj = {'z': z, 'left': round(left, 3), 'top': round(top, 3), 'f': round(f, 6)}
    return h, pos

def spread(pins, w, h, gap=19):
    # 핀이 겹치면 살짝 밀어내고(dx, dy), 원래 자리는 앱에서 작은 점+선으로 이어 준다
    P = [[p['x']/100*w, p['y']/100*h] for p in pins]
    O = [q[:] for q in P]
    for _ in range(300):
        moved = False
        for i in range(len(P)):
            for j in range(i+1, len(P)):
                dx, dy = P[j][0]-P[i][0], P[j][1]-P[i][1]; d = math.hypot(dx, dy)
                if d < gap:
                    if d < 1e-3: dx, dy, d = 0.7, -0.7, 1.0
                    push = (gap-d)/2; ux, uy = dx/d, dy/d
                    P[i][0] -= ux*push; P[i][1] -= uy*push; P[j][0] += ux*push; P[j][1] += uy*push; moved = True
        for q in P:
            q[0] = min(w-12, max(12, q[0])); q[1] = min(h-12, max(12, q[1]))
        if not moved: break
    for p, q, o in zip(pins, P, O):
        if math.dist(q, o) > 2:
            p['dx'], p['dy'] = round(q[0]/w*100, 2), round(q[1]/h*100, 2)

def main():
    fresh = '--fresh' in sys.argv
    cache = {} if fresh or not os.path.exists(CACHE) else json.load(open(CACHE))
    dump = subprocess.check_output(['node', '-e', 'global.window={};require("./data.js");const D=window.TRIP_DATA;process.stdout.write(JSON.stringify(D.DAYS.map(d=>d.items.map(i=>i.place||null))))'], cwd=ROOT)
    days = json.loads(dump)
    maps = {}
    for di, items in enumerate(days):
        # 순서대로 방문지(같은 곳 연속은 하나로). 공항 빼고, 호텔에서 시작.
        seq = []
        for ii, pl in enumerate(items):
            if not pl or pl in SKIP: continue
            if pl not in COORDS: print(f'  ! 좌표 없음: {pl}'); continue
            if seq and seq[-1][0] == pl: continue
            seq.append((pl, ii))
        if seq and seq[0][0] != 'hotel': seq.insert(0, ('hotel', None))
        if seq and seq[-1][0] != 'hotel': seq.append(('hotel', None))   # 하루 끝은 호텔로
        if len(seq) < 3: continue   # 귀국일처럼 호텔만 있으면 지도 없음
        legs = []
        for (a, _), (b, _) in zip(seq, seq[1:]):
            pa, pb = COORDS[a], COORDS[b]
            mode = MODE.get((a, b)) or ('foot' if hav(pa, pb) < WALK_KM else 'car')
            r = route(pa, pb, mode, cache)
            legs.append({'from': a, 'to': b, 'mode': mode, **r})
            print(f'  day{di+1} {a:>10} → {b:<10} {mode:4} {r["km"]:5.1f}km')
        json.dump(cache, open(CACHE, 'w'), ensure_ascii=False)
        fn = f'img/map-day{di+1}.jpg'
        h, pos = render([COORDS[p] for p, _ in seq], legs, os.path.join(ROOT, fn))
        pins, seen, n = [], {}, 0
        for pl, ii in seq:
            if pl in seen:
                if ii is not None and pins[seen[pl]]['i'] is None: pins[seen[pl]]['i'] = ii
                continue
            home = pl == 'hotel'
            if not home: n += 1
            x, y = pos(COORDS[pl])
            seen[pl] = len(pins)
            pins.append({'p': pl, 'i': ii, 'n': 0 if home else n, 'x': x, 'y': y})
        spread(pins, W, h)
        maps[di] = {'img': fn, 'w': W, 'h': h, 'proj': pos.proj, 'pins': pins,
                    'car': round(sum(l['km'] for l in legs if l['mode'] == 'car'), 1),
                    'walk': round(sum(l['km'] for l in legs if l['mode'] == 'foot'), 1)}
        print(f'day{di+1}: {fn} {W}x{h} 차 {maps[di]["car"]}km · 도보 {maps[di]["walk"]}km')
    for di, Z in ZOOMS.items():
        if di not in maps: continue
        P = {k: c for k, _, _, _, c in Z['points']}
        legs = []
        for a, b in Z['walk']:
            r = route(P[a], P[b], 'foot', cache)
            legs.append({'from': a, 'to': b, 'mode': 'foot', **r})
        json.dump(cache, open(CACHE, 'w'), ensure_ascii=False)
        fn = f'img/map-{Z["key"]}.jpg'
        h, pos = render(list(P.values()), legs, os.path.join(ROOT, fn), pad=30, padx=75)   # 이름표가 잘리지 않게 좌우 여백 넉넉히
        gi = next((i for i, pl in enumerate(days[di]) if pl == Z['goto']), None)
        pins = []
        for k, label, ic, cat, c in Z['points']:
            x, y = pos(c)
            pins.append({'p': k, 'label': label, 'ic': ic, 'cat': cat, 'x': x, 'y': y})
        spread(pins, W, h, gap=26)
        maps[di]['zoom'] = {'img': fn, 'w': W, 'h': h, 'proj': pos.proj, 'title': Z['title'], 'goto': gi, 'pins': pins,
                            'walk': round(sum(l['km'] for l in legs), 1)}
        print(f'zoom {Z["key"]}: {fn} {W}x{h} 걷기 {maps[di]["zoom"]["walk"]}km')
    with open(os.path.join(ROOT, 'maps.js'), 'w') as f:
        f.write('/* tools/build_maps.py 가 만든 파일. 직접 고치지 말고 스크립트를 다시 돌리기. */\n')
        f.write('window.TRIP_MAPS = ' + json.dumps(maps, ensure_ascii=False) + ';\n')

if __name__ == '__main__':
    main()
