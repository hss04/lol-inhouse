// ==================== 전역 상수 및 데이터 ====================

const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

// 점수를 티어 표시 문자열로 변환
function scoreToTierDisplay(score) {
    score = parseFloat(score);

    if (score === 9.00) return 'Challenger';
    if (score === 8.00) return 'Grandmaster';
    if (score >= 7.00) return 'Master'; // Diamond I도 7.00이지만 Master로 표시

    const tiers = [
        { base: 0, name: 'Iron' },
        { base: 1, name: 'Bronze' },
        { base: 2, name: 'Silver' },
        { base: 3, name: 'Gold' },
        { base: 4, name: 'Platinum' },
        { base: 5, name: 'Emerald' },
        { base: 6, name: 'Diamond' }
    ];

    for (let tier of tiers) {
        if (score > tier.base && score <= tier.base + 1) {
            const divisionValue = score - tier.base;
            let division;
            if (Math.abs(divisionValue - 0.25) < 0.01) division = 'IV';
            else if (Math.abs(divisionValue - 0.50) < 0.01) division = 'III';
            else if (Math.abs(divisionValue - 0.75) < 0.01) division = 'II';
            else if (Math.abs(divisionValue - 1.00) < 0.01) division = 'I';
            else division = '?';

            return `${tier.name} ${division}`;
        }
    }

    return 'Unknown';
}

// 텍스트 입력을 점수로 파싱 (미래 확장용)
function parseTier(input) {
    input = input.trim().toUpperCase();

    const tierMap = {
        'IRON': 0, '아이언': 0,
        'BRONZE': 1, '브론즈': 1,
        'SILVER': 2, '실버': 2,
        'GOLD': 3, '골드': 3,
        'PLATINUM': 4, '플래티넘': 4, '플래': 4,
        'EMERALD': 5, '에메랄드': 5,
        'DIAMOND': 6, '다이아': 6, '다이아몬드': 6,
        'MASTER': 7, '마스터': 7,
        'GRANDMASTER': 8, 'GM': 8, '그랜드마스터': 8, '그마': 8,
        'CHALLENGER': 9, '챌린저': 9, '챌': 9
    };

    const divisionMap = {
        'IV': 0.25, '4': 0.25,
        'III': 0.50, '3': 0.50,
        'II': 0.75, '2': 0.75,
        'I': 1.00, '1': 1.00
    };

    // Master, GM, Challenger는 division 없음
    for (let [key, value] of Object.entries(tierMap)) {
        if (input === key && value >= 7) {
            return value;
        }
    }

    // tier + division 파싱
    for (let [tierKey, tierBase] of Object.entries(tierMap)) {
        if (tierBase >= 7) continue;

        if (input.startsWith(tierKey)) {
            const rest = input.substring(tierKey.length).trim();
            for (let [divKey, divValue] of Object.entries(divisionMap)) {
                if (rest === divKey) {
                    return tierBase + divValue;
                }
            }
        }
    }

    return null;
}

// Data Dragon 동적 버전 관리
let DD_VERSION = '14.1.1'; // 기본값 (API 실패 시 사용)
let championImageMap = {}; // id -> image.full 매핑
let dataDragonLoaded = false;

// 챔피언 데이터 (EXPECTED_CHAMPIONS 기준 + 라인별 분류)
const CHAMPIONS_DATA = [
    // 가나다순
    { id: 'Garen', nameKR: '가렌', roles: ['TOP'] },
    { id: 'Galio', nameKR: '갈리오', roles: ['MID', 'SUPPORT'] },
    { id: 'Gangplank', nameKR: '갱플랭크', roles: ['TOP'] },
    { id: 'Gragas', nameKR: '그라가스', roles: ['JUNGLE', 'TOP'] },
    { id: 'Graves', nameKR: '그레이브즈', roles: ['JUNGLE'] },
    { id: 'Gwen', nameKR: '그웬', roles: ['TOP'] },
    { id: 'Gnar', nameKR: '나르', roles: ['TOP'] },
    { id: 'Nami', nameKR: '나미', roles: ['SUPPORT'] },
    { id: 'Nasus', nameKR: '나서스', roles: ['TOP'] },
    { id: 'Naafiri', nameKR: '나피리', roles: ['MID'] },
    { id: 'Nautilus', nameKR: '노틸러스', roles: ['SUPPORT'] },
    { id: 'Nocturne', nameKR: '녹턴', roles: ['JUNGLE'] },
    { id: 'Nunu', nameKR: '누누와 윌럼프', roles: ['JUNGLE'] },
    { id: 'Nidalee', nameKR: '니달리', roles: ['JUNGLE'] },
    { id: 'Neeko', nameKR: '니코', roles: ['MID', 'SUPPORT'] },
    { id: 'Nilah', nameKR: '닐라', roles: ['ADC'] },
    { id: 'Darius', nameKR: '다리우스', roles: ['TOP'] },
    { id: 'Diana', nameKR: '다이애나', roles: ['MID', 'JUNGLE'] },
    { id: 'Draven', nameKR: '드레이븐', roles: ['ADC'] },
    { id: 'Ryze', nameKR: '라이즈', roles: ['MID', 'TOP'] },
    { id: 'Rakan', nameKR: '라칸', roles: ['SUPPORT'] },
    { id: 'Rammus', nameKR: '람머스', roles: ['JUNGLE'] },
    { id: 'Lux', nameKR: '럭스', roles: ['MID', 'SUPPORT'] },
    { id: 'Rumble', nameKR: '럼블', roles: ['TOP', 'MID'] },
    { id: 'Renata', nameKR: '레나타 글라스크', roles: ['SUPPORT'] },
    { id: 'Renekton', nameKR: '레넥톤', roles: ['TOP'] },
    { id: 'Leona', nameKR: '레오나', roles: ['SUPPORT'] },
    { id: 'RekSai', nameKR: '렉사이', roles: ['JUNGLE'] },
    { id: 'Rell', nameKR: '렐', roles: ['SUPPORT'] },
    { id: 'Rengar', nameKR: '렝가', roles: ['JUNGLE'] },
    { id: 'Lucian', nameKR: '루시안', roles: ['ADC'] },
    { id: 'Lulu', nameKR: '룰루', roles: ['SUPPORT'] },
    { id: 'Leblanc', nameKR: '르블랑', roles: ['MID'] },
    { id: 'LeeSin', nameKR: '리 신', roles: ['JUNGLE'] },
    { id: 'Riven', nameKR: '리븐', roles: ['TOP'] },
    { id: 'Lissandra', nameKR: '리산드라', roles: ['MID'] },
    { id: 'Lillia', nameKR: '릴리아', roles: ['JUNGLE'] },
    { id: 'MasterYi', nameKR: '마스터 이', roles: ['JUNGLE'] },
    { id: 'Maokai', nameKR: '마오카이', roles: ['TOP', 'SUPPORT'] },
    { id: 'Malzahar', nameKR: '말자하', roles: ['MID'] },
    { id: 'Malphite', nameKR: '말파이트', roles: ['TOP'] },
    { id: 'Mel', nameKR: '멜', roles: ['SUPPORT'] },
    { id: 'Mordekaiser', nameKR: '모데카이저', roles: ['TOP'] },
    { id: 'Morgana', nameKR: '모르가나', roles: ['SUPPORT', 'MID'] },
    { id: 'DrMundo', nameKR: '문도 박사', roles: ['TOP', 'JUNGLE'] },
    { id: 'MissFortune', nameKR: '미스 포츈', roles: ['ADC'] },
    { id: 'Milio', nameKR: '밀리오', roles: ['SUPPORT'] },
    { id: 'Bard', nameKR: '바드', roles: ['SUPPORT'] },
    { id: 'Varus', nameKR: '바루스', roles: ['ADC'] },
    { id: 'Vi', nameKR: '바이', roles: ['JUNGLE'] },
    { id: 'Veigar', nameKR: '베이가', roles: ['MID'] },
    { id: 'Vayne', nameKR: '베인', roles: ['ADC'] },
    { id: 'Vex', nameKR: '벡스', roles: ['MID'] },
    { id: 'Belveth', nameKR: '벨베스', roles: ['JUNGLE'] },
    { id: 'Velkoz', nameKR: '벨코즈', roles: ['MID', 'SUPPORT'] },
    { id: 'Volibear', nameKR: '볼리베어', roles: ['JUNGLE', 'TOP'] },
    { id: 'Braum', nameKR: '브라움', roles: ['SUPPORT'] },
    { id: 'Briar', nameKR: '브라이어', roles: ['JUNGLE'] },
    { id: 'Brand', nameKR: '브랜드', roles: ['SUPPORT', 'MID'] },
    { id: 'Vladimir', nameKR: '블라디미르', roles: ['MID', 'TOP'] },
    { id: 'Blitzcrank', nameKR: '블리츠크랭크', roles: ['SUPPORT'] },
    { id: 'Viego', nameKR: '비에고', roles: ['JUNGLE'] },
    { id: 'Viktor', nameKR: '빅토르', roles: ['MID'] },
    { id: 'Poppy', nameKR: '뽀삐', roles: ['TOP', 'SUPPORT'] },
    { id: 'Samira', nameKR: '사미라', roles: ['ADC'] },
    { id: 'Sion', nameKR: '사이온', roles: ['TOP'] },
    { id: 'Sylas', nameKR: '사일러스', roles: ['MID'] },
    { id: 'Shaco', nameKR: '샤코', roles: ['JUNGLE'] },
    { id: 'Senna', nameKR: '세나', roles: ['SUPPORT', 'ADC'] },
    { id: 'Seraphine', nameKR: '세라핀', roles: ['SUPPORT', 'MID'] },
    { id: 'Sejuani', nameKR: '세주아니', roles: ['JUNGLE'] },
    { id: 'Sett', nameKR: '세트', roles: ['TOP'] },
    { id: 'Sona', nameKR: '소나', roles: ['SUPPORT'] },
    { id: 'Soraka', nameKR: '소라카', roles: ['SUPPORT'] },
    { id: 'Shen', nameKR: '쉔', roles: ['TOP'] },
    { id: 'Shyvana', nameKR: '쉬바나', roles: ['JUNGLE'] },
    { id: 'Smolder', nameKR: '스몰더', roles: ['ADC'] },
    { id: 'Swain', nameKR: '스웨인', roles: ['SUPPORT', 'MID'] },
    { id: 'Skarner', nameKR: '스카너', roles: ['JUNGLE'] },
    { id: 'Sivir', nameKR: '시비르', roles: ['ADC'] },
    { id: 'XinZhao', nameKR: '신 짜오', roles: ['JUNGLE'] },
    { id: 'Syndra', nameKR: '신드라', roles: ['MID'] },
    { id: 'Singed', nameKR: '신지드', roles: ['TOP'] },
    { id: 'Thresh', nameKR: '쓰레쉬', roles: ['SUPPORT'] },
    { id: 'Ahri', nameKR: '아리', roles: ['MID'] },
    { id: 'Amumu', nameKR: '아무무', roles: ['JUNGLE'] },
    { id: 'AurelionSol', nameKR: '아우렐리온 솔', roles: ['MID'] },
    { id: 'Ivern', nameKR: '아이번', roles: ['JUNGLE'] },
    { id: 'Azir', nameKR: '아지르', roles: ['MID'] },
    { id: 'Akali', nameKR: '아칼리', roles: ['MID', 'TOP'] },
    { id: 'Akshan', nameKR: '아크샨', roles: ['MID', 'ADC'] },
    { id: 'Aatrox', nameKR: '아트록스', roles: ['TOP'] },
    { id: 'Aphelios', nameKR: '아펠리오스', roles: ['ADC'] },
    { id: 'Alistar', nameKR: '알리스타', roles: ['SUPPORT'] },
    { id: 'Ambessa', nameKR: '암베사', roles: ['TOP'] },
    { id: 'Annie', nameKR: '애니', roles: ['MID'] },
    { id: 'Anivia', nameKR: '애니비아', roles: ['MID'] },
    { id: 'Ashe', nameKR: '애쉬', roles: ['ADC'] },
    { id: 'Yasuo', nameKR: '야스오', roles: ['MID', 'TOP'] },
    { id: 'Ekko', nameKR: '에코', roles: ['MID', 'JUNGLE'] },
    { id: 'Elise', nameKR: '엘리스', roles: ['JUNGLE'] },
    { id: 'MonkeyKing', nameKR: '오공', roles: ['TOP', 'JUNGLE'] },
    { id: 'Aurora', nameKR: '오로라', roles: ['MID', 'TOP'] },
    { id: 'Ornn', nameKR: '오른', roles: ['TOP'] },
    { id: 'Orianna', nameKR: '오리아나', roles: ['MID'] },
    { id: 'Olaf', nameKR: '올라프', roles: ['JUNGLE', 'TOP'] },
    { id: 'Yone', nameKR: '요네', roles: ['MID', 'TOP'] },
    { id: 'Yorick', nameKR: '요릭', roles: ['TOP'] },
    { id: 'Udyr', nameKR: '우디르', roles: ['JUNGLE'] },
    { id: 'Urgot', nameKR: '우르곳', roles: ['TOP'] },
    { id: 'Warwick', nameKR: '워윅', roles: ['JUNGLE'] },
    { id: 'Yunara', nameKR: '유나라', roles: ['ADC'] },
    { id: 'Yuumi', nameKR: '유미', roles: ['SUPPORT'] },
    { id: 'Irelia', nameKR: '이렐리아', roles: ['TOP', 'MID'] },
    { id: 'Evelynn', nameKR: '이블린', roles: ['JUNGLE'] },
    { id: 'Ezreal', nameKR: '이즈리얼', roles: ['ADC'] },
    { id: 'Illaoi', nameKR: '일라오이', roles: ['TOP'] },
    { id: 'JarvanIV', nameKR: '자르반 4세', roles: ['JUNGLE'] },
    { id: 'Xayah', nameKR: '자야', roles: ['ADC'] },
    { id: 'Zyra', nameKR: '자이라', roles: ['SUPPORT'] },
    { id: 'Zac', nameKR: '자크', roles: ['JUNGLE'] },
    { id: 'Zaahen', nameKR: '자헨', roles: ['MID'] },
    { id: 'Janna', nameKR: '잔나', roles: ['SUPPORT'] },
    { id: 'Jax', nameKR: '잭스', roles: ['TOP'] },
    { id: 'Zed', nameKR: '제드', roles: ['MID'] },
    { id: 'Xerath', nameKR: '제라스', roles: ['MID', 'SUPPORT'] },
    { id: 'Zeri', nameKR: '제리', roles: ['ADC'] },
    { id: 'Jayce', nameKR: '제이스', roles: ['TOP'] },
    { id: 'Zoe', nameKR: '조이', roles: ['MID'] },
    { id: 'Ziggs', nameKR: '직스', roles: ['MID', 'ADC'] },
    { id: 'Jhin', nameKR: '진', roles: ['ADC'] },
    { id: 'Zilean', nameKR: '질리언', roles: ['SUPPORT', 'MID'] },
    { id: 'Jinx', nameKR: '징크스', roles: ['ADC'] },
    { id: 'Chogath', nameKR: '초가스', roles: ['TOP'] },
    { id: 'Karma', nameKR: '카르마', roles: ['SUPPORT', 'MID'] },
    { id: 'Camille', nameKR: '카밀', roles: ['TOP'] },
    { id: 'Kassadin', nameKR: '카사딘', roles: ['MID'] },
    { id: 'Karthus', nameKR: '카서스', roles: ['JUNGLE'] },
    { id: 'Cassiopeia', nameKR: '카시오페아', roles: ['MID'] },
    { id: 'Kaisa', nameKR: '카이사', roles: ['ADC'] },
    { id: 'Khazix', nameKR: '카직스', roles: ['JUNGLE'] },
    { id: 'Katarina', nameKR: '카타리나', roles: ['MID'] },
    { id: 'Kalista', nameKR: '칼리스타', roles: ['ADC'] },
    { id: 'Kennen', nameKR: '케넨', roles: ['TOP'] },
    { id: 'Caitlyn', nameKR: '케이틀린', roles: ['ADC'] },
    { id: 'Kayn', nameKR: '케인', roles: ['JUNGLE'] },
    { id: 'Kayle', nameKR: '케일', roles: ['TOP'] },
    { id: 'KogMaw', nameKR: '코그모', roles: ['ADC'] },
    { id: 'Corki', nameKR: '코르키', roles: ['MID', 'ADC'] },
    { id: 'Quinn', nameKR: '퀸', roles: ['TOP'] },
    { id: 'KSante', nameKR: '크산테', roles: ['TOP'] },
    { id: 'Kled', nameKR: '클레드', roles: ['TOP'] },
    { id: 'Qiyana', nameKR: '키아나', roles: ['MID', 'JUNGLE'] },
    { id: 'Kindred', nameKR: '킨드레드', roles: ['JUNGLE'] },
    { id: 'Taric', nameKR: '타릭', roles: ['SUPPORT'] },
    { id: 'Talon', nameKR: '탈론', roles: ['MID', 'JUNGLE'] },
    { id: 'Taliyah', nameKR: '탈리야', roles: ['MID', 'JUNGLE'] },
    { id: 'TahmKench', nameKR: '탐 켄치', roles: ['SUPPORT', 'TOP'] },
    { id: 'Trundle', nameKR: '트런들', roles: ['TOP', 'JUNGLE'] },
    { id: 'Tristana', nameKR: '트리스타나', roles: ['ADC'] },
    { id: 'Tryndamere', nameKR: '트린다미어', roles: ['TOP'] },
    { id: 'TwistedFate', nameKR: '트위스티드 페이트', roles: ['MID'] },
    { id: 'Twitch', nameKR: '트위치', roles: ['ADC'] },
    { id: 'Teemo', nameKR: '티모', roles: ['TOP'] },
    { id: 'Pyke', nameKR: '파이크', roles: ['SUPPORT'] },
    { id: 'Pantheon', nameKR: '판테온', roles: ['MID', 'TOP'] },
    { id: 'Fiddlesticks', nameKR: '피들스틱', roles: ['JUNGLE'] },
    { id: 'Fiora', nameKR: '피오라', roles: ['TOP'] },
    { id: 'Fizz', nameKR: '피즈', roles: ['MID'] },
    { id: 'Heimerdinger', nameKR: '하이머딩거', roles: ['MID', 'TOP'] },
    { id: 'Hecarim', nameKR: '헤카림', roles: ['JUNGLE'] },
    { id: 'Hwei', nameKR: '흐웨이', roles: ['MID', 'SUPPORT'] },
];

// 가나다순 정렬
CHAMPIONS_DATA.sort((a, b) => a.nameKR.localeCompare(b.nameKR, 'ko'));

// ==================== 전역 상태 ====================

// 방장/관전자 모드
let sessionMode = 'host'; // 'host' 또는 'viewer'
let sessionId = null; // 세션 ID

// 게임 상태 (팀 이름 포함)
let gameState = {
    teamNames: {
        a: 'TEAM A',
        b: 'TEAM B'
    },
    teams: {
        a: [],
        b: []
    },
    assigned: false
};

let fearlessState = {
    seriesType: 3,
    currentGame: 1,
    bannedChampions: new Set(),
    games: [],
    currentBans: [],
    currentPicks: [],
    selectedChampion: null,
    currentRole: 'ALL', // 현재 선택된 라인
    // 밴픽 팀별 구조 (일반화)
    bans: {
        a: [],
        b: []
    },
    picks: {
        a: [],
        b: []
    }
};

// 하위 호환성을 위한 별칭 (삭제 예정)
let teamAssignmentState = gameState;

// ==================== Data Dragon 로딩 ====================

async function loadDataDragon() {
    try {
        console.log('🔄 Data Dragon 데이터 로딩 중...');

        // 1. 최신 버전 가져오기
        const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionsResponse.json();
        DD_VERSION = versions[0];
        console.log(`✅ 최신 Data Dragon 버전: ${DD_VERSION}`);

        // 2. 챔피언 데이터 가져오기 (한국어)
        const champDataUrl = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/ko_KR/champion.json`;
        const champDataResponse = await fetch(champDataUrl);
        const champData = await champDataResponse.json();

        // 3. 이미지 매핑 생성 (id -> image.full)
        Object.values(champData.data).forEach(champ => {
            championImageMap[champ.id] = {
                imageFull: champ.image.full,
                nameKR: champ.name,
                nameEN: champ.id
            };
        });

        console.log(`✅ ${Object.keys(championImageMap).length}개 챔피언 이미지 데이터 로드 완료`);
        dataDragonLoaded = true;

        // 4. 누락된 챔피언 확인
        const missingChampions = [];
        CHAMPIONS_DATA.forEach(champ => {
            if (!championImageMap[champ.id]) {
                missingChampions.push(`${champ.nameKR}(${champ.id})`);
            }
        });

        if (missingChampions.length > 0) {
            console.warn('⚠️ Data Dragon에 없는 챔피언:', missingChampions);
        }

    } catch (error) {
        console.error('❌ Data Dragon 로딩 실패:', error);
        console.warn('⚠️ 기본 버전 사용:', DD_VERSION);
    }
}

function getChampionImageUrl(championId) {
    if (dataDragonLoaded && championImageMap[championId]) {
        const imageName = championImageMap[championId].imageFull;
        const url = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${imageName}`;
        // 정상 로드는 로그 생략 (너무 많음)
        return url;
    }
    // Fallback: id로 파일명 추측
    const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${championId}.png`;
    console.warn(`⚠️ championImageMap에 없음, fallback 사용: ${championId} → ${fallbackUrl}`);
    return fallbackUrl;
}

function handleImageError(img, championName, championId) {
    const attemptedUrl = img.src;
    console.error(`❌ 이미지 로딩 실패!`);
    console.error(`   챔피언: ${championName} (ID: ${championId})`);
    console.error(`   시도한 URL: ${attemptedUrl}`);
    console.error(`   Data Dragon 버전: ${DD_VERSION}`);

    if (championImageMap[championId]) {
        console.error(`   championImageMap 값:`, championImageMap[championId]);
    } else {
        console.error(`   championImageMap에 '${championId}' 없음!`);
    }

    // Fallback: 텍스트만 표시
    img.style.display = 'none';
    const card = img.closest('.champion-card');
    if (card) {
        card.classList.add('no-image');
    }
}

// ==================== 방장/관전자 세션 관리 ====================

function initSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const session = urlParams.get('session');

    if (mode === 'viewer' && session) {
        sessionMode = 'viewer';
        sessionId = session;
        console.log(`🔵 관전자 모드로 접속 (세션 ID: ${sessionId})`);
    } else {
        sessionMode = 'host';
        sessionId = sessionId || generateSessionId();
        console.log(`🟢 방장 모드로 접속 (세션 ID: ${sessionId})`);
    }
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function getShareLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?mode=viewer&session=${sessionId}`;
}

function applyViewerMode() {
    if (sessionMode === 'viewer') {
        // 헤더에 관전자 모드 표시 추가
        const header = document.querySelector('header h1');
        header.innerHTML = '🎮 LoL 5대5 내전 도우미 <span style="color: #ffd700; font-size: 0.8em;">[관전자 모드]</span>';

        // 모든 입력 요소 비활성화
        document.querySelectorAll('input, select, button').forEach(element => {
            if (!element.classList.contains('tab-btn')) {
                element.disabled = true;
                element.style.opacity = '0.6';
                element.style.cursor = 'not-allowed';
            }
        });

        // 탭 버튼은 활성화 (보기는 가능)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });

        // 안내 문구 추가
        addViewerNotice();
    } else {
        // 방장 모드: 링크 공유 버튼 추가
        addShareButton();
    }
}

function addViewerNotice() {
    const notice = document.createElement('div');
    notice.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px;
        text-align: center;
        font-weight: 600;
        border-radius: 8px;
        margin: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    notice.innerHTML = '📺 관전자 모드 - 방장이 진행하는 내용을 실시간으로 확인하고 있습니다';

    const container = document.querySelector('.container');
    container.insertBefore(notice, container.firstChild.nextSibling);
}

function addShareButton() {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-primary';
    shareBtn.innerHTML = '🔗 관전자 링크 복사';
    shareBtn.style.cssText = 'margin-top: 10px;';
    shareBtn.onclick = () => {
        const link = getShareLink();
        navigator.clipboard.writeText(link).then(() => {
            alert(`관전자 링크가 복사되었습니다!\n\n${link}\n\n이 링크를 공유하면 다른 사람들이 실시간으로 확인할 수 있습니다.`);
        });
    };

    const header = document.querySelector('header');
    header.appendChild(shareBtn);
}

function startViewerSync() {
    // 1초마다 localStorage에서 상태 읽어서 UI 업데이트
    setInterval(() => {
        loadGameState();
        loadFearlessFromStorage();
    }, 1000);
}

// ==================== 챔피언 검증 ====================

function validateChampionList() {
    console.log('=== 챔피언 데이터 검증 시작 ===');
    console.log(`현재 챔피언 개수: ${CHAMPIONS_DATA.length}`);

    // 중복 ID 체크
    const idSet = new Set();
    const duplicates = [];
    CHAMPIONS_DATA.forEach(champ => {
        if (idSet.has(champ.id)) {
            duplicates.push(champ.id);
        }
        idSet.add(champ.id);
    });

    if (duplicates.length > 0) {
        console.warn('⚠️ 중복된 챔피언 ID:', duplicates);
    } else {
        console.log('✅ 중복 ID 없음');
    }

    // 한국어 이름 중복 체크
    const nameKRSet = new Set();
    const nameKRDuplicates = [];
    CHAMPIONS_DATA.forEach(champ => {
        if (nameKRSet.has(champ.nameKR)) {
            nameKRDuplicates.push(champ.nameKR);
        }
        nameKRSet.add(champ.nameKR);
    });

    if (nameKRDuplicates.length > 0) {
        console.warn('⚠️ 중복된 한국어 이름:', nameKRDuplicates);
    } else {
        console.log('✅ 중복 한국어 이름 없음');
    }

    // 라인 정보 검증
    const championsWithoutRoles = CHAMPIONS_DATA.filter(champ => !champ.roles || champ.roles.length === 0);
    if (championsWithoutRoles.length > 0) {
        console.warn('⚠️ 라인 정보가 없는 챔피언:', championsWithoutRoles.map(c => c.nameKR));
    } else {
        console.log('✅ 모든 챔피언에 라인 정보 존재');
    }

    // 라인별 챔피언 수
    const roleCount = {
        'TOP': 0,
        'JUNGLE': 0,
        'MID': 0,
        'ADC': 0,
        'SUPPORT': 0
    };

    CHAMPIONS_DATA.forEach(champ => {
        champ.roles.forEach(role => {
            if (roleCount[role] !== undefined) {
                roleCount[role]++;
            }
        });
    });

    console.log('📊 라인별 챔피언 수:');
    Object.entries(roleCount).forEach(([role, count]) => {
        console.log(`  ${role}: ${count}개`);
    });

    // 새 챔피언 경고 (이미지가 없을 가능성)
    const potentiallyNewChampions = ['Mel', 'Aurora', 'Ambessa', 'Yunara', 'Zaahen'];
    const foundNewChampions = CHAMPIONS_DATA.filter(champ =>
        potentiallyNewChampions.includes(champ.id)
    );

    if (foundNewChampions.length > 0) {
        console.warn('⚠️ 신규/미출시 챔피언 (이미지가 없을 수 있음):',
            foundNewChampions.map(c => `${c.nameKR}(${c.id})`));
    }

    console.log('=== 챔피언 데이터 검증 완료 ===\n');
}

// ==================== 초기화 ====================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 방장/관전자 모드 초기화
    initSession();

    // 2. Data Dragon 데이터 먼저 로드
    await loadDataDragon();

    // 3. 챔피언 데이터 검증
    validateChampionList();

    // 4. 나머지 초기화
    initTabs();
    initTeamAssignment();
    initFearless();

    // 5. 방장 모드일 때만 예제 데이터 로드
    if (sessionMode === 'host') {
        loadExampleData();
    }

    // 6. 저장된 상태 로드
    loadFearlessFromStorage();
    loadTeamAssignmentFromStorage();

    // 7. 관전자 모드 UI 업데이트
    applyViewerMode();

    // 8. 관전자 모드일 때 자동 새로고침 시작
    if (sessionMode === 'viewer') {
        startViewerSync();
    }
});

// ==================== 탭 전환 ====================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// ==================== 팀 배정 기능 ====================

function generatePlayerCards() {
    const container = document.getElementById('player-cards-container');
    if (!container) return;

    const tierOptions = `
        <option value="0.25">Iron IV</option>
        <option value="0.50">Iron III</option>
        <option value="0.75">Iron II</option>
        <option value="1.00">Iron I</option>
        <option value="1.25">Bronze IV</option>
        <option value="1.50">Bronze III</option>
        <option value="1.75">Bronze II</option>
        <option value="2.00">Bronze I</option>
        <option value="2.25">Silver IV</option>
        <option value="2.50">Silver III</option>
        <option value="2.75">Silver II</option>
        <option value="3.00">Silver I</option>
        <option value="3.25">Gold IV</option>
        <option value="3.50">Gold III</option>
        <option value="3.75">Gold II</option>
        <option value="4.00" selected>Gold I</option>
        <option value="4.25">Platinum IV</option>
        <option value="4.50">Platinum III</option>
        <option value="4.75">Platinum II</option>
        <option value="5.00">Platinum I</option>
        <option value="5.25">Emerald IV</option>
        <option value="5.50">Emerald III</option>
        <option value="5.75">Emerald II</option>
        <option value="6.00">Emerald I</option>
        <option value="6.25">Diamond IV</option>
        <option value="6.50">Diamond III</option>
        <option value="6.75">Diamond II</option>
        <option value="7.00">Diamond I</option>
        <option value="7.00">Master</option>
        <option value="8.00">Grandmaster</option>
        <option value="9.00">Challenger</option>
    `;

    const posLabels = { TOP: 'TOP', JUNGLE: 'JG', MID: 'MID', ADC: 'ADC', SUPPORT: 'SUP' };

    let html = '';
    for (let i = 0; i < 10; i++) {
        const posChecks = POSITIONS.map(pos => `
            <label class="position-check-label" data-player="${i}" data-pos="${pos}">
                <input type="checkbox" class="position-check" data-player="${i}" data-pos="${pos}">
                ${posLabels[pos]}
            </label>
        `).join('');

        html += `
            <div class="player-card" data-player="${i}">
                <div class="player-card-header">Player ${i + 1}</div>
                <div class="player-card-row">
                    <input type="text" class="player-name" data-player="${i}" placeholder="닉네임">
                    <select class="player-tier" data-player="${i}">${tierOptions}</select>
                </div>
                <div class="position-checkboxes">${posChecks}</div>
            </div>
        `;
    }
    container.innerHTML = html;

    // 체크박스 토글 이벤트
    container.querySelectorAll('.position-check-label').forEach(label => {
        label.addEventListener('click', (e) => {
            e.preventDefault();
            const checkbox = label.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            label.classList.toggle('checked', checkbox.checked);
        });
    });
}

function initTeamAssignment() {
    // 플레이어 카드 생성
    generatePlayerCards();

    // 팀 이름 입력 이벤트
    document.getElementById('team-a-name').addEventListener('input', (e) => {
        gameState.teamNames.a = e.target.value.trim() || 'TEAM A';
        saveGameState();
        updateAllTeamNames();
    });

    document.getElementById('team-b-name').addEventListener('input', (e) => {
        gameState.teamNames.b = e.target.value.trim() || 'TEAM B';
        saveGameState();
        updateAllTeamNames();
    });

    document.getElementById('random-assign-btn').addEventListener('click', () => {
        const validation = getAndValidatePlayers();
        if (!validation) return;
        const result = randomAssign(validation);
        if (result) displayTeamResult(result);
    });

    document.getElementById('balanced-assign-btn').addEventListener('click', () => {
        const validation = getAndValidatePlayers();
        if (!validation) return;
        const result = balancedAssign(validation);
        if (result) displayTeamResult(result);
    });
}

function getAndValidatePlayers() {
    const players = getPlayersFromInputs();
    const error = validatePlayers(players);
    if (error) {
        alert(error);
        return null;
    }
    return players;
}

function updateAllTeamNames() {
    // 팀 배정 결과 업데이트
    const teamAHeader = document.querySelector('.team-a-header');
    const teamBHeader = document.querySelector('.team-b-header');
    if (teamAHeader) teamAHeader.textContent = gameState.teamNames.a;
    if (teamBHeader) teamBHeader.textContent = gameState.teamNames.b;

    // 밴픽 화면 업데이트
    updateFearlessUI();
}

function loadExampleData() {
    const examplePlayers = [
        { name: 'TheShy', tier: '8.00', positions: ['TOP'] },
        { name: 'Kiin', tier: '7.00', positions: ['TOP', 'MID'] },
        { name: 'Canyon', tier: '9.00', positions: ['JUNGLE'] },
        { name: 'Oner', tier: '8.00', positions: ['JUNGLE'] },
        { name: 'Faker', tier: '9.00', positions: ['MID'] },
        { name: 'Chovy', tier: '9.00', positions: ['MID', 'ADC'] },
        { name: 'Gumayusi', tier: '8.00', positions: ['ADC'] },
        { name: 'Viper', tier: '8.00', positions: ['ADC', 'MID'] },
        { name: 'Keria', tier: '9.00', positions: ['SUPPORT'] },
        { name: 'Lehends', tier: '7.00', positions: ['SUPPORT'] }
    ];

    examplePlayers.forEach((player, i) => {
        const nameInput = document.querySelector(`.player-name[data-player="${i}"]`);
        const tierSelect = document.querySelector(`.player-tier[data-player="${i}"]`);
        if (nameInput) nameInput.value = player.name;
        if (tierSelect) tierSelect.value = player.tier;

        player.positions.forEach(pos => {
            const label = document.querySelector(`.position-check-label[data-player="${i}"][data-pos="${pos}"]`);
            if (label) {
                const checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = true;
                    label.classList.add('checked');
                }
            }
        });
    });
}

function getPlayersFromInputs() {
    const players = [];

    for (let i = 0; i < 10; i++) {
        const nameInput = document.querySelector(`.player-name[data-player="${i}"]`);
        const tierSelect = document.querySelector(`.player-tier[data-player="${i}"]`);

        const positions = [];
        document.querySelectorAll(`.position-check[data-player="${i}"]:checked`).forEach(cb => {
            positions.push(cb.dataset.pos);
        });

        players.push({
            name: nameInput ? nameInput.value.trim() : '',
            tier: tierSelect ? parseFloat(tierSelect.value) : 4.0,
            positions: positions
        });
    }

    return players;
}

function validatePlayers(players) {
    for (let i = 0; i < players.length; i++) {
        if (!players[i].name) {
            return `Player ${i + 1}의 닉네임을 입력해주세요!`;
        }
        if (players[i].positions.length === 0) {
            return `${players[i].name}의 가능 포지션을 최소 1개 선택해주세요!`;
        }
    }

    // 각 포지션에 최소 2명 이상 가능한지 확인
    for (const pos of POSITIONS) {
        const count = players.filter(p => p.positions.includes(pos)).length;
        if (count < 2) {
            const posName = { TOP: '탑', JUNGLE: '정글', MID: '미드', ADC: '원딜', SUPPORT: '서포터' }[pos];
            return `배정 불가: ${posName}(${pos}) 가능한 인원이 ${count}명입니다. 최소 2명 필요합니다. 포지션 선택을 수정해주세요.`;
        }
    }

    return null; // 유효
}

// 이분 매칭(backtracking)으로 5명에게 5개 포지션 배정
function tryAssignPositions(team) {
    // 가능 포지션이 적은 순서로 정렬 (greedy heuristic)
    const sorted = team.map((p, i) => ({ player: p, idx: i }))
        .sort((a, b) => a.player.positions.length - b.player.positions.length);

    const assigned = {}; // position -> player index in team
    const playerPos = new Array(team.length).fill(null); // player index -> position

    function backtrack(sortedIdx) {
        if (sortedIdx === sorted.length) {
            return true; // 모든 플레이어 배정 완료
        }

        const { player, idx } = sorted[sortedIdx];
        for (const pos of player.positions) {
            if (!(pos in assigned)) {
                assigned[pos] = idx;
                playerPos[idx] = pos;
                if (backtrack(sortedIdx + 1)) return true;
                delete assigned[pos];
                playerPos[idx] = null;
            }
        }
        return false;
    }

    if (backtrack(0)) {
        // 배정 결과 적용
        team.forEach((player, i) => {
            player.assignedPosition = playerPos[i];
            // 하위 호환: position 필드도 설정
            player.position = playerPos[i];
        });
        return true;
    }
    return false;
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randomAssign(players) {
    // 최대 1000번 랜덤 셔플 시도
    for (let attempt = 0; attempt < 1000; attempt++) {
        const shuffled = shuffleArray(players);
        const teamA = shuffled.slice(0, 5).map(p => ({ ...p }));
        const teamB = shuffled.slice(5, 10).map(p => ({ ...p }));

        if (tryAssignPositions(teamA) && tryAssignPositions(teamB)) {
            return { teamA, teamB };
        }
    }

    alert('배정 실패: 현재 포지션 조합으로는 유효한 팀 배정을 찾을 수 없습니다. 포지션 선택을 수정해주세요.');
    return null;
}

function balancedAssign(players) {
    let bestAssignment = null;
    let bestScore = Infinity;

    // C(10,5) = 252개 조합 열거
    const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    function combinations(arr, k) {
        const result = [];
        function helper(start, combo) {
            if (combo.length === k) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combo.push(arr[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        }
        helper(0, []);
        return result;
    }

    const combos = combinations(indices, 5);

    for (const teamAIndices of combos) {
        const teamBIndices = indices.filter(i => !teamAIndices.includes(i));

        const teamA = teamAIndices.map(i => ({ ...players[i] }));
        const teamB = teamBIndices.map(i => ({ ...players[i] }));

        if (!tryAssignPositions(teamA) || !tryAssignPositions(teamB)) {
            continue;
        }

        const scoreA = teamA.reduce((sum, p) => sum + p.tier, 0);
        const scoreB = teamB.reduce((sum, p) => sum + p.tier, 0);
        const score = Math.abs(scoreA - scoreB);

        if (score < bestScore) {
            bestScore = score;
            bestAssignment = { teamA, teamB };
        }
    }

    if (!bestAssignment) {
        alert('배정 실패: 현재 포지션 조합으로는 유효한 팀 배정을 찾을 수 없습니다. 포지션 선택을 수정해주세요.');
        return null;
    }

    return bestAssignment;
}

// ==================== 드래그 앤 드롭 결과 편집 ====================

const POS_SHORT = { TOP: 'TOP', JUNGLE: 'JG', MID: 'MID', ADC: 'ADC', SUPPORT: 'SUP' };

function renderDraggableRoster(rosterEl, team, teamKey) {
    rosterEl.innerHTML = '';

    POSITIONS.forEach(pos => {
        const player = team.find(p => (p.assignedPosition || p.position) === pos);
        const slot = document.createElement('div');
        slot.className = 'roster-slot';
        slot.dataset.team = teamKey;
        slot.dataset.pos = pos;

        if (player) {
            const availPosStr = (player.positions || []).map(p => POS_SHORT[p] || p).join('/');
            slot.innerHTML = `
                <div class="roster-item" draggable="true" data-team="${teamKey}" data-pos="${pos}">
                    <span class="position">${pos}</span>
                    <div class="roster-name-area">
                        <span class="name">${player.name}</span>
                        <span class="available-positions">${availPosStr}</span>
                    </div>
                    <span class="tier">${scoreToTierDisplay(player.tier)}</span>
                </div>
            `;
        }

        rosterEl.appendChild(slot);
    });
}

function updateScoreDisplay() {
    const teamA = gameState.teams.a;
    const teamB = gameState.teams.b;
    const scoreA = teamA.reduce((sum, p) => sum + p.tier, 0);
    const scoreB = teamB.reduce((sum, p) => sum + p.tier, 0);
    const scoreAEl = document.getElementById('team-a-score');
    const scoreBEl = document.getElementById('team-b-score');
    if (scoreAEl) scoreAEl.textContent = scoreA.toFixed(2);
    if (scoreBEl) scoreBEl.textContent = scoreB.toFixed(2);
}

function renderAllRosters() {
    const rosterA = document.getElementById('team-a-roster');
    const rosterB = document.getElementById('team-b-roster');
    if (rosterA) renderDraggableRoster(rosterA, gameState.teams.a, 'a');
    if (rosterB) renderDraggableRoster(rosterB, gameState.teams.b, 'b');
    updateScoreDisplay();
    initDragAndDrop();
}

function swapPlayers(srcTeam, srcPos, dstTeam, dstPos) {
    if (srcTeam === dstTeam && srcPos === dstPos) return;

    const srcArr = gameState.teams[srcTeam];
    const dstArr = gameState.teams[dstTeam];
    const srcIdx = srcArr.findIndex(p => (p.assignedPosition || p.position) === srcPos);
    const dstIdx = dstArr.findIndex(p => (p.assignedPosition || p.position) === dstPos);

    if (srcIdx === -1) return;

    if (srcTeam === dstTeam) {
        // 같은 팀 내 스왑
        if (dstIdx !== -1) {
            // 서로 교환
            srcArr[srcIdx].assignedPosition = dstPos;
            srcArr[srcIdx].position = dstPos;
            srcArr[dstIdx].assignedPosition = srcPos;
            srcArr[dstIdx].position = srcPos;
        } else {
            srcArr[srcIdx].assignedPosition = dstPos;
            srcArr[srcIdx].position = dstPos;
        }
    } else {
        // 팀 간 스왑
        const srcPlayer = srcArr[srcIdx];
        srcPlayer.assignedPosition = dstPos;
        srcPlayer.position = dstPos;

        if (dstIdx !== -1) {
            const dstPlayer = dstArr[dstIdx];
            dstPlayer.assignedPosition = srcPos;
            dstPlayer.position = srcPos;
            // 배열에서 교환
            srcArr[srcIdx] = dstPlayer;
            dstArr[dstIdx] = srcPlayer;
        } else {
            srcArr.splice(srcIdx, 1);
            dstArr.push(srcPlayer);
        }
    }

    saveGameState();
    renderAllRosters();
}

// HTML5 Drag & Drop
let dragSrcTeam = null;
let dragSrcPos = null;

function initDragAndDrop() {
    const resultEl = document.getElementById('team-result');
    if (!resultEl) return;

    // Draggable items
    resultEl.querySelectorAll('.roster-item[draggable]').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            dragSrcTeam = item.dataset.team;
            dragSrcPos = item.dataset.pos;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            resultEl.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });
    });

    // Drop slots
    resultEl.querySelectorAll('.roster-slot').forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');
            if (dragSrcTeam !== null && dragSrcPos !== null) {
                swapPlayers(dragSrcTeam, dragSrcPos, slot.dataset.team, slot.dataset.pos);
            }
            dragSrcTeam = null;
            dragSrcPos = null;
        });
    });

    // Touch drag support
    initTouchDrag(resultEl);
}

// ==================== 터치 드래그 ====================

let touchDragState = null;

function initTouchDrag(resultEl) {
    resultEl.querySelectorAll('.roster-item[draggable]').forEach(item => {
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
    });
}

function handleTouchStart(e) {
    const item = e.currentTarget;
    const touch = e.touches[0];

    // 길게 누르기 방지를 위해 약간의 딜레이 없이 바로 시작
    touchDragState = {
        srcTeam: item.dataset.team,
        srcPos: item.dataset.pos,
        ghost: null,
        startX: touch.clientX,
        startY: touch.clientY,
        moved: false,
        item: item
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchMove(e) {
    if (!touchDragState) return;
    e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - touchDragState.startX;
    const dy = touch.clientY - touchDragState.startY;

    // 최소 이동 거리 체크
    if (!touchDragState.moved && Math.abs(dx) + Math.abs(dy) < 10) return;
    touchDragState.moved = true;

    // 고스트 생성
    if (!touchDragState.ghost) {
        touchDragState.item.classList.add('dragging');
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        const nameEl = touchDragState.item.querySelector('.name');
        const posEl = touchDragState.item.querySelector('.position');
        ghost.textContent = `${posEl ? posEl.textContent : ''} ${nameEl ? nameEl.textContent : ''}`;
        document.body.appendChild(ghost);
        touchDragState.ghost = ghost;
    }

    touchDragState.ghost.style.left = (touch.clientX - 60) + 'px';
    touchDragState.ghost.style.top = (touch.clientY - 24) + 'px';

    // 하이라이트
    document.querySelectorAll('.roster-slot').forEach(s => s.classList.remove('drag-over'));
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
        const slot = target.closest('.roster-slot');
        if (slot) slot.classList.add('drag-over');
    }
}

function handleTouchEnd(e) {
    if (!touchDragState) return;

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    if (touchDragState.ghost) {
        touchDragState.ghost.remove();
    }
    touchDragState.item.classList.remove('dragging');
    document.querySelectorAll('.roster-slot').forEach(s => s.classList.remove('drag-over'));

    if (touchDragState.moved) {
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target) {
            const slot = target.closest('.roster-slot');
            if (slot) {
                swapPlayers(touchDragState.srcTeam, touchDragState.srcPos, slot.dataset.team, slot.dataset.pos);
            }
        }
    }

    touchDragState = null;
}

// ==================== 결과 표시 ====================

function displayTeamResult(teams) {
    const { teamA, teamB } = teams;

    gameState.teams.a = teamA;
    gameState.teams.b = teamB;
    gameState.assigned = true;

    saveGameState();

    document.querySelector('.team-a-header').textContent = gameState.teamNames.a;
    document.querySelector('.team-b-header').textContent = gameState.teamNames.b;

    document.getElementById('team-result').style.display = 'block';
    renderAllRosters();
}

// ==================== 피어리스 밴픽 기능 ====================

function initFearless() {
    document.getElementById('series-type').addEventListener('change', (e) => {
        fearlessState.seriesType = parseInt(e.target.value);
        saveFearlessToStorage();
    });

    document.getElementById('reset-fearless-btn').addEventListener('click', () => {
        if (confirm('모든 피어리스 데이터를 초기화하시겠습니까?')) {
            resetFearless();
        }
    });

    document.getElementById('confirm-game-btn').addEventListener('click', confirmGame);
    document.getElementById('prev-game-btn').addEventListener('click', showPreviousGame);

    document.getElementById('champion-search').addEventListener('input', (e) => {
        filterChampions(e.target.value);
    });

    // 라인별 탭 초기화
    initRoleTabs();

    // 챔피언 리스트 스크롤 시 페이지 스크롤 방지
    const championList = document.getElementById('champion-list');
    championList.addEventListener('wheel', (e) => {
        const isScrollable = championList.scrollHeight > championList.clientHeight;
        if (isScrollable) {
            e.stopPropagation();
        }
    }, { passive: false });

    renderChampionList();
    updateFearlessUI();
}

function initRoleTabs() {
    const roleTabs = document.querySelectorAll('.role-tab');

    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            fearlessState.currentRole = tab.dataset.role;
            renderChampionList();
        });
    });
}

function resetFearless() {
    fearlessState = {
        seriesType: parseInt(document.getElementById('series-type').value),
        currentGame: 1,
        bannedChampions: new Set(),
        games: [],
        currentBans: [],
        currentPicks: [],
        selectedChampion: null,
        currentRole: 'ALL',
        bans: {
            a: [],
            b: []
        },
        picks: {
            a: [],
            b: []
        }
    };

    saveFearlessToStorage();
    renderChampionList();
    updateFearlessUI();
}

function getFilteredChampions(searchText = '') {
    let champions = CHAMPIONS_DATA;

    // 라인별 필터링
    if (fearlessState.currentRole !== 'ALL') {
        champions = champions.filter(champ =>
            champ.roles.includes(fearlessState.currentRole)
        );
    }

    // 검색어 필터링
    if (searchText) {
        champions = champions.filter(champ =>
            champ.nameKR.includes(searchText) ||
            champ.id.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    return champions;
}

function renderChampionList(searchText = '') {
    const championList = document.getElementById('champion-list');
    championList.innerHTML = '';

    const filteredChampions = getFilteredChampions(searchText);

    filteredChampions.forEach(champion => {
        const div = document.createElement('div');
        div.className = 'champion-card';

        const isBanned = fearlessState.bannedChampions.has(champion.nameKR);
        const isInCurrentGame =
            fearlessState.bans.a.includes(champion.nameKR) ||
            fearlessState.bans.b.includes(champion.nameKR) ||
            fearlessState.picks.a.includes(champion.nameKR) ||
            fearlessState.picks.b.includes(champion.nameKR);

        if (isBanned || isInCurrentGame) {
            div.classList.add('disabled');
        }

        if (fearlessState.selectedChampion === champion.nameKR) {
            div.classList.add('selected');
        }

        // 챔피언 이미지 + 이름
        const imageUrl = getChampionImageUrl(champion.id);
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = champion.nameKR;
        img.loading = 'lazy';
        img.onerror = function() {
            handleImageError(this, champion.nameKR, champion.id);
        };

        const nameSpan = document.createElement('span');
        nameSpan.className = 'champion-name';
        nameSpan.textContent = champion.nameKR;

        div.appendChild(img);
        div.appendChild(nameSpan);

        div.addEventListener('click', () => {
            if (!isBanned && !isInCurrentGame) {
                selectChampion(champion.nameKR, div);
            }
        });

        championList.appendChild(div);
    });
}

function selectChampion(championName, element) {
    document.querySelectorAll('.champion-card.selected').forEach(item => {
        item.classList.remove('selected');
    });

    fearlessState.selectedChampion = championName;
    element.classList.add('selected');

    showChampionActions(championName);
}

function showChampionActions(championName) {
    const existingActions = document.querySelector('.champion-actions');
    if (existingActions) existingActions.remove();

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'button-group champion-actions';
    actionsDiv.style.marginTop = '10px';
    actionsDiv.style.display = 'grid';
    actionsDiv.style.gridTemplateColumns = '1fr 1fr';
    actionsDiv.style.gap = '10px';

    // 팀 A 밴/픽
    const teamABanBtn = document.createElement('button');
    teamABanBtn.className = 'btn btn-danger';
    teamABanBtn.textContent = `${gameState.teamNames.a} BAN`;
    teamABanBtn.onclick = () => addToBan(championName, 'a');

    const teamAPickBtn = document.createElement('button');
    teamAPickBtn.className = 'btn btn-primary';
    teamAPickBtn.textContent = `${gameState.teamNames.a} PICK`;
    teamAPickBtn.onclick = () => addToPick(championName, 'a');

    // 팀 B 밴/픽
    const teamBBanBtn = document.createElement('button');
    teamBBanBtn.className = 'btn btn-danger';
    teamBBanBtn.textContent = `${gameState.teamNames.b} BAN`;
    teamBBanBtn.onclick = () => addToBan(championName, 'b');

    const teamBPickBtn = document.createElement('button');
    teamBPickBtn.className = 'btn btn-primary';
    teamBPickBtn.textContent = `${gameState.teamNames.b} PICK`;
    teamBPickBtn.onclick = () => addToPick(championName, 'b');

    actionsDiv.appendChild(teamABanBtn);
    actionsDiv.appendChild(teamBBanBtn);
    actionsDiv.appendChild(teamAPickBtn);
    actionsDiv.appendChild(teamBPickBtn);

    document.querySelector('.champion-selector').appendChild(actionsDiv);
}

function addToBan(championName, team) {
    const banArray = fearlessState.bans[team];
    const teamName = gameState.teamNames[team];

    if (banArray.length >= 5) {
        alert(`${teamName} 밴은 최대 5개까지 가능합니다.`);
        return;
    }

    if (!banArray.includes(championName)) {
        banArray.push(championName);
        fearlessState.selectedChampion = null;

        // 액션 버튼 제거
        const existingActions = document.querySelector('.champion-actions');
        if (existingActions) existingActions.remove();

        renderChampionList(document.getElementById('champion-search').value);
        updateFearlessUI();
        saveFearlessToStorage();
    }
}

function addToPick(championName, team) {
    const pickArray = fearlessState.picks[team];
    const teamName = gameState.teamNames[team];

    if (pickArray.length >= 5) {
        alert(`${teamName} 픽은 최대 5개까지 가능합니다.`);
        return;
    }

    if (!pickArray.includes(championName)) {
        pickArray.push(championName);
        fearlessState.selectedChampion = null;

        // 액션 버튼 제거
        const existingActions = document.querySelector('.champion-actions');
        if (existingActions) existingActions.remove();

        renderChampionList(document.getElementById('champion-search').value);
        updateFearlessUI();
        saveFearlessToStorage();
    }
}

function removeFromBan(championName, team) {
    fearlessState.bans[team] = fearlessState.bans[team].filter(c => c !== championName);
    renderChampionList(document.getElementById('champion-search').value);
    updateFearlessUI();
    saveFearlessToStorage();
}

function removeFromPick(championName, team) {
    fearlessState.picks[team] = fearlessState.picks[team].filter(c => c !== championName);
    renderChampionList(document.getElementById('champion-search').value);
    updateFearlessUI();
    saveFearlessToStorage();
}

function updateFearlessUI() {
    document.getElementById('current-game').textContent = `Game ${fearlessState.currentGame}`;
    document.getElementById('banned-count').textContent = fearlessState.bannedChampions.size;

    // 팀 이름 업데이트
    const teamABanHeader = document.querySelector('.team-a-ban-header');
    const teamBBanHeader = document.querySelector('.team-b-ban-header');
    const teamAPickHeader = document.querySelector('.team-a-pick-header');
    const teamBPickHeader = document.querySelector('.team-b-pick-header');

    if (teamABanHeader) teamABanHeader.textContent = gameState.teamNames.a;
    if (teamBBanHeader) teamBBanHeader.textContent = gameState.teamNames.b;
    if (teamAPickHeader) teamAPickHeader.textContent = gameState.teamNames.a;
    if (teamBPickHeader) teamBPickHeader.textContent = gameState.teamNames.b;

    // 밴/픽 개수 표시 업데이트
    document.getElementById('team-a-ban-count').textContent = `${fearlessState.bans.a.length}/5`;
    document.getElementById('team-b-ban-count').textContent = `${fearlessState.bans.b.length}/5`;
    document.getElementById('team-a-pick-count').textContent = `${fearlessState.picks.a.length}/5`;
    document.getElementById('team-b-pick-count').textContent = `${fearlessState.picks.b.length}/5`;

    // 팀 A BAN 목록
    const teamABansDiv = document.getElementById('team-a-bans');
    teamABansDiv.innerHTML = '';
    fearlessState.bans.a.forEach(championName => {
        const tag = document.createElement('div');
        tag.className = 'champion-tag ban';
        tag.innerHTML = `
            ${championName}
            <button class="remove-btn" onclick="removeFromBan('${championName}', 'a')">×</button>
        `;
        teamABansDiv.appendChild(tag);
    });

    // 팀 B BAN 목록
    const teamBBansDiv = document.getElementById('team-b-bans');
    teamBBansDiv.innerHTML = '';
    fearlessState.bans.b.forEach(championName => {
        const tag = document.createElement('div');
        tag.className = 'champion-tag ban';
        tag.innerHTML = `
            ${championName}
            <button class="remove-btn" onclick="removeFromBan('${championName}', 'b')">×</button>
        `;
        teamBBansDiv.appendChild(tag);
    });

    // 팀 A PICK 목록
    const teamAPicksDiv = document.getElementById('team-a-picks');
    teamAPicksDiv.innerHTML = '';
    fearlessState.picks.a.forEach(championName => {
        const tag = document.createElement('div');
        tag.className = 'champion-tag pick';
        tag.innerHTML = `
            ${championName}
            <button class="remove-btn" onclick="removeFromPick('${championName}', 'a')">×</button>
        `;
        teamAPicksDiv.appendChild(tag);
    });

    // 팀 B PICK 목록
    const teamBPicksDiv = document.getElementById('team-b-picks');
    teamBPicksDiv.innerHTML = '';
    fearlessState.picks.b.forEach(championName => {
        const tag = document.createElement('div');
        tag.className = 'champion-tag pick';
        tag.innerHTML = `
            ${championName}
            <button class="remove-btn" onclick="removeFromPick('${championName}', 'b')">×</button>
        `;
        teamBPicksDiv.appendChild(tag);
    });

    // 게임 히스토리 표시 (경고 없이)
    displayGameHistory();
}

function confirmGame() {
    const totalBans = fearlessState.bans.a.length + fearlessState.bans.b.length;
    const totalPicks = fearlessState.picks.a.length + fearlessState.picks.b.length;

    if (totalBans === 0 && totalPicks === 0) {
        alert('최소 1개 이상의 챔피언을 BAN 또는 PICK해주세요!');
        return;
    }

    const gameRecord = {
        gameNum: fearlessState.currentGame,
        teamNames: { ...gameState.teamNames },
        bans: {
            a: [...fearlessState.bans.a],
            b: [...fearlessState.bans.b]
        },
        picks: {
            a: [...fearlessState.picks.a],
            b: [...fearlessState.picks.b]
        }
    };

    fearlessState.games.push(gameRecord);

    // 모든 밴/픽을 금지 목록에 추가
    fearlessState.bans.a.forEach(champ => fearlessState.bannedChampions.add(champ));
    fearlessState.bans.b.forEach(champ => fearlessState.bannedChampions.add(champ));
    fearlessState.picks.a.forEach(champ => fearlessState.bannedChampions.add(champ));
    fearlessState.picks.b.forEach(champ => fearlessState.bannedChampions.add(champ));

    if (fearlessState.currentGame >= fearlessState.seriesType) {
        alert(`Bo${fearlessState.seriesType} 시리즈가 완료되었습니다!`);
    } else {
        fearlessState.currentGame++;
        fearlessState.bans.a = [];
        fearlessState.bans.b = [];
        fearlessState.picks.a = [];
        fearlessState.picks.b = [];
        fearlessState.selectedChampion = null;
    }

    saveFearlessToStorage();
    renderChampionList();
    updateFearlessUI();
}

function showPreviousGame() {
    // 경고 메시지 제거: 게임 기록이 없어도 조용히 처리
    displayGameHistory();
}

function displayGameHistory() {
    const historyDiv = document.getElementById('history-list');

    if (fearlessState.games.length === 0) {
        historyDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">아직 확정된 게임이 없습니다.</p>';
        return;
    }

    const historyHtml = fearlessState.games.map(game => {
        const teamNameA = game.teamNames?.a || 'TEAM A';
        const teamNameB = game.teamNames?.b || 'TEAM B';
        return `
            <div class="history-item">
                <h4>Game ${game.gameNum}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <p><strong>${teamNameA} BAN:</strong> ${game.bans?.a?.join(', ') || game.blueBans?.join(', ') || '없음'}</p>
                        <p><strong>${teamNameA} PICK:</strong> ${game.picks?.a?.join(', ') || game.bluePicks?.join(', ') || '없음'}</p>
                    </div>
                    <div>
                        <p><strong>${teamNameB} BAN:</strong> ${game.bans?.b?.join(', ') || game.redBans?.join(', ') || '없음'}</p>
                        <p><strong>${teamNameB} PICK:</strong> ${game.picks?.b?.join(', ') || game.redPicks?.join(', ') || '없음'}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    historyDiv.innerHTML = historyHtml;
}

function filterChampions(searchText) {
    renderChampionList(searchText);
}

// ==================== localStorage 저장/로드 ====================

function saveFearlessToStorage() {
    const dataToSave = {
        ...fearlessState,
        bannedChampions: Array.from(fearlessState.bannedChampions)
    };
    localStorage.setItem('fearlessState', JSON.stringify(dataToSave));
}

function loadFearlessFromStorage() {
    const saved = localStorage.getItem('fearlessState');
    if (saved) {
        const data = JSON.parse(saved);
        fearlessState = {
            ...data,
            bannedChampions: new Set(data.bannedChampions),
            currentRole: data.currentRole || 'ALL',
            bans: data.bans || { a: data.blueBans || [], b: data.redBans || [] },
            picks: data.picks || { a: data.bluePicks || [], b: data.redPicks || [] }
        };

        document.getElementById('series-type').value = fearlessState.seriesType;

        // 라인 탭 활성화
        const activeTab = document.querySelector(`.role-tab[data-role="${fearlessState.currentRole}"]`);
        if (activeTab) {
            document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
            activeTab.classList.add('active');
        }

        renderChampionList();
        updateFearlessUI();
    }
}

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const data = JSON.parse(saved);

        // 하위 호환성: 기존 blueTeam/redTeam 데이터를 teamA/teamB로 변환
        gameState = {
            teamNames: data.teamNames || { a: 'TEAM A', b: 'TEAM B' },
            teams: {
                a: data.teams?.a || data.blueTeam || [],
                b: data.teams?.b || data.redTeam || []
            },
            assigned: data.assigned || false
        };

        // 팀 이름 입력창 업데이트
        document.getElementById('team-a-name').value = gameState.teamNames.a;
        document.getElementById('team-b-name').value = gameState.teamNames.b;

        if (gameState.assigned && gameState.teams.a.length > 0 && gameState.teams.b.length > 0) {
            // UI 업데이트
            displayGameStateFromStorage();
        }
    }
}

// 하위 호환성을 위한 별칭
function saveTeamAssignmentToStorage() {
    saveGameState();
}

function loadTeamAssignmentFromStorage() {
    loadGameState();
}

function displayGameStateFromStorage() {
    const teamA = gameState.teams.a;
    const teamB = gameState.teams.b;

    // 레거시 데이터 호환: assignedPosition 없으면 position 복사
    [...teamA, ...teamB].forEach(p => {
        if (!p.assignedPosition && p.position) {
            p.assignedPosition = p.position;
        }
        if (!p.positions) {
            p.positions = p.position ? [p.position] : [];
        }
    });

    // 팀 이름 표시
    const teamAHeader = document.querySelector('.team-a-header');
    const teamBHeader = document.querySelector('.team-b-header');
    if (teamAHeader) teamAHeader.textContent = gameState.teamNames.a;
    if (teamBHeader) teamBHeader.textContent = gameState.teamNames.b;

    const resultDiv = document.getElementById('team-result');
    if (resultDiv) resultDiv.style.display = 'block';

    renderAllRosters();
}

// 하위 호환성
function displayTeamResultFromStorage(data) {
    displayGameStateFromStorage();
}

// 전역 함수로 노출
window.removeFromBan = removeFromBan;
window.removeFromPick = removeFromPick;
