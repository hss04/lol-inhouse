// ==================== 전역 상수 및 데이터 ====================

const TIER_MAP = {
    '1': 'Iron',
    '2': 'Bronze',
    '3': 'Silver',
    '4': 'Gold',
    '5': 'Platinum',
    '6': 'Diamond',
    '7': 'Master',
    '8': 'GM',
    '9': 'Challenger'
};

const POSITIONS = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

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

let fearlessState = {
    seriesType: 3,
    currentGame: 1,
    bannedChampions: new Set(),
    games: [],
    currentBans: [],
    currentPicks: [],
    selectedChampion: null,
    currentRole: 'ALL' // 현재 선택된 라인
};

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
    // 1. Data Dragon 데이터 먼저 로드
    await loadDataDragon();

    // 2. 챔피언 데이터 검증
    validateChampionList();

    // 3. 나머지 초기화
    initTabs();
    initTeamAssignment();
    initFearless();
    loadExampleData();
    loadFearlessFromStorage();
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

function initTeamAssignment() {
    document.getElementById('random-assign-btn').addEventListener('click', () => {
        const players = getPlayersFromInputs();
        if (!validatePlayers(players)) {
            alert('모든 플레이어의 닉네임을 입력해주세요!');
            return;
        }
        const teams = randomAssign(players);
        displayTeamResult(teams);
    });

    document.getElementById('balanced-assign-btn').addEventListener('click', () => {
        const players = getPlayersFromInputs();
        if (!validatePlayers(players)) {
            alert('모든 플레이어의 닉네임을 입력해주세요!');
            return;
        }
        const teams = balancedAssign(players);
        displayTeamResult(teams);
    });
}

function loadExampleData() {
    const examplePlayers = [
        { position: 'TOP', index: 0, name: 'TheShy', tier: '8' },
        { position: 'TOP', index: 1, name: 'Kiin', tier: '7' },
        { position: 'JUNGLE', index: 0, name: 'Canyon', tier: '9' },
        { position: 'JUNGLE', index: 1, name: 'Oner', tier: '8' },
        { position: 'MID', index: 0, name: 'Faker', tier: '9' },
        { position: 'MID', index: 1, name: 'Chovy', tier: '9' },
        { position: 'ADC', index: 0, name: 'Gumayusi', tier: '8' },
        { position: 'ADC', index: 1, name: 'Viper', tier: '8' },
        { position: 'SUPPORT', index: 0, name: 'Keria', tier: '9' },
        { position: 'SUPPORT', index: 1, name: 'Lehends', tier: '7' }
    ];

    examplePlayers.forEach(player => {
        const nameInput = document.querySelector(
            `.player-name[data-position="${player.position}"][data-index="${player.index}"]`
        );
        const tierSelect = document.querySelector(
            `.player-tier[data-position="${player.position}"][data-index="${player.index}"]`
        );
        if (nameInput) nameInput.value = player.name;
        if (tierSelect) tierSelect.value = player.tier;
    });
}

function getPlayersFromInputs() {
    const players = {};

    POSITIONS.forEach(position => {
        players[position] = [];
        for (let i = 0; i < 2; i++) {
            const nameInput = document.querySelector(
                `.player-name[data-position="${position}"][data-index="${i}"]`
            );
            const tierSelect = document.querySelector(
                `.player-tier[data-position="${position}"][data-index="${i}"]`
            );

            players[position].push({
                name: nameInput.value.trim(),
                tier: parseInt(tierSelect.value),
                position: position
            });
        }
    });

    return players;
}

function validatePlayers(players) {
    for (let position of POSITIONS) {
        for (let player of players[position]) {
            if (!player.name) return false;
        }
    }
    return true;
}

function randomAssign(players) {
    const blueTeam = [];
    const redTeam = [];

    POSITIONS.forEach(position => {
        const [p1, p2] = players[position];
        if (Math.random() < 0.5) {
            blueTeam.push(p1);
            redTeam.push(p2);
        } else {
            blueTeam.push(p2);
            redTeam.push(p1);
        }
    });

    return { blueTeam, redTeam };
}

function balancedAssign(players) {
    let bestAssignment = null;
    let bestScore = Infinity;

    for (let mask = 0; mask < 32; mask++) {
        const blueTeam = [];
        const redTeam = [];

        POSITIONS.forEach((position, idx) => {
            const [p1, p2] = players[position];
            if ((mask >> idx) & 1) {
                blueTeam.push(p1);
                redTeam.push(p2);
            } else {
                blueTeam.push(p2);
                redTeam.push(p1);
            }
        });

        const score = calculateBalanceScore(blueTeam, redTeam);

        if (score < bestScore) {
            bestScore = score;
            bestAssignment = { blueTeam, redTeam };
        }
    }

    return bestAssignment;
}

function calculateBalanceScore(blueTeam, redTeam) {
    const blueTotal = blueTeam.reduce((sum, p) => sum + p.tier, 0);
    const redTotal = redTeam.reduce((sum, p) => sum + p.tier, 0);
    const totalDiff = Math.abs(blueTotal - redTotal);

    let positionDiff = 0;
    POSITIONS.forEach((position, idx) => {
        const blueTier = blueTeam[idx].tier;
        const redTier = redTeam[idx].tier;
        positionDiff += Math.abs(blueTier - redTier);
    });

    return totalDiff * 10 + positionDiff;
}

function displayTeamResult(teams) {
    const { blueTeam, redTeam } = teams;

    const blueRoster = document.getElementById('blue-roster');
    blueRoster.innerHTML = '';
    blueTeam.forEach(player => {
        blueRoster.innerHTML += `
            <div class="roster-item">
                <span class="position">${player.position}</span>
                <span class="name">${player.name}</span>
                <span class="tier">${TIER_MAP[player.tier]}</span>
            </div>
        `;
    });

    const redRoster = document.getElementById('red-roster');
    redRoster.innerHTML = '';
    redTeam.forEach(player => {
        redRoster.innerHTML += `
            <div class="roster-item">
                <span class="position">${player.position}</span>
                <span class="name">${player.name}</span>
                <span class="tier">${TIER_MAP[player.tier]}</span>
            </div>
        `;
    });

    const blueScore = blueTeam.reduce((sum, p) => sum + p.tier, 0);
    const redScore = redTeam.reduce((sum, p) => sum + p.tier, 0);

    document.getElementById('blue-score').textContent = blueScore;
    document.getElementById('red-score').textContent = redScore;

    document.getElementById('team-result').style.display = 'block';
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
        currentRole: 'ALL'
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
            fearlessState.currentBans.includes(champion.nameKR) ||
            fearlessState.currentPicks.includes(champion.nameKR);

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

    const banBtn = document.createElement('button');
    banBtn.className = 'btn btn-danger';
    banBtn.textContent = 'BAN에 추가';
    banBtn.onclick = () => addToBan(championName);

    const pickBtn = document.createElement('button');
    pickBtn.className = 'btn btn-primary';
    pickBtn.textContent = 'PICK에 추가';
    pickBtn.onclick = () => addToPick(championName);

    actionsDiv.appendChild(banBtn);
    actionsDiv.appendChild(pickBtn);

    document.querySelector('.champion-selector').appendChild(actionsDiv);
}

function addToBan(championName) {
    if (!fearlessState.currentBans.includes(championName)) {
        fearlessState.currentBans.push(championName);
        fearlessState.selectedChampion = null;

        // 액션 버튼 제거
        const existingActions = document.querySelector('.champion-actions');
        if (existingActions) existingActions.remove();

        renderChampionList(document.getElementById('champion-search').value);
        updateFearlessUI();
        saveFearlessToStorage();
    }
}

function addToPick(championName) {
    if (!fearlessState.currentPicks.includes(championName)) {
        fearlessState.currentPicks.push(championName);
        fearlessState.selectedChampion = null;

        // 액션 버튼 제거
        const existingActions = document.querySelector('.champion-actions');
        if (existingActions) existingActions.remove();

        renderChampionList(document.getElementById('champion-search').value);
        updateFearlessUI();
        saveFearlessToStorage();
    }
}

function removeFromBan(championName) {
    fearlessState.currentBans = fearlessState.currentBans.filter(c => c !== championName);
    renderChampionList(document.getElementById('champion-search').value);
    updateFearlessUI();
    saveFearlessToStorage();
}

function removeFromPick(championName) {
    fearlessState.currentPicks = fearlessState.currentPicks.filter(c => c !== championName);
    renderChampionList(document.getElementById('champion-search').value);
    updateFearlessUI();
    saveFearlessToStorage();
}

function updateFearlessUI() {
    document.getElementById('current-game').textContent = `Game ${fearlessState.currentGame}`;
    document.getElementById('banned-count').textContent = fearlessState.bannedChampions.size;

    // 현재 BAN 목록
    const currentBansDiv = document.getElementById('current-bans');
    currentBansDiv.innerHTML = '';
    fearlessState.currentBans.forEach(championName => {
        const tag = document.createElement('div');
        tag.className = 'champion-tag ban';
        tag.innerHTML = `
            ${championName}
            <button class="remove-btn" onclick="removeFromBan('${championName}')">×</button>
        `;
        currentBansDiv.appendChild(tag);
    });

    // 현재 PICK 목록
    const currentPicksDiv = document.getElementById('current-picks');
    currentPicksDiv.innerHTML = '';
    fearlessState.currentPicks.forEach(championName => {
        const tag = document.createElement('div');
        tag.className = 'champion-tag pick';
        tag.innerHTML = `
            ${championName}
            <button class="remove-btn" onclick="removeFromPick('${championName}')">×</button>
        `;
        currentPicksDiv.appendChild(tag);
    });

    // 게임 히스토리 표시 (경고 없이)
    displayGameHistory();
}

function confirmGame() {
    if (fearlessState.currentBans.length === 0 && fearlessState.currentPicks.length === 0) {
        alert('최소 1개 이상의 챔피언을 BAN 또는 PICK해주세요!');
        return;
    }

    const gameRecord = {
        gameNum: fearlessState.currentGame,
        bans: [...fearlessState.currentBans],
        picks: [...fearlessState.currentPicks]
    };

    fearlessState.games.push(gameRecord);

    fearlessState.currentBans.forEach(champ => fearlessState.bannedChampions.add(champ));
    fearlessState.currentPicks.forEach(champ => fearlessState.bannedChampions.add(champ));

    if (fearlessState.currentGame >= fearlessState.seriesType) {
        alert(`Bo${fearlessState.seriesType} 시리즈가 완료되었습니다!`);
    } else {
        fearlessState.currentGame++;
        fearlessState.currentBans = [];
        fearlessState.currentPicks = [];
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

    const historyHtml = fearlessState.games.map(game => `
        <div class="history-item">
            <h4>Game ${game.gameNum}</h4>
            <p><strong>BAN:</strong> ${game.bans.join(', ') || '없음'}</p>
            <p><strong>PICK:</strong> ${game.picks.join(', ') || '없음'}</p>
        </div>
    `).join('');

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
            currentRole: data.currentRole || 'ALL'
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

// 전역 함수로 노출
window.removeFromBan = removeFromBan;
window.removeFromPick = removeFromPick;
