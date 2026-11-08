/* 상해 3박 4일 데이터. 일정·장소를 고치려면 이 파일만 수정하면 된다.
   place.q = 고덕지도 검색어(지점까지 포함). lng/lat(GCJ-02)을 넣으면 정확한 핀으로 열린다. */
window.TRIP_DATA = (() => {
  const TRIP = {
    title: '상해 3박 4일',
    sub: '11월 21일 – 24일 · 와이탄 숙소',
    asOf: '2026-11-08',
    flightOut: 'KE2057 김포 08:25 → 홍차오 09:45',
  };

  const PLACES = {
    hotel: { name: '홀리데이인 익스프레스 와이탄', cn: '上海外滩智选假日酒店', cat: 'stay', area: '황푸', addr: '上海市黄浦区人民路388号', q: '上海外滩智选假日酒店', status: 'planned', memo: '위위안역 7번 출구 50m' },
    sha: { name: '홍차오 공항 T1', cn: '虹桥国际机场T1航站楼', cat: 'move', area: '창닝', addr: '上海虹桥国际机场1号航站楼', q: '虹桥机场T1航站楼', status: 'planned', memo: '국제선' },
    yuyuan_st: { name: '위위안역', cn: '豫园地铁站', cat: 'move', area: '황푸', q: '豫园地铁站', status: 'planned', memo: '10·14호선' },

    lailai: { name: '라이라이 샤오롱바오', cn: '莱莱小笼', cat: 'food', area: '황푸', addr: '黄浦区天津路506号', hours: '08:00–14:00, 15:00–20:00', q: '莱莱小笼 天津路', status: 'planned', memo: '현금만' },
    libaixie: { name: '리바이시에 와이탄점', cn: '李百蟹 外滩店', cat: 'food', area: '와이탄', addr: '黄浦区中山东二路22号 外滩22号3楼', hours: '10:00–22:00', q: '李百蟹 外滩22号', status: 'planned', memo: '창가 요청' },
    zhangshifu: { name: '장스푸 상하이식 아침', cn: '张师傅 早餐', cat: 'food', area: '징안', addr: '静安区石门二路487号', q: '石门二路487号', status: 'planned', memo: '오픈 시간 확인 필요' },
    renheguan: { name: '런허관 징안점', cn: '人和馆 愚园路店', cat: 'food', area: '징안', addr: '静安区愚园路142-146号3楼', hours: '주말 11:00–21:30', q: '人和馆 愚园路', status: 'planned', memo: '예약 권장' },
    diandoude: { name: '점도덕 신천지점', cn: '点都德 中海环宇荟店', cat: 'food', area: '신천지', addr: '黄浦区黄陂南路838号 中海环宇荟B1', hours: '09:00–21:30', q: '点都德 中海环宇荟', status: 'planned' },
    bakerspice: { name: 'Baker & Spice 안푸로점', cn: 'Baker&Spice 安福路', cat: 'dessert', area: '헝푸', addr: '徐汇区安福路195号', hours: '07:00–22:00', q: 'Baker&Spice 安福路', status: 'planned' },

    dongliang: { name: '동량 메종', cn: '栋梁之家', cat: 'shop', area: '창닝', addr: '长宁区武夷路168号 翡悦里174号别墅', hours: '10:00–22:00', q: '栋梁之家 武夷路', status: 'planned' },
    columbia: { name: '상생신소', cn: '上生新所', cat: 'architecture', area: '창닝', addr: '长宁区延安西路1262号', hours: '야외 단지 · 츠타야 10:00–22:00', q: '上生新所', status: 'planned' },
    yuyuanlu: { name: '위위안로', cn: '愚园路', cat: 'street', area: '창닝', q: '愚园路 长宁', status: 'planned', memo: '노양방 산책' },
    zhangyuan: { name: '장위안', cn: '张园', cat: 'architecture', area: '징안', addr: '静安区威海路288号', hours: '상점 10:00–22:00', q: '张园 威海路', status: 'planned' },
    labelhood: { name: '레이블후드 하우스', cn: '蕾虎之家', cat: 'shop', area: '징안', addr: '静安区巨鹿路796号', hours: '10:00–22:00', q: '蕾虎之家 巨鹿路', status: 'planned' },
    iccf: { name: 'ICCF Garden · ICICLE', cn: '之禾卡纷花园', cat: 'shop', area: '헝푸', addr: '徐汇区衡山路2号', hours: '10:00–21:00', q: '之禾卡纷花园', status: 'planned' },
    lemaire: { name: '르메르 우캉로', cn: 'LEMAIRE 武康路', cat: 'shop', area: '헝푸', addr: '徐汇区武康路40弄2号', q: 'LEMAIRE 武康路', status: 'planned', memo: '위챗 예약제' },
    wukang: { name: '우캉맨션', cn: '武康大楼', cat: 'architecture', area: '헝푸', addr: '徐汇区淮海中路1842号', q: '武康大楼', status: 'planned', memo: '외관만' },
    xiayan: { name: '샤옌 옛집', cn: '夏衍旧居', cat: 'sight', area: '헝푸', addr: '徐汇区乌鲁木齐南路178号', hours: '수–토 10:00–16:30 예약제', q: '夏衍旧居', status: 'backup', memo: '일요일 휴관 추정' },
    chiikawa: { name: '치이카와 플래그십', cn: '吉伊卡哇 旗舰店', cat: 'shop', area: '남경동로', addr: '黄浦区南京东路139号 外滩中央广场', q: '吉伊卡哇 南京东路', status: 'planned' },
    miniso: { name: '미니소랜드', cn: 'MINISO LAND', cat: 'shop', area: '남경동로', addr: '黄浦区南京东路670号', hours: '09:00–23:30', q: 'MINISO LAND 南京东路', status: 'planned' },
    duoyun: { name: '다원서점 상하이타워', cn: '朵云书院 旗舰店', cat: 'sight', area: '루자쭈이', addr: '浦东新区陆家嘴环路479号 上海中心大厦52楼', hours: '월 10:30– · 화–일 10:00–', q: '朵云书院 上海中心', status: 'planned', memo: '위챗 예약' },
    disney: { name: '상하이 디즈니랜드', cn: '上海迪士尼乐园', cat: 'sight', area: '푸동', addr: '浦东新区川沙镇黄赵路310号', q: '上海迪士尼乐园', status: 'planned' },
    bund: { name: '와이탄', cn: '外滩', cat: 'sight', area: '와이탄', q: '外滩观景平台', status: 'planned', memo: '야경' },

    punchroom: { name: 'Punch Room', cn: '上海艾迪逊酒店 Punch Room', cat: 'bar', area: '남경동로', addr: '黄浦区南京东路199号 上海艾迪逊酒店', hours: '17:30–02:00', q: '上海艾迪逊酒店', status: 'planned' },
    barleone: { name: 'Bar Leone 상하이', cn: 'Bar Leone 思南公馆', cat: 'bar', area: '프랑스조계', addr: '黄浦区复兴中路527号 思南公馆', hours: '18:00–01:00', q: 'Bar Leone 思南公馆', status: 'planned', memo: '워크인만' },

    /* 후보 — 식당·디저트·차 */
    zuoting: { name: '좌정우원 (훠궈)', cn: '左庭右院', cat: 'food', area: '창닝', q: '左庭右院 中山公园', status: 'backup', memo: '신선 소고기 훠궈' },
    jingyunhua: { name: '경운화', cn: '京云华', cat: 'food', area: '', q: '京云华', status: 'backup', memo: '위치 미확인' },
    henjiu: { name: '헌저우이치엔 양꼬치', cn: '很久以前羊肉串', cat: 'food', area: '남경동로', q: '很久以前羊肉串 南京东路', status: 'backup', memo: '위챗 원격 줄서기' },
    xiding: { name: '시딩 (성게 물만두)', cn: '喜鼎海胆水饺', cat: 'food', area: '', q: '喜鼎海胆水饺', status: 'backup', memo: '상하이 지점 미확인' },
    chizaiji: { name: '지짜이지 창펀왕', cn: '香港池仔记肠粉王', cat: 'food', area: '헝푸', addr: '徐汇区襄阳南路150-1号', q: '池仔记肠粉王', status: 'backup' },
    zhuangshi: { name: '장씨네 게살국수', cn: '庄氏隆兴 蟹粉面', cat: 'food', area: '남경동로', addr: '黄浦区浙江中路441号', hours: '10:30–21:30', q: '庄氏隆兴', status: 'backup', memo: '蟹粉黄金捞面' },
    guershu: { name: '구얼수 수제 요거트', cn: '顾二叔手作酸奶', cat: 'dessert', area: '', q: '顾二叔手作酸奶', status: 'backup' },
    forlong: { name: 'FOR LONG 마카롱', cn: 'FOR LONG', cat: 'dessert', area: '헝푸', addr: '徐汇区太原路232号', hours: '평일 10–18 · 주말 10–19', q: 'FOR LONG 太原路', status: 'backup' },
    sugarplum: { name: 'Sugar plum', cn: 'Sugar plum', cat: 'dessert', area: '', q: 'Sugar plum 上海', status: 'backup', memo: '위치 미확인' },
    sloppygin: { name: 'Sloppy gin', cn: 'Sloppy gin', cat: 'dessert', area: '', q: 'Sloppy gin 上海', status: 'backup', memo: '정체 미확인' },
    basao: { name: 'Basao 차', cn: '八月茶 Basao', cat: 'tea', area: '', q: '八月茶', status: 'backup', memo: '상설 매장 미확인' },

    /* 후보 — 숍 */
    chillmore: { name: 'chillmore', cn: 'chillmore 且悠', cat: 'shop', area: '헝푸', addr: '徐汇区宝庆路21号', q: '且悠 宝庆路', status: 'backup', memo: '향기 브랜드' },
    onheon: { name: 'Onheon', cn: 'Onheon', cat: 'shop', area: '', q: 'Onheon 上海', status: 'backup' },
    softserve: { name: 'Soft serve', cn: 'Soft serve', cat: 'shop', area: '', q: 'Soft serve 上海', status: 'backup' },
    societyhome: { name: 'Society of Home', cn: 'Society of Home 洛克外滩源', cat: 'shop', area: '와이탄', addr: '黄浦区虎丘路78号', q: 'Society of Home 虎丘路', status: 'backup', memo: '호텔에서 가까움' },
    jaja: { name: 'Jajainthemoment', cn: 'Jajainthemoment', cat: 'shop', area: '', q: 'Jajainthemoment', status: 'backup' },
    habiter: { name: 'HABITER', cn: 'HABITER', cat: 'shop', area: '', q: 'HABITER 上海', status: 'backup' },
    zamani: { name: 'ZAMANI COLLECTION', cn: 'ZAMANI', cat: 'shop', area: '', q: 'ZAMANI 上海', status: 'backup' },
    shanye: { name: '샨예 갤러리', cn: '山野 Gallery', cat: 'shop', area: '', q: '山野 画廊 上海', status: 'backup' },
    viandn: { name: 'Via NDN', cn: 'Via NDN', cat: 'shop', area: '', q: 'Via NDN', status: 'backup' },
    ambelie: { name: 'Ambelie Gallery', cn: 'Ambelie', cat: 'shop', area: '헝푸', addr: '徐汇区康平路21号', q: 'Ambelie 康平路', status: 'backup', memo: '앤티크·미드센추리' },

    /* 후보 — 바 */
    noras: { name: "Nora's 와인바", cn: "Nora's Wine Shop & Bar", cat: 'bar', area: '헝푸', addr: '徐汇区永福路47-8号', hours: '15:00–24:00', q: "Nora's 永福路", status: 'backup', memo: '내추럴 와인' },
    luminous: { name: 'Luminous Ocean', cn: '环海 Luminous Ocean', cat: 'bar', area: '프랑스조계', addr: '黄浦区香山路15号甲', hours: '18:00–02:00', q: '香山路15号', status: 'backup', memo: '수족관 테마' },
    jzclub: { name: 'JZ Club', cn: 'JZ Club 衡山路', cat: 'bar', area: '헝푸', addr: '徐汇区衡山路8号', q: 'JZ Club 衡山路', status: 'backup', memo: '재즈 19:30·21:30' },
    fever: { name: 'Fever', cn: 'Fever', cat: 'bar', area: '', q: 'Fever bar 上海', status: 'backup' },
    kaisha: { name: 'Kaisha', cn: 'Kaisha', cat: 'bar', area: '', q: 'Kaisha 上海', status: 'backup', memo: '페어링 코스' },
    notelab: { name: 'Notelab', cn: 'Notelab', cat: 'bar', area: '', q: 'Notelab 上海', status: 'backup' },
    carter: { name: 'Carter', cn: 'Carter', cat: 'bar', area: '징안', addr: '静安区奉贤路50号', hours: '19:00–01:30', q: 'Carter 奉贤路', status: 'backup' },
    joker: { name: 'Joker & Joker', cn: 'Joker & Joker', cat: 'bar', area: '징안', addr: '静安区武定路968号2F', q: 'Joker Joker 武定路', status: 'backup' },
    darlin: { name: 'Darlin', cn: 'Darlin', cat: 'bar', area: '', q: 'Darlin bar 上海', status: 'backup' },
  };

  const DAYS = [
    {
      date: '2026-11-21', w: '토', title: '창닝 노양방 거리', sub: '큰 식사: 저녁 리바이시에',
      items: [
        { t: '09:45', place: 'sha', title: '홍차오 도착 → 10호선 위위안역', cat: 'plane', note: '환승 없이 약 45분. 호텔에 짐 맡기기' },
        { t: '12:00', place: 'lailai', title: '점심: 라이라이 샤오롱바오', note: '가볍게 · 현금만' },
        { t: '13:30', place: 'dongliang' },
        { t: '15:00', place: 'columbia', note: '옛 컨트리클럽 리노베이션 단지' },
        { t: '16:00', place: 'yuyuanlu', title: '위위안로 산책' },
        { t: '17:30', place: 'hotel', title: '호텔 체크인' },
        { t: '19:00', place: 'libaixie', title: '저녁: 리바이시에 게살덮밥', note: '동방명주 야경 · 원격 웨이팅' },
        { t: '20:30', place: 'bund', title: '와이탄 야경 산책 → 호텔', note: '조명은 보통 22시 전후 소등' },
      ],
    },
    {
      date: '2026-11-22', w: '일', title: '징안·헝푸 편집샵 + 칵테일', sub: '큰 식사: 점심 런허관',
      items: [
        { t: '08:00', place: 'zhangshifu', title: '아침: 장스푸 상하이식 아침', warn: '웹에서 상호·오픈 시간을 확인하지 못했어요. 가오더에서 石门二路487号로 확인하세요.' },
        { t: '09:00', place: 'zhangyuan', title: '장위안 산책', note: '골목 산책 가능 · 상점은 10시' },
        { t: '10:00', place: 'labelhood' },
        { t: '12:30', place: 'renheguan', title: '점심: 런허관 게살덮밥 + 홍소육', note: '미슐랭 · 예약 권장' },
        { t: '14:30', place: 'iccf' },
        { t: '15:30', place: 'bakerspice', note: '젤라또, 와인' },
        { t: '16:30', place: 'lemaire', title: '우캉로: 르메르 → 우캉맨션', note: '르메르는 예약제', warn: '샤옌 옛집은 수–토만 열어서 일요일 일정에서 뺐어요.' },
        { t: '19:00', place: 'chiikawa' },
        { t: '20:00', place: 'miniso' },
        { t: '21:00', place: 'hotel', title: '호텔에서 털게찜 배달', cat: 'food', cn: '大闸蟹 外卖' },
        { t: '22:00', place: 'punchroom', title: '칵테일: Punch Room', note: '가기 전 와이탄 한 번 더' },
      ],
    },
    {
      date: '2026-11-23', w: '월', title: '푸동 → 디즈니', sub: '디즈니 크리스마스 시즌',
      items: [
        { t: '09:00', place: 'diandoude', title: '브런치: 점도덕 딤섬', note: '10호선 신천지역 · 위위안에서 2정거장' },
        { t: '10:30', place: 'duoyun', title: '상하이타워 52층 다원서점', note: '위챗 예약 · 월요일 10:30 오픈' },
        { t: '12:00', place: 'disney', title: '루자쭈이 → 디즈니', cat: 'move', cn: '滴滴 35–45분', note: '디디 35–45분' },
        { t: '13:00', place: 'disney', title: '상하이 디즈니랜드', cat: 'castle', note: '폐장 20:30 가정 · 공식 앱 확인' },
        { t: '20:45', place: 'barleone', title: 'Bar Leone 상하이', note: '디디 약 45분 · 워크인 줄' },
        { t: '밤', place: 'hotel', title: '호텔에서 양즈깐루·과일 배달', cat: 'dessert', cn: '杨枝甘露 外卖' },
      ],
      foot: '디즈니에서 너무 지치면 Bar Leone 대신 호텔 근처 Punch Room(02:00까지)이나 바로 호텔로.',
    },
    {
      date: '2026-11-24', w: '화', title: '귀국', sub: 'KE2058 홍차오 10:55 → 김포 14:00',
      items: [
        { t: '07:30', place: 'hotel', title: '체크아웃' },
        { t: '08:15', place: 'sha', title: '10호선 또는 디디로 홍차오 T1', cat: 'move' },
        { t: '10:55', place: 'sha', title: 'KE2058 출발', cat: 'plane', cn: '' },
      ],
    },
  ];

  const INFO = [];
  const CHECKLIST = [
    '알리페이·위챗페이 가입, 해외카드 연결, 여권 인증',
    '디디(DiDi) 가입 · 결제수단 연결',
    '따종띠엔핑(大众点评) 설치 — 원격 웨이팅',
    '고덕지도(高德地图) 설치, 장소 저장',
    '디즈니 티켓 구매 · 공식 앱 설치',
    '르메르 우캉로 위챗 예약',
    '다원서점 위챗 예약',
    '런허관 예약 (021-6266 8003)',
    'Punch Room 예약 (선택)',
    '위안화 현금 소액 (라이라이는 현금만)',
    '로밍 또는 eSIM 준비',
    '체크인 후 배달앱에 호텔 주소·전화 등록',
  ];

  const PHRASES = [
    { group: '기본', items: [
      ['안녕하세요', '你好', 'nǐ hǎo'],
      ['감사합니다', '谢谢', 'xièxie'],
      ['괜찮아요 / 됐어요', '不用了，谢谢', 'bú yòng le, xièxie'],
      ['죄송합니다 (실례합니다)', '不好意思', 'bù hǎo yìsi'],
      ['네 / 맞아요', '对', 'duì'],
      ['아니요', '不是', 'bú shì'],
      ['중국어를 못해요', '我不会说中文', 'wǒ bú huì shuō zhōngwén'],
      ['한국 사람이에요', '我是韩国人', 'wǒ shì hánguó rén'],
      ['천천히 말해 주세요', '请说慢一点', 'qǐng shuō màn yìdiǎn'],
      ['여기에 써 주세요', '请写在这里', 'qǐng xiě zài zhèlǐ'],
    ]},
    { group: '식당', items: [
      ['두 명이에요', '两位', 'liǎng wèi'],
      ['메뉴 주세요', '请给我菜单', 'qǐng gěi wǒ càidān'],
      ['이거 주세요', '我要这个', 'wǒ yào zhège'],
      ['추천 메뉴가 뭐예요?', '有什么推荐的？', 'yǒu shénme tuījiàn de?'],
      ['고수 빼 주세요', '不要香菜', 'bú yào xiāngcài'],
      ['안 맵게 해 주세요', '不要辣', 'bú yào là'],
      ['양 적게 주세요', '少一点', 'shǎo yìdiǎn'],
      ['얼마나 기다려야 해요?', '要等多久？', 'yào děng duō jiǔ?'],
      ['창가 자리 있어요?', '有靠窗的位子吗？', 'yǒu kào chuāng de wèizi ma?'],
      ['계산할게요', '买单', 'mǎidān'],
      ['포장해 주세요', '打包', 'dǎbāo'],
      ['물 주세요 (따뜻한 물)', '请给我一杯热水', 'qǐng gěi wǒ yì bēi rè shuǐ'],
      ['맛있어요!', '很好吃！', 'hěn hǎochī!'],
    ]},
    { group: '바·디저트', items: [
      ['도수 낮은 칵테일 추천해 주세요', '推荐一款度数低的鸡尾酒', 'tuījiàn yì kuǎn dùshu dī de jīwěijiǔ'],
      ['달지 않은 걸로요', '不要太甜', 'bú yào tài tián'],
      ['와인 한 잔 주세요', '来一杯葡萄酒', 'lái yì bēi pútaojiǔ'],
      ['얼음 빼 주세요', '去冰', 'qù bīng'],
      ['당도 반으로 해 주세요', '半糖', 'bàn táng'],
    ]},
    { group: '쇼핑', items: [
      ['얼마예요?', '多少钱？', 'duōshao qián?'],
      ['구경만 할게요', '我随便看看', 'wǒ suíbiàn kànkan'],
      ['입어 봐도 돼요?', '可以试穿吗？', 'kěyǐ shìchuān ma?'],
      ['다른 사이즈 있어요?', '有别的尺码吗？', 'yǒu bié de chǐmǎ ma?'],
      ['이걸로 할게요', '我要这个', 'wǒ yào zhège'],
      ['알리페이 돼요?', '可以用支付宝吗？', 'kěyǐ yòng zhīfùbǎo ma?'],
      ['카드 돼요?', '可以刷卡吗？', 'kěyǐ shuākǎ ma?'],
      ['봉투 주세요', '请给我一个袋子', 'qǐng gěi wǒ yí ge dàizi'],
    ]},
    { group: '교통·길', items: [
      ['여기로 가 주세요', '请去这个地方', 'qǐng qù zhège dìfang'],
      ['여기서 세워 주세요', '请在这里停车', 'qǐng zài zhèlǐ tíngchē'],
      ['○○ 어떻게 가요?', '请问，怎么去这里？', 'qǐngwèn, zěnme qù zhèlǐ?'],
      ['지하철역이 어디예요?', '地铁站在哪里？', 'dìtiě zhàn zài nǎlǐ?'],
      ['화장실이 어디예요?', '洗手间在哪里？', 'xǐshǒujiān zài nǎlǐ?'],
      ['디디 타는 곳이 어디예요?', '网约车上车点在哪里？', 'wǎngyuēchē shàngchē diǎn zài nǎlǐ?'],
      ['걸어서 갈 수 있어요?', '走路能到吗？', 'zǒulù néng dào ma?'],
      ['홍차오 공항 1터미널로 가 주세요', '请去虹桥机场一号航站楼', 'qǐng qù hóngqiáo jīchǎng yī hào hángzhànlóu'],
    ]},
    { group: '호텔', items: [
      ['체크인할게요', '我要办理入住', 'wǒ yào bànlǐ rùzhù'],
      ['짐 맡길 수 있어요?', '可以寄存行李吗？', 'kěyǐ jìcún xíngli ma?'],
      ['배달 음식 받아 주실 수 있어요?', '可以帮我收一下外卖吗？', 'kěyǐ bāng wǒ shōu yíxià wàimài ma?'],
      ['체크아웃할게요', '我要退房', 'wǒ yào tuìfáng'],
      ['와이파이 비밀번호가 뭐예요?', 'WiFi密码是多少？', 'WiFi mìmǎ shì duōshao?'],
    ]},
    { group: '급할 때', items: [
      ['도와주세요', '请帮帮我', 'qǐng bāngbang wǒ'],
      ['몸이 안 좋아요', '我不舒服', 'wǒ bù shūfu'],
      ['약국이 어디예요?', '药店在哪里？', 'yàodiàn zài nǎlǐ?'],
      ['휴대폰을 잃어버렸어요', '我的手机丢了', 'wǒ de shǒujī diū le'],
      ['여권을 잃어버렸어요', '我的护照丢了', 'wǒ de hùzhào diū le'],
      ['경찰을 불러 주세요', '请帮我报警', 'qǐng bāng wǒ bàojǐng'],
    ]},
  ];

  return { TRIP, PLACES, DAYS, INFO, CHECKLIST, PHRASES };
})();
