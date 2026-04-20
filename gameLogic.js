const NUM_PITS_PER_PLAYER = 9;
const TOTAL_PITS = NUM_PITS_PER_PLAYER * 2;
const INITIAL_STONES = 9;
const TARGET_SCORE = 82;
const SOW_DELAY = 200;

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
const aiBtn = document.getElementById('aiBtn');
const settingsBtn = document.getElementById('settingsBtn');

const historyListEl = document.getElementById('historyList');

const splashEl = document.getElementById('splash');

const settingsOverlayEl = document.getElementById('settingsOverlay');
const settingsCloseBtn = document.getElementById('settingsCloseBtn');
const soundToggleEl = document.getElementById('soundToggle');

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
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSowSound() {
    playBeep(900, 0.04, 0.03);
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

    scoreAEl.textContent = `You : ${storeA}`;
    scoreBEl.textContent = `Computer : ${storeB}`;
}

function renderHistory() {
    historyListEl.innerHTML = '';
    for (const entry of moveHistory) {
        const div = document.createElement('div');
        div.classList.add('history-entry');
        div.textContent =
            `${entry.num}. Player ${entry.player} – pit ${entry.pit} ` +
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

    setStatus('You vs Computer – You start');
    renderAll();
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
    setStatus(currentPlayer === 'A' ? "Your turn" : "Computer's turn");
    isAnimating = false;
    notify3D();

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
    renderAll();

    let message;
    if (storeA > storeB) {
        message = `Game over! You win (${storeA} : ${storeB})`;
    } else if (storeB > storeA) {
        message = `Game over! Computer wins (${storeB} : ${storeA})`;
    } else {
        message = `Game over! Draw (${storeA} : ${storeB})`;
    }

    setStatus(message);
}

function aiMove() {
    if (isGameOver || isAnimating || currentPlayer !== 'B') return;

    let bestIndex = -1;
    let bestCapture = -1;

    for (let col = 0; col < NUM_PITS_PER_PLAYER; col++) {
        const index = NUM_PITS_PER_PLAYER + col;
        if (pits[index] === 0) continue;

        const captured = simulateCapture(index, 'B');
        if (captured > bestCapture) {
            bestCapture = captured;
            bestIndex = index;
        }
    }

    if (bestIndex === -1) {
        for (let col = 0; col < NUM_PITS_PER_PLAYER; col++) {
            const index = NUM_PITS_PER_PLAYER + col;
            if (pits[index] > 0) {
                bestIndex = index;
                break;
            }
        }
    }

    if (bestIndex !== -1) {
        performMove(bestIndex, 'B', true);
    }
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

function initSettings() {
    const saved = localStorage.getItem('toguz_sound');
    if (saved !== null) {
        soundEnabled = saved === '1';
    }

    soundToggleEl.checked = soundEnabled;

    soundToggleEl.addEventListener('change', () => {
        soundEnabled = soundToggleEl.checked;
        localStorage.setItem('toguz_sound', soundEnabled ? '1' : '0');
        playBeep(700, 0.03, 0.04);
    });

    settingsBtn.addEventListener('click', () => {
        settingsOverlayEl.classList.remove('hidden');
    });

    settingsCloseBtn.addEventListener('click', () => {
        settingsOverlayEl.classList.add('hidden');
    });
}

aiBtn.addEventListener('click', () => {
    aiEnabled = true;
    resetGame();
});

document.addEventListener('DOMContentLoaded', () => {
    buildBoard();
    initSettings();

    setStatus('Click "Start Game" to begin');
    renderAll();
});

function startGameFromSplash(e) {
    if (e) e.stopPropagation();

    splashEl.style.opacity = '0';

    setTimeout(() => {
        splashEl.style.display = 'none';
    }, 400);

    resetGame();
}

window.startGameFromSplash = startGameFromSplash;
window.handlePitClick = handlePitClick;
window.resetGame = resetGame;
window.getCurrentGameState = getCurrentGameState;