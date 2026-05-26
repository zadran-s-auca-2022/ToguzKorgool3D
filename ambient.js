// ===== TOGUZ KORGOOL AMBIENT SOUND =====

let ambientStarted = false;
let audioCtx;
let masterGain;

function startAmbientSound() {

    if (ambientStarted) return;

    ambientStarted = true;

    audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.05;

    masterGain.connect(audioCtx.destination);

    createWindLayer();
    createRoomLayer();
    createWarmTone();
}

// ===== SOFT WIND =====

function createWindLayer() {

    const bufferSize = 2 * audioCtx.sampleRate;

    const noiseBuffer = audioCtx.createBuffer(
        1,
        bufferSize,
        audioCtx.sampleRate
    );

    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();

    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 180;
    bandpass.Q.value = 0.4;

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 450;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.018;

    whiteNoise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(masterGain);

    whiteNoise.start();

    // slow ambience breathing

    setInterval(() => {

        gainNode.gain.linearRampToValueAtTime(
            0.012 + Math.random() * 0.01,
            audioCtx.currentTime + 4
        );

    }, 4000);
}

// ===== WOODEN ROOM ATMOSPHERE =====

function createRoomLayer() {

    const osc = audioCtx.createOscillator();

    osc.type = 'sine';
    osc.frequency.value = 42;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.012;

    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 120;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    osc.start();
}

// ===== WARM AIR TONE =====

function createWarmTone() {

    const osc = audioCtx.createOscillator();

    osc.type = 'triangle';
    osc.frequency.value = 82;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.004;

    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 180;

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    osc.start();
}

// ===== START AFTER FIRST USER CLICK =====

window.addEventListener('click', () => {

    startAmbientSound();

}, { once: true });