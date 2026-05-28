// ===== LUXURY CHESS ROOM AMBIENCE =====

let toguzAmbientStarted = false;
let toguzAmbientCtx = null;
let toguzAmbientMasterGain = null;

window.startAmbientSound = async function () {

    if (toguzAmbientStarted) return;

    toguzAmbientStarted = true;

    const Ctx =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!Ctx) return;

    toguzAmbientCtx = new Ctx();

    if (toguzAmbientCtx.state === 'suspended') {
        await toguzAmbientCtx.resume();
    }

    // ===== MASTER =====

    toguzAmbientMasterGain =
        toguzAmbientCtx.createGain();

    toguzAmbientMasterGain.gain.value = 0.38;

    toguzAmbientMasterGain.connect(
        toguzAmbientCtx.destination
    );

    createWarmRoomAir();
    createFireplaceTone();
    createLuxuryRoomMovement();
};

// ===== SOFT ROOM AIR =====

function createWarmRoomAir() {

    const bufferSize =
        toguzAmbientCtx.sampleRate * 4;

    const noiseBuffer =
        toguzAmbientCtx.createBuffer(
            1,
            bufferSize,
            toguzAmbientCtx.sampleRate
        );

    const data =
        noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {

        data[i] =
            (Math.random() * 2 - 1) * 0.22;
    }

    const noise =
        toguzAmbientCtx.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass =
        toguzAmbientCtx.createBiquadFilter();

    lowpass.type = 'lowpass';
    lowpass.frequency.value = 950;

    const highpass =
        toguzAmbientCtx.createBiquadFilter();

    highpass.type = 'highpass';
    highpass.frequency.value = 320;

    const gain =
        toguzAmbientCtx.createGain();

    gain.gain.value = 0.09;

    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(toguzAmbientMasterGain);

    noise.start();

    setInterval(() => {

        gain.gain.linearRampToValueAtTime(
            0.06 + Math.random() * 0.04,
            toguzAmbientCtx.currentTime + 5
        );

    }, 5000);
}

// ===== FIREPLACE ATMOSPHERE =====

function createFireplaceTone() {

    const osc1 =
        toguzAmbientCtx.createOscillator();

    const osc2 =
        toguzAmbientCtx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.value = 72;
    osc2.frequency.value = 108;

    const filter =
        toguzAmbientCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 180;

    const gain =
        toguzAmbientCtx.createGain();

    gain.gain.value = 0.028;

    osc1.connect(filter);
    osc2.connect(filter);

    filter.connect(gain);
    gain.connect(toguzAmbientMasterGain);

    osc1.start();
    osc2.start();

    // breathing movement

    setInterval(() => {

        gain.gain.linearRampToValueAtTime(
            0.018 + Math.random() * 0.018,
            toguzAmbientCtx.currentTime + 4
        );

    }, 4000);
}

// ===== OCCASIONAL ROOM MOVEMENT =====

function createLuxuryRoomMovement() {

    setInterval(() => {

        const osc =
            toguzAmbientCtx.createOscillator();

        const gain =
            toguzAmbientCtx.createGain();

        const filter =
            toguzAmbientCtx.createBiquadFilter();

        osc.type = 'sine';

        osc.frequency.value =
            180 + Math.random() * 90;

        filter.type = 'lowpass';
        filter.frequency.value = 320;

        gain.gain.setValueAtTime(
            0,
            toguzAmbientCtx.currentTime
        );

        gain.gain.linearRampToValueAtTime(
            0.012,
            toguzAmbientCtx.currentTime + 1
        );

        gain.gain.linearRampToValueAtTime(
            0,
            toguzAmbientCtx.currentTime + 4
        );

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(toguzAmbientMasterGain);

        osc.start();

        osc.stop(
            toguzAmbientCtx.currentTime + 4.2
        );

    }, 7000);
}