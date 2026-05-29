const NUM_PITS_PER_PLAYER = 9;
const TOTAL_PITS = NUM_PITS_PER_PLAYER * 2;
const INITIAL_STONES = 9;
const TARGET_SCORE = 82;
let SOW_DELAY = Number(localStorage.getItem('toguz_animation_speed')) || 200;

let pits = new Array(TOTAL_PITS).fill(INITIAL_STONES);
let storeA = 0;
let storeB = 0;
let tuzA = -1;
let tuzB = -1;

let currentPlayer = 'A';
let isAnimating = false;
let isGameOver = false;
let soundEnabled = true;
let aiEnabled = true;

let aiDifficulty = localStorage.getItem('toguz_ai_difficulty') || 'normal';

let moveHistory = [];
let moveCounter = 0;

const rowTop = document.getElementById('row-top');
const rowBottom = document.getElementById('row-bottom');

const storeAStonesEl = document.getElementById('storeAStones');
const storeBStonesEl = document.getElementById('storeBStones');
const storeACountEl = document.getElementById('storeACount');
const storeBCountEl = document.getElementById('storeBCount');

const scoreAEl = document.getElementById('scoreA');
const scoreBEl = document.getElementById('scoreB');

const statusEl = document.getElementById('status');

const moveTimerEl = document.getElementById('moveTimer');

let savedTimer =
    localStorage.getItem('toguz_move_timer');

let moveTimerLimit =
    savedTimer === null
        ? 0
        : Number(savedTimer);

let moveTimerInterval = null;
let moveTimeLeft = moveTimerLimit;

const aiBtn = document.getElementById('aiBtn');
const settingsBtn = document.getElementById('settingsBtn');

const historyListEl = document.getElementById('historyList');

const historyContainerEl = document.getElementById('historyContainer');
const historyToggleEl = document.getElementById('historyToggle');

const pitNumbersToggleEl =
    document.getElementById('pitNumbersToggle');

let pitNumbersVisible =
    localStorage.getItem('toguz_pit_numbers');

pitNumbersVisible =
    pitNumbersVisible === null
        ? true
        : pitNumbersVisible === '1';

let historyVisible = localStorage.getItem('toguz_history_visible');
historyVisible = historyVisible === null ? true : historyVisible === '1';

const splashEl = document.getElementById('splash');

const settingsOverlayEl = document.getElementById('settingsOverlay');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const soundToggleEl = document.getElementById('soundToggle');
const volumeSliderEl = document.getElementById('volumeSlider');


let masterVolume =
    Number(localStorage.getItem('toguz_master_volume'));

if (Number.isNaN(masterVolume)) {
    masterVolume = 0.7;
}

const fullscreenBtn =
    document.getElementById('fullscreenBtnMain');
    
const mainMenuBtn =
    document.getElementById('mainMenuBtn');

const resetCameraBtn =
    document.getElementById('resetCameraBtnMain');

const demoWinBtn =
    document.getElementById('demoWinBtn');

const demoLoseBtn =
    document.getElementById('demoLoseBtn');

const pitEls = new Array(TOTAL_PITS);
const pitStoneContainers = new Array(TOTAL_PITS);
const pitCountEls = new Array(TOTAL_PITS);
const pitNumberEls = new Array(TOTAL_PITS);

let audioCtx = null;

function ensureAudioCtx() {
    if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtx = new Ctx();
    }
}

function playBeep(freq = 800, duration = 0.05, volume = 0.04) {
    if (!soundEnabled) return;
    ensureAudioCtx();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.frequency.value = freq;
    gain.gain.value = volume * masterVolume;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSowSound() {
    playBeep(900, 0.04, 0.03);
}

// ===== UI SOUNDS =====

function playHoverSound() {
    if (!soundEnabled) return;

    playBeep(1200, 0.015, 0.015);
}

function playButtonClickSound() {
    if (!soundEnabled) return;

    playBeep(700, 0.03, 0.03);
}

function playPopupOpenSound() {
    if (!soundEnabled) return;

    playBeep(520, 0.05, 0.05);
}

function playPopupCloseSound() {
    if (!soundEnabled) return;

    playBeep(420, 0.04, 0.04);
}

function playWinSound() {

    if (!soundEnabled) return;

    playBeep(900, 0.05, 0.04);

    setTimeout(() => {
        playBeep(1200, 0.07, 0.05);
    }, 80);

    setTimeout(() => {
        playBeep(1600, 0.10, 0.06);
    }, 160);

    setTimeout(() => {
        playBeep(2100, 0.14, 0.07);
    }, 260);
}

function playLoseSound() {

    if (!soundEnabled) return;

    playBeep(500, 0.08, 0.05);

    setTimeout(() => {
        playBeep(320, 0.12, 0.06);
    }, 120);

    setTimeout(() => {
        playBeep(180, 0.18, 0.08);
    }, 240);
}

function playCaptureSound() {
    playBeep(400, 0.09, 0.05);
}

function ownerOfPit(index) {
    return index < NUM_PITS_PER_PLAYER ? 'A' : 'B';
}

function pitNumberForIndex(index) {
    if (index < NUM_PITS_PER_PLAYER) return index + 1;
    return index - NUM_PITS_PER_PLAYER + 1;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setStatus(text) {
    statusEl.textContent = text;
}

function getCurrentGameState() {
    return {
        pits: [...pits],
        storeA,
        storeB,
        tuzA,
        tuzB,
        currentPlayer,
        isGameOver
    };
}

function isOpponentsPit(player, index) {
    return ownerOfPit(index) !== player;
}

function isOpponentTuz(player, index) {
    return player === 'A' ? index === tuzB : index === tuzA;
}

function isOpponentNinthPit(opponent, index) {
    if (opponent === 'A') return index === 8;
    return index === 17;
}

function isOppositeToOpponentTuz(player, index) {
    if (player === 'A' && tuzB !== -1) {
        return index === tuzB + NUM_PITS_PER_PLAYER;
    }
    if (player === 'B' && tuzA !== -1) {
        return index === tuzA - NUM_PITS_PER_PLAYER;
    }
    return false;
}

function playerHasTuz(player) {
    return player === 'A' ? tuzA !== -1 : tuzB !== -1;
}

function giveToKazan(player, stones) {
    if (player === 'A') storeA += stones;
    else storeB += stones;
}

function createPitElement(index, owner) {
    const pit = document.createElement('div');
    pit.classList.add('pit');
    pit.dataset.index = index;
    pit.classList.add(owner === 'A' ? 'pit-bottom' : 'pit-top');

    const stonesContainer = document.createElement('div');
    stonesContainer.classList.add('stones-container');

    const countSpan = document.createElement('div');
    countSpan.classList.add('stone-count');

    const numSpan = document.createElement('div');
    numSpan.classList.add('pit-number');
    numSpan.textContent = pitNumberForIndex(index);

    pit.appendChild(stonesContainer);
    pit.appendChild(countSpan);
    pit.appendChild(numSpan);

    pit.addEventListener('click', () => {
        handlePitClick(index);
    });

    pitEls[index] = pit;
    pitStoneContainers[index] = stonesContainer;
    pitCountEls[index] = countSpan;
    pitNumberEls[index] = numSpan;

    return pit;
}

function buildBoard() {
    rowTop.innerHTML = '';
    for (let i = NUM_PITS_PER_PLAYER - 1; i >= 0; i--) {
        const index = NUM_PITS_PER_PLAYER + i;
        rowTop.appendChild(createPitElement(index, 'B'));
    }

    rowBottom.innerHTML = '';
    for (let i = 0; i < NUM_PITS_PER_PLAYER; i++) {
        rowBottom.appendChild(createPitElement(i, 'A'));
    }
}

function renderPits() {
    for (let i = 0; i < TOTAL_PITS; i++) {
        const stones = pits[i];
        const container = pitStoneContainers[i];
        const countEl = pitCountEls[i];
        const pitEl = pitEls[i];
        if (!container || !countEl || !pitEl) continue;

        container.innerHTML = '';
        const maxVisual = Math.min(stones, 40);

        for (let s = 0; s < maxVisual; s++) {
            const stone = document.createElement('div');
            stone.classList.add('stone');
            container.appendChild(stone);
        }

        countEl.textContent = stones;
        pitEl.classList.toggle('tuz', i === tuzA || i === tuzB);
    }
}

function renderStores() {
    storeAStonesEl.innerHTML = '';
    storeBStonesEl.innerHTML = '';

    const maxVisualA = Math.min(storeA, 80);
    const maxVisualB = Math.min(storeB, 80);

    for (let i = 0; i < maxVisualA; i++) {
        const stone = document.createElement('div');
        stone.classList.add('stone');
        storeAStonesEl.appendChild(stone);
    }

    for (let i = 0; i < maxVisualB; i++) {
        const stone = document.createElement('div');
        stone.classList.add('stone');
        storeBStonesEl.appendChild(stone);
    }

    storeACountEl.textContent = storeA;
    storeBCountEl.textContent = storeB;

    // Top score texts removed from page.
    // Store counts are shown inside kazans in 3D.
}

function renderHistory() {
    historyListEl.innerHTML = '';
    for (const entry of moveHistory) {
        const div = document.createElement('div');
        div.classList.add('history-entry');
        div.textContent =
            currentLanguage === 'ky'
                ? `${entry.num}. Оюнчу ${entry.player} – оюк ${entry.pit} ` +
                `(таш ${entry.stonesMoved} → жүрүш ${entry.steps}, ` +
                `акыркы: ${entry.lastPit}, алды ${entry.captured}, ` +
                `A:${entry.storeA}, B:${entry.storeB})`
                : `${entry.num}. Player ${entry.player} – pit ${entry.pit} ` +
                `(stones ${entry.stonesMoved} → moved ${entry.steps}, ` +
                `last: ${entry.lastPit}, captured ${entry.captured}, ` +
                `A:${entry.storeA}, B:${entry.storeB})`;
        historyListEl.appendChild(div);
    }
    historyListEl.scrollTop = historyListEl.scrollHeight;
}

function notify3D() {
    if (typeof window.sync3DBoardFromGameState === 'function') {
        window.sync3DBoardFromGameState({
            pits: [...pits],
            storeA,
            storeB,
            tuzA,
            tuzB,
            currentPlayer,
            isGameOver
        });
    }
}

function renderAll() {
    renderPits();
    renderStores();
    renderHistory();
    notify3D();
}

function resetGame() {
    pits = new Array(TOTAL_PITS).fill(INITIAL_STONES);
    storeA = 0;
    storeB = 0;
    tuzA = -1;
    tuzB = -1;
    currentPlayer = 'A';
    isAnimating = false;
    isGameOver = false;
    moveHistory = [];
    moveCounter = 0;

    setStatus(t('newStatus'));
    renderAll();
    startMoveTimer();
}

function startMoveTimer() {
    clearInterval(moveTimerInterval);

    if (!moveTimerEl || isGameOver || currentPlayer !== 'A' || moveTimerLimit === 0) {
        if (moveTimerEl) moveTimerEl.classList.add('hidden');
        return;
    }

    moveTimeLeft = moveTimerLimit;
    moveTimerEl.textContent = moveTimeLeft;
    moveTimerEl.classList.remove('hidden', 'danger');

    moveTimerInterval = setInterval(() => {
        if (isGameOver || currentPlayer !== 'A' || isAnimating) {
            clearInterval(moveTimerInterval);
            return;
        }

        moveTimeLeft--;
        moveTimerEl.textContent = moveTimeLeft;

        moveTimerEl.classList.toggle('danger', moveTimeLeft <= 5);

        if (moveTimeLeft <= 0) {
            clearInterval(moveTimerInterval);
            playerTimeOut();
        }
    }, 1000);
}

function stopMoveTimer() {
    clearInterval(moveTimerInterval);

    if (moveTimerEl) {
        moveTimerEl.classList.add('hidden');
        moveTimerEl.classList.remove('danger');
    }
}

function playerTimeOut() {
    if (isGameOver) return;

    isGameOver = true;
    storeB = TARGET_SCORE;
    setStatus('TIME IS UP — You lose');

    stopMoveTimer();
    renderAll();

    setTimeout(() => {
        showGameResult('TIME IS UP — You lose');
    }, 500);
}

function handlePitClick(index) {
    if (isGameOver || isAnimating) return;
    if (currentPlayer !== 'A') return;
    if (ownerOfPit(index) !== 'A') return;
    if (pits[index] === 0) return;

    performMove(index, 'A', true);
}

async function performMove(startIndex, player, addToHistory) {
    if (isGameOver || isAnimating) return;

    isAnimating = true;

    if (player === 'A') {
        stopMoveTimer();
    }

    const stones = pits[startIndex];
    if (stones === 0) {
        isAnimating = false;
        return;
    }

    const leavingOne = stones > 1;
    let stonesToSow = leavingOne ? stones - 1 : stones;

    pits[startIndex] = leavingOne ? 1 : 0;
    renderAll();

    let pos = startIndex;
    let steps = 0;
    let captured = 0;

    while (stonesToSow > 0) {
        pos = (pos + 1) % TOTAL_PITS;

        if (pos === tuzA) {
            storeA++;
            playSowSound();
        } else if (pos === tuzB) {
            storeB++;
            playSowSound();
        } else {
            pits[pos]++;
            playSowSound();
        }

        renderAll();
        await delay(SOW_DELAY);

        stonesToSow--;
        steps++;
    }

    const lastPit = pos;

    if (!isGameOver && isOpponentsPit(player, lastPit) && !isOpponentTuz(player, lastPit)) {
        const opponent = player === 'A' ? 'B' : 'A';
        const stonesInLast = pits[lastPit];

        if (stonesInLast > 0) {
            const canMakeTuz =
                !playerHasTuz(player) &&
                stonesInLast === 3 &&
                !isOpponentNinthPit(opponent, lastPit) &&
                !isOppositeToOpponentTuz(player, lastPit);

            if (canMakeTuz) {
                if (player === 'A') tuzA = lastPit;
                else tuzB = lastPit;

                giveToKazan(player, stonesInLast);
                captured += stonesInLast;
                pits[lastPit] = 0;
                playCaptureSound();
            } else if (stonesInLast % 2 === 0) {
                giveToKazan(player, stonesInLast);
                captured += stonesInLast;
                pits[lastPit] = 0;
                playCaptureSound();
            }
        }
    }

    if (addToHistory) {
        moveCounter++;
        moveHistory.push({
            num: moveCounter,
            player,
            pit: pitNumberForIndex(startIndex),
            stonesMoved: stones,
            steps,
            lastPit: `${ownerOfPit(lastPit)}${pitNumberForIndex(lastPit)}`,
            captured,
            storeA,
            storeB
        });
    }

    renderAll();

    if (storeA >= TARGET_SCORE || storeB >= TARGET_SCORE || boardEmpty()) {
        finalizeGame();
        isAnimating = false;
        return;
    }

    currentPlayer = player === 'A' ? 'B' : 'A';
    setStatus(
        currentPlayer === 'A'
            ? t('yourTurn')
            : t('opponentTurn')
    );
    isAnimating = false;
    notify3D();

    if (currentPlayer === 'A') {
        startMoveTimer();
    }

    if (!isGameOver && currentPlayer === 'B' && aiEnabled) {
        setTimeout(aiMove, 500);
    }
}

function boardEmpty() {
    let sumA = 0;
    let sumB = 0;

    for (let i = 0; i < TOTAL_PITS; i++) {
        if (ownerOfPit(i) === 'A') sumA += pits[i];
        else sumB += pits[i];
    }

    return sumA === 0 || sumB === 0;
}

function finalizeGame() {
    for (let i = 0; i < TOTAL_PITS; i++) {
        const owner = ownerOfPit(i);
        if (pits[i] > 0) {
            if (owner === 'A') storeA += pits[i];
            else storeB += pits[i];
            pits[i] = 0;
        }
    }

    isGameOver = true;
        stopMoveTimer();
    renderAll();

    let message;
    if (storeA > storeB) {
        message = `Game over! You win (${storeA} : ${storeB})`;
    } else if (storeB > storeA) {
        message = `Game over! Opponent wins (${storeB} : ${storeA})`;
    } else {
        message = `Game over! Draw (${storeA} : ${storeB})`;
    }

    setStatus(message);

    setTimeout(() => {
        showGameResult(message);
    }, 600);
}

function aiMove() {
    if (isGameOver || isAnimating || currentPlayer !== 'B') return;

    const validMoves = [];

    for (let col = 0; col < NUM_PITS_PER_PLAYER; col++) {
        const index = NUM_PITS_PER_PLAYER + col;

        if (pits[index] > 0) {
            validMoves.push(index);
        }
    }

    if (validMoves.length === 0) return;

    let selectedMove = validMoves[0];

    // ---------------- BEGINNER ----------------
    if (aiDifficulty === 'beginner') {

        selectedMove =
            validMoves[Math.floor(Math.random() * validMoves.length)];

    }

    // ---------------- NORMAL ----------------
    else if (aiDifficulty === 'normal') {

        let bestCapture = -1;

        for (const index of validMoves) {
            const captured = simulateCapture(index, 'B');

            if (captured > bestCapture) {
                bestCapture = captured;
                selectedMove = index;
            }
        }

    }

    // ---------------- EXPERT ----------------
    else if (aiDifficulty === 'expert') {

        let bestScore = -999999;

        for (const index of validMoves) {

            const captured = simulateCapture(index, 'B');

            let score = captured * 100;

            // Prefer larger pits
            score += pits[index] * 3;

            // Prefer center pits slightly
            const centerBias =
                4 - Math.abs((index - NUM_PITS_PER_PLAYER) - 4);

            score += centerBias;

            // Avoid emptying strong positions too early
            if (pits[index] <= 1) {
                score -= 5;
            }

            if (score > bestScore) {
                bestScore = score;
                selectedMove = index;
            }
        }
    }

    performMove(selectedMove, 'B', true);
}

function simulateCapture(startIndex, player) {
    const pitsCopy = pits.slice();
    const tuzACopy = tuzA;
    const tuzBCopy = tuzB;

    let stones = pitsCopy[startIndex];
    if (stones === 0) return -1;

    const leavingOne = stones > 1;
    let stonesToSow = leavingOne ? stones - 1 : stones;
    pitsCopy[startIndex] = leavingOne ? 1 : 0;

    let pos = startIndex;

    while (stonesToSow > 0) {
        pos = (pos + 1) % TOTAL_PITS;
        if (pos !== tuzACopy && pos !== tuzBCopy) {
            pitsCopy[pos]++;
        }
        stonesToSow--;
    }

    const lastPit = pos;
    let captured = 0;

    const opponent = player === 'A' ? 'B' : 'A';
    const isOppPit = ownerOfPit(lastPit) === opponent;
    const isTuzPit = lastPit === tuzACopy || lastPit === tuzBCopy;

    if (isOppPit && !isTuzPit) {
        const stonesInLast = pitsCopy[lastPit];

        if (stonesInLast > 0) {
            const playerHasTuzCopy = player === 'A' ? tuzACopy !== -1 : tuzBCopy !== -1;
            const isNinthPitCopy = isOpponentNinthPit(opponent, lastPit);

            const isOppositeToTuzCopy =
                (player === 'A' && tuzBCopy !== -1 && lastPit === tuzBCopy + NUM_PITS_PER_PLAYER) ||
                (player === 'B' && tuzACopy !== -1 && lastPit === tuzACopy - NUM_PITS_PER_PLAYER);

            const canMakeTuzCopy =
                !playerHasTuzCopy &&
                stonesInLast === 3 &&
                !isNinthPitCopy &&
                !isOppositeToTuzCopy;

            if (canMakeTuzCopy) {
                captured = stonesInLast;
            } else if (stonesInLast % 2 === 0) {
                captured = stonesInLast;
            }
        }
    }

    return captured;
}

let currentLanguage =
    localStorage.getItem('toguz_language') || 'en';

const translations = {
    en: {
        newGame: 'New Game',
        resetCamera: 'Reset Camera',
        fullscreen: 'Fullscreen Mode',
        settings: 'Settings ⚙',
        history: 'Move History',
        startStatus: 'Click "Start Game" to begin',
        newStatus: 'New game started – You begin',
        yourTurn: 'Your turn',
        opponentTurn: "Opponent's turn",
        win: 'YOU WIN!',
        lose: 'YOU LOSE!',
        draw: 'DRAW',
        you: 'You',
        opponent: 'Opponent',
        sound: 'Sound',
        enableSounds: 'Enable sounds',
        volume: 'Sound volume',
        boardNumbers: 'Board Numbers',
        showPitNumbers: 'Show pit numbers',
        moveHistory: 'Move History',
        showMoveHistory: 'Show move history',
        timer: 'Player Move Timer',
        noTimer: 'No Timer',
        animationSpeed: 'Animation Speed',
        slow: 'Slow',
        normal: 'Normal',
        fast: 'Fast',
        aiDifficulty: 'AI Difficulty',
        beginner: 'Beginner',
        expert: 'Expert',
        language: 'Language',
        startGame: 'Start Game',
        learnRules: 'Learn The Rules',
        playAgain: 'PLAY AGAIN',
        restartGame: 'RESTART GAME?',
        restartConfirm: 'ARE YOU SURE YOU WANT TO RESTART THE CURRENT MATCH?',
        cancel: 'CANCEL',
        restart: 'RESTART',
        introText: 'OUTSMART YOUR OPPONENT IN THIS ANCIENT KYRGYZ STRATEGY GAME. EVERY MOVE MATTERS. EVERY TURN TELLS A STORY.',
        fullscreenExit: 'EXIT FULLSCREEN',
        mainTitle: 'TOGUZ KORGOOL',
        oneMin: '1 MIN',
        twoMin: '2 MIN',
        fiveMin: '5 MIN',
        mainMenu: 'Main Menu'
    },

    ky: {
        newGame: 'Жаңы оюн',
        resetCamera: 'Камераны кайтаруу',
        fullscreen: 'Толук экран',
        settings: 'Жөндөөлөр ⚙',
        history: 'Жүрүш тарыхы',
        startStatus: 'Оюнду баштоо үчүн "Start Game" басыңыз',
        newStatus: 'Жаңы оюн башталды – сиз баштайсыз',
        yourTurn: 'Сиздин жүрүш',
        opponentTurn: 'Каршылаштын жүрүшү',
        win: 'СИЗ ЖЕҢДИҢИЗ!',
        lose: 'СИЗ УТУЛДУҢУЗ!',
        draw: 'ТЕҢ ЧЫГУУ',
        you: 'Сиз',
        opponent: 'Каршылаш',
        sound: 'Үн',
        enableSounds: 'Үндү күйгүзүү',
        volume: 'Үндүн деңгээли',
        boardNumbers: 'Такта номерлери',
        showPitNumbers: 'Оюк номерлерин көрсөтүү',
        moveHistory: 'Жүрүш тарыхы',
        showMoveHistory: 'Жүрүш тарыхын көрсөтүү',
        timer: 'Оюнчу убактысы',
        noTimer: 'Убакыт жок',
        animationSpeed: 'Анимация ылдамдыгы',
        slow: 'Жай',
        normal: 'Орточо',
        fast: 'Тез',
        aiDifficulty: 'AI деңгээли',
        beginner: 'Башталгыч',
        expert: 'Күчтүү',
        language: 'Тил',
        startGame: 'Оюнду баштоо',
        learnRules: 'Эрежелерди үйрөнүү',
        playAgain: 'КАЙРА ОЙНОО',
        restartGame: 'ОЮНДУ КАЙРА БАШТАЙСЫЗБЫ?',
        restartConfirm: 'Учурдагы оюнду кайра баштоону каалайсызбы?',
        cancel: 'ЖАБУУ',
        restart: 'КАЙРА БАШТОО',
        introText: 'БУЛ БАЙЫРКЫ КЫРГЫЗ СТРАТЕГИЯ ОЮНУНДА АТААНДАШЫҢЫЗДЫ ЖЕҢИҢИЗ. АР БИР ЖҮРҮШ МААНИЛҮҮ.',
        fullscreenExit: 'ТОЛУК ЭКРАНДАН ЧЫГУУ',
        mainTitle: 'ТОГУЗ КОРГООЛ',
        oneMin: '1 МҮНӨТ',
        twoMin: '2 МҮНӨТ',
        fiveMin: '5 МҮНӨТ',
        mainMenu: 'Башкы меню',
    }
};

function t(key) {
    return translations[currentLanguage][key] || translations.en[key];
}

window.getLanguageLabels = function () {
    return {
        you: t('you'),
        opponent: t('opponent')
    };
};

function applyLanguage() {
    aiBtn.textContent = t('newGame');
    resetCameraBtn.textContent = t('resetCamera');
    fullscreenBtn.textContent =
        document.fullscreenElement
            ? t('fullscreenExit')
            : t('fullscreen');
    settingsBtn.textContent = t('settings');

    const mainMenuBtnEl =
        document.getElementById('mainMenuBtn');

    if (mainMenuBtnEl) {
        mainMenuBtnEl.textContent =
            t('mainMenu');
    }

    const historyTitle = document.querySelector('.history-title');
    if (historyTitle) historyTitle.textContent = t('moveHistory');

    const splashStartBtn = document.getElementById('splashStartBtn');
    if (splashStartBtn) splashStartBtn.textContent = '▶ ' + t('startGame');

    const rulesBtn = document.querySelector('.intro-rules-btn span:last-child');
    if (rulesBtn) rulesBtn.textContent = t('learnRules');

    const mainTitle =
        document.querySelector('.game-title');

    if (mainTitle) {
        mainTitle.textContent = t('mainTitle');
    }

    const settingsSections = document.querySelectorAll('.settings-section h3');
    if (settingsSections[0]) settingsSections[0].textContent = t('sound');
    if (settingsSections[1]) settingsSections[1].textContent = t('language');
    if (settingsSections[2]) settingsSections[2].textContent = t('boardNumbers');
    if (settingsSections[3]) settingsSections[3].textContent = t('moveHistory');
    if (settingsSections[4]) settingsSections[4].textContent = t('timer');
    if (settingsSections[5]) settingsSections[5].textContent = t('animationSpeed');
    if (settingsSections[6]) settingsSections[6].textContent = t('aiDifficulty');

    const soundLabel = document.querySelector('label[for="volumeSlider"]');
    if (soundLabel) soundLabel.textContent = t('volume');

    const toggles = document.querySelectorAll('.toggle');
    if (toggles[0]) toggles[0].lastChild.textContent = ' ' + t('enableSounds');
    if (toggles[1]) toggles[1].lastChild.textContent = ' ' + t('showPitNumbers');
    if (toggles[2]) toggles[2].lastChild.textContent = ' ' + t('showMoveHistory');

    const timerBtns = document.querySelectorAll('.timer-btn');

    if (timerBtns[0]) timerBtns[0].textContent = t('noTimer');
    if (timerBtns[1]) timerBtns[1].textContent = '30 SEC';
    if (timerBtns[2]) timerBtns[2].textContent = t('oneMin');
    if (timerBtns[3]) timerBtns[3].textContent = t('twoMin');
    if (timerBtns[4]) timerBtns[4].textContent = t('fiveMin');

    const speedBtns = document.querySelectorAll('.speed-btn');
    if (speedBtns[0]) speedBtns[0].textContent = t('slow');
    if (speedBtns[1]) speedBtns[1].textContent = t('normal');
    if (speedBtns[2]) speedBtns[2].textContent = t('fast');

    const introParagraph =
        document.querySelector('.intro-description');

    if (introParagraph) {
        introParagraph.textContent = t('introText');
    }

    const playAgainBtn =
        document.querySelector('.result-btn');

    if (playAgainBtn) {
        playAgainBtn.textContent = t('playAgain');
    }

    const restartTitle =
    document.querySelector('.restart-confirm-box h2');

    if (restartTitle) {
        restartTitle.textContent = t('restartGame');
    }

    const restartText =
        document.querySelector('.restart-confirm-box p');

    if (restartText) {
        restartText.textContent = t('restartConfirm');
    }

    if (restartCancelBtn) {
        restartCancelBtn.textContent = t('cancel');
    }

    if (restartConfirmBtn) {
        restartConfirmBtn.textContent = t('restart');
    }

    const introTitle = document.querySelector('.intro-title');
    if (introTitle) {
        introTitle.innerHTML =
            currentLanguage === 'ky'
                ? 'Тогуз<br>Коргоол'
                : 'Toguz<br>Korgool';
    }

    const introTopline = document.querySelector('.intro-topline');
    if (introTopline) {
        introTopline.textContent =
            currentLanguage === 'ky'
                ? 'Акылмандыктын байыркы оюну'
                : 'A legendary game of wisdom';
    }

    const introDividerText = document.querySelector('.intro-divider p');
    if (introDividerText) {
        introDividerText.textContent =
            currentLanguage === 'ky'
                ? 'Ойлон • Ут • Жең'
                : 'Plan • Capture • Win';
    }

    const introTagline = document.querySelector('.intro-tagline');
    if (introTagline) {
        introTagline.textContent = t('introText');
    }

    const rulesTitle = document.querySelector('.rules-header h2');
    const rulesBody = document.querySelector('.rules-body');

    if (rulesTitle && rulesBody) {
        if (currentLanguage === 'ky') {
            rulesTitle.textContent = 'Тогуз Коргоолду кантип ойнойт';

            rulesBody.innerHTML = `
                <h3>Максат</h3>
                <p>Компьютерге караганда көбүрөөк таш топтоо. Биринчи болуп 82 ташка жеткен оюнчу жеңет.</p>

                <h3>Тактанын түзүлүшү</h3>
                <p>Тактада жалпы 18 оюк бар: ар бир оюнчуда 9 оюк. Ар бир оюк 9 таш менен башталат. Ар бир оюнчуда топтолгон таштар үчүн казан бар.</p>

                <h3>Оюнчулар</h3>
                <p>Сиз Player A катары ойнойсуз. Компьютер Player B катары ойнойт. Оюнду дайыма сиз баштайсыз.</p>

                <h3>Жүрүш кантип жасалат</h3>
                <p>Өз оюгуңузду тандаңыз. Эгер оюкта 1 гана таш болсо, ал кийинки оюкка жылат. Эгер таш бирден көп болсо, бир таш ошол оюкта калат, калган таштар такта боюнча бирден таратылат.</p>

                <h3>Таштарды алуу</h3>
                <p>Эгер акыркы таш атаандаштын оюгуна түшүп, ал оюктагы таштардын саны жуп болсо, ошол таштар сиздин казанга өтөт.</p>

                <h3>Туз / Сөөл эрежеси</h3>
                <p>Эгер акыркы таш атаандаштын оюгуна түшүп, ал жерде так 3 таш болсо, ал оюк сиздин тузуңуз боло алат. Тузга түшкөн таштар автоматтык түрдө казанга өтөт.</p>

                <h3>Жеңиш</h3>
                <p>Оюн бир оюнчу 82 же андан көп таш топтогондо, же бир тарапта таш калбай калганда бүтөт. Көп таш топтогон оюнчу жеңет.</p>
            `;
        } else {
            rulesTitle.textContent = 'How to Play Toguz Korgool';

            rulesBody.innerHTML = `
                <h3>Goal</h3>
                <p>Collect more stones than the computer. The first player to reach 82 stones wins.</p>

                <h3>Board Setup</h3>
                <p>The board has 18 pits in total: 9 pits for each player. Each pit starts with 9 stones. Each player also has a kazan, which stores captured stones.</p>

                <h3>Players</h3>
                <p>You play as Player A. The computer plays as Player B. You always start the game first.</p>

                <h3>How a Turn Works</h3>
                <p>On your turn, choose one of your own pits. If the selected pit has only 1 stone, that stone moves to the next pit. If the selected pit has more than 1 stone, one stone stays in the selected pit and the remaining stones are sown one by one counter-clockwise around the board.</p>

                <h3>Capturing Stones</h3>
                <p>If your last stone lands in one of the opponent’s pits and the total number of stones in that pit becomes even, all stones from that pit are captured and moved to your kazan.</p>

                <h3>Tuz / Sool Rule</h3>
                <p>If your last stone lands in an opponent’s pit and that pit becomes exactly 3 stones, that pit can become your tuz.</p>

                <h3>Winning the Game</h3>
                <p>The game ends when one player reaches 82 or more stones in their kazan. The player with more stones wins.</p>
            `;
        }
    }

    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    if (difficultyBtns[0]) difficultyBtns[0].textContent = t('beginner');
    if (difficultyBtns[1]) difficultyBtns[1].textContent = t('normal');
    if (difficultyBtns[2]) difficultyBtns[2].textContent = t('expert');

    renderHistory();
    notify3D();

    if (!isGameOver) {
        setStatus(t('startStatus'));
    }
}

function initSettings() {
    const saved = localStorage.getItem('toguz_sound');
    if (saved !== null) {
        soundEnabled = saved === '1';
    }

    soundToggleEl.checked = soundEnabled;

        if (volumeSliderEl) {
            volumeSliderEl.value = Math.round(masterVolume * 100);

            volumeSliderEl.addEventListener('input', () => {
                masterVolume = Number(volumeSliderEl.value) / 100;
                localStorage.setItem('toguz_master_volume', masterVolume);
            });
        }

        if (historyToggleEl && historyContainerEl) {
            historyToggleEl.checked = historyVisible;
            historyContainerEl.classList.toggle('hidden', !historyVisible);

            historyToggleEl.addEventListener('change', () => {
                historyVisible = historyToggleEl.checked;
                localStorage.setItem('toguz_history_visible', historyVisible ? '1' : '0');
                historyContainerEl.classList.toggle('hidden', !historyVisible);
            });
        }

        if (pitNumbersToggleEl) {

            pitNumbersToggleEl.checked =
                pitNumbersVisible;

            if (typeof window.setPitNumbersVisibility === 'function') {

                window.setPitNumbersVisibility(
                    pitNumbersVisible
                );
            }

            pitNumbersToggleEl.addEventListener('change', () => {

                pitNumbersVisible =
                    pitNumbersToggleEl.checked;

                localStorage.setItem(
                    'toguz_pit_numbers',
                    pitNumbersVisible ? '1' : '0'
                );

                if (typeof window.setPitNumbersVisibility === 'function') {

                    window.setPitNumbersVisibility(
                        pitNumbersVisible
                    );
                }

            });
        }

        const speedButtons = document.querySelectorAll('.speed-btn');

        speedButtons.forEach((button) => {
            if (Number(button.dataset.speed) === SOW_DELAY) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }

            button.addEventListener('click', () => {
                speedButtons.forEach((btn) => {
                    btn.classList.remove('active');
                });

                button.classList.add('active');

                SOW_DELAY = Number(button.dataset.speed);
                localStorage.setItem('toguz_animation_speed', SOW_DELAY);
            });
        });

        const timerButtons =
            document.querySelectorAll('.timer-btn');

        timerButtons.forEach((button) => {

            const buttonTime = Number(button.dataset.time);

            button.classList.remove('active');

            if (buttonTime === moveTimerLimit) {
                button.classList.add('active');
            }

            button.addEventListener('click', () => {

                timerButtons.forEach((btn) => {
                    btn.classList.remove('active');
                });

                button.classList.add('active');

                moveTimerLimit = buttonTime;
                localStorage.setItem('toguz_move_timer', moveTimerLimit);

                if (currentPlayer === 'A' && !isGameOver && !isAnimating) {
                    startMoveTimer();
                }

            });

        });

        const introLangButtons =
            document.querySelectorAll('.intro-lang-btn');

        introLangButtons.forEach((btn) => {

            btn.classList.toggle(
                'active',
                btn.dataset.lang === currentLanguage
            );

            btn.onclick = () => {

                currentLanguage = btn.dataset.lang;

                localStorage.setItem(
                    'toguz_language',
                    currentLanguage
                );

                applyLanguage();
            };
        });

        const languageButtons =
            document.querySelectorAll('.language-btn');

        languageButtons.forEach((button) => {

            button.classList.toggle(
                'active',
                button.dataset.lang === currentLanguage
            );

            button.addEventListener('click', () => {

                languageButtons.forEach((btn) => {
                    btn.classList.remove('active');
                });

                button.classList.add('active');

                currentLanguage = button.dataset.lang;

                localStorage.setItem(
                    'toguz_language',
                    currentLanguage
                );

                applyLanguage();
            });
        });
    
        const difficultyButtons =
    document.querySelectorAll('.difficulty-btn');

    difficultyButtons.forEach((button) => {

        button.addEventListener('click', () => {

            difficultyButtons.forEach((btn) => {
                btn.classList.remove('active');
            });

            button.classList.add('active');

            aiDifficulty = button.dataset.level;
        });

    });

    soundToggleEl.addEventListener('change', () => {
        soundEnabled = soundToggleEl.checked;
        localStorage.setItem('toguz_sound', soundEnabled ? '1' : '0');
        playBeep(700, 0.03, 0.04);
    });

    settingsBtn.addEventListener('click', () => {
        settingsOverlayEl.classList.remove('hidden');
    });

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', async () => {

                try {

                    if (!document.fullscreenElement) {

                        await document.documentElement.requestFullscreen();

                        fullscreenBtn.textContent = t('fullscreenExit');

                    } else {

                        await document.exitFullscreen();

                        fullscreenBtn.textContent = t('fullscreen');
                    }

                } catch (err) {
                    console.error(err);
                }

            });

            document.addEventListener('fullscreenchange', () => {
                applyLanguage();
            });
        }

        if (mainMenuBtn) {

            mainMenuBtn.addEventListener('click', () => {

                playButtonSound();

                const splash =
                    document.getElementById('splash');

                const container =
                    document.querySelector('.container');

                if (splash) {
                    splash.classList.remove('hidden');
                    splash.style.display = 'flex';
                }

                if (container) {
                    container.style.display = 'none';
                }

                if (typeof resetCamera === 'function') {
                    resetCamera();
                }
            });
        }

            if (resetCameraBtn) {

                resetCameraBtn.addEventListener('click', () => {

                    if (typeof window.resetBoardCamera === 'function') {
                        window.resetBoardCamera();
                    }

                });
            }

        settingsCloseBtn.addEventListener('click', () => {
        settingsOverlayEl.classList.add('hidden');
    });

    if (demoWinBtn) {
        demoWinBtn.addEventListener('click', () => {
            stopMoveTimer();

            storeA = TARGET_SCORE;
            storeB = 40;

            isGameOver = true;
            isAnimating = false;

            setStatus('Demo result – You win');
            renderAll();

            showGameResult('Demo result – You win');
        });
    }

    if (demoLoseBtn) {
        demoLoseBtn.addEventListener('click', () => {
            stopMoveTimer();

            storeA = 40;
            storeB = TARGET_SCORE;

            isGameOver = true;
            isAnimating = false;

            setStatus('Demo result – You lose');
            renderAll();

            showGameResult('Demo result – You lose');
        });
    }
}

const restartConfirmOverlay =
    document.getElementById('restartConfirmOverlay');

const restartConfirmBtn =
    document.getElementById('restartConfirmBtn');

const restartCancelBtn =
    document.getElementById('restartCancelBtn');

let pendingRestart = false;

aiBtn.addEventListener('click', () => {

    playButtonClickSound();

    if (!isGameOver) {
        pendingRestart = true;
        restartConfirmOverlay.classList.remove('hidden');
        return;
    }

    aiEnabled = true;
    resetGame();

});

restartCancelBtn.addEventListener('click', () => {
    pendingRestart = false;
    restartConfirmOverlay.classList.add('hidden');
});

restartConfirmBtn.addEventListener('click', () => {
    restartConfirmOverlay.classList.add('hidden');

    if (!pendingRestart) return;

    pendingRestart = false;
    aiEnabled = true;
    resetGame();
});

document.addEventListener('DOMContentLoaded', () => {
    buildBoard();
    initSettings();

    applyLanguage();
    renderAll();
});

function startGameFromSplash(e) {
    if (e) e.stopPropagation();

    playButtonClickSound();

    if (typeof window.startAmbientSound === 'function') {
        window.startAmbientSound();
    }

    splashEl.style.opacity = '0';

    document.querySelector('.container').style.display = 'block';

    setTimeout(() => {
        splashEl.style.display = 'none';
    }, 400);

    resetGame();
}

window.startGameFromSplash = startGameFromSplash;
window.handlePitClick = handlePitClick;
window.resetGame = resetGame;
window.getCurrentGameState = getCurrentGameState;

window.openRules = function () {

    document
        .getElementById("rulesOverlay")
        .classList.remove("hidden");
};

window.closeRules = function () {

    document
        .getElementById("rulesOverlay")
        .classList.add("hidden");
};

function showGameResult(resultText) {
    const overlay = document.getElementById('gameResultOverlay');
    const crown = document.getElementById('resultCrown');
    const title = document.getElementById('gameResultTitle');
    const score = document.getElementById('gameResultScore');

    if (!overlay || !crown || !title || !score) return;

    overlay.classList.remove('win-result', 'lose-result', 'draw-result');

    if (storeA > storeB) {

        playWinSound();

        overlay.classList.add('win-result');

        crown.textContent = '';

        title.textContent = t('win');
    } else if (storeB > storeA) {

        playLoseSound();

        overlay.classList.add('lose-result');

        crown.textContent = '';

        title.textContent = t('lose');
    } else {
        overlay.classList.add('draw-result');
        crown.textContent = '';
        title.textContent = t('draw');
    }

    score.textContent =
    `${t('you')}: ${storeA} • ${t('opponent')}: ${storeB}`;
    overlay.classList.remove('hidden');
}

function closeGameResult() {
    const overlay = document.getElementById('gameResultOverlay');
    if (overlay) overlay.classList.add('hidden');
}

window.closeGameResult = closeGameResult;