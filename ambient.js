// ===== TOGUZ KORGOOL AMBIENT SOUND =====

let toguzAmbientStarted = false;
let toguzAmbientCtx = null;
let toguzAmbientMasterGain = null;

window.startAmbientSound = async function () {

    if (toguzAmbientStarted) return;

    toguzAmbientStarted = true;

    console.log('Ambient started');

    const Ctx = window.AudioContext || window.webkitAudioContext;

    if (!Ctx) {
        console.log('AudioContext not supported');
        return;
    }

    toguzAmbientCtx = new Ctx();

    if (toguzAmbientCtx.state === 'suspended') {
        await toguzAmbientCtx.resume();
    }

    // ===== MASTER VOLUME =====
    toguzAmbientMasterGain = toguzAmbientCtx.createGain();
    toguzAmbientMasterGain.gain.value = 0.18;

    toguzAmbientMasterGain.connect(
        toguzAmbientCtx.destination
    );

    createSoftWind();
    createWarmRoomTone();

    console.log('Ambient sound running');
};

// ===== WIND SOUND =====

function createSoftWind() {

    const bufferSize =
        toguzAmbientCtx.sampleRate * 3;

    const noiseBuffer =
        toguzAmbientCtx.createBuffer(
            1,
            bufferSize,
            toguzAmbientCtx.sampleRate
        );

    const data =
        noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise =
        toguzAmbientCtx.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass =
        toguzAmbientCtx.createBiquadFilter();

    lowpass.type = 'lowpass';
    lowpass.frequency.value = 420;

    const bandpass =
        toguzAmbientCtx.createBiquadFilter();

    bandpass.type = 'bandpass';
    bandpass.frequency.value = 170;
    bandpass.Q.value = 0.55;

    const gain =
        toguzAmbientCtx.createGain();

    gain.gain.value = 0.08;

    noise.connect(lowpass);
    lowpass.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(toguzAmbientMasterGain);

    noise.start();

    setInterval(() => {

        gain.gain.linearRampToValueAtTime(
            0.06 + Math.random() * 0.03,
            toguzAmbientCtx.currentTime + 3.5
        );

    }, 3500);
}

// ===== LOW ROOM TONE =====

function createWarmRoomTone() {

    const osc =
        toguzAmbientCtx.createOscillator();

    osc.type = 'sine';

    osc.frequency.value = 48;

    const filter =
        toguzAmbientCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 140;

    const gain =
        toguzAmbientCtx.createGain();

    gain.gain.value = 0.04;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(toguzAmbientMasterGain);

    osc.start();
}