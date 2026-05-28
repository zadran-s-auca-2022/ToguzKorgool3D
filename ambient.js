// ===== TOGUZ KORGOOL CALM AMBIENT SOUND =====

let toguzAmbientStarted = false;
let toguzAmbientCtx = null;
let toguzAmbientMasterGain = null;
let toguzAmbientNodes = [];

window.startAmbientSound = async function () {
    if (toguzAmbientStarted) return;

    toguzAmbientStarted = true;

    const Ctx = window.AudioContext || window.webkitAudioContext;

    if (!Ctx) {
        console.log('AudioContext not supported');
        return;
    }

    toguzAmbientCtx = new Ctx();

    if (toguzAmbientCtx.state === 'suspended') {
        await toguzAmbientCtx.resume();
    }

    toguzAmbientMasterGain = toguzAmbientCtx.createGain();

    // A little louder, but still soft
    toguzAmbientMasterGain.gain.value = 0.32;

    toguzAmbientMasterGain.connect(toguzAmbientCtx.destination);

    createCalmAir();
    createSoftWoodRoom();
    createGentleNaturePulse();

    console.log('Calm ambient sound running');
};

// ===== VERY SOFT AIR / WIND =====

function createCalmAir() {
    const bufferSize = toguzAmbientCtx.sampleRate * 4;

    const noiseBuffer = toguzAmbientCtx.createBuffer(
        1,
        bufferSize,
        toguzAmbientCtx.sampleRate
    );

    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.55;
    }

    const noise = toguzAmbientCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = toguzAmbientCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 850;

    const highpass = toguzAmbientCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 180;

    const gain = toguzAmbientCtx.createGain();
    gain.gain.value = 0.12;

    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(toguzAmbientMasterGain);

    noise.start();

    setInterval(() => {
        gain.gain.linearRampToValueAtTime(
            0.09 + Math.random() * 0.06,
            toguzAmbientCtx.currentTime + 4
        );
    }, 4000);

    toguzAmbientNodes.push(noise, lowpass, highpass, gain);
}

// ===== WARM SOFT ROOM TONE =====

function createSoftWoodRoom() {
    const osc1 = toguzAmbientCtx.createOscillator();
    const osc2 = toguzAmbientCtx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.value = 96;
    osc2.frequency.value = 144;

    const gain = toguzAmbientCtx.createGain();
    gain.gain.value = 0.035;

    const filter = toguzAmbientCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 260;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(toguzAmbientMasterGain);

    osc1.start();
    osc2.start();

    toguzAmbientNodes.push(osc1, osc2, filter, gain);
}

// ===== GENTLE NATURAL SOFT PULSE =====

function createGentleNaturePulse() {
    setInterval(() => {
        if (!toguzAmbientCtx || !toguzAmbientMasterGain) return;

        const osc = toguzAmbientCtx.createOscillator();
        const gain = toguzAmbientCtx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 260 + Math.random() * 80;

        gain.gain.setValueAtTime(0, toguzAmbientCtx.currentTime);
        gain.gain.linearRampToValueAtTime(
            0.035,
            toguzAmbientCtx.currentTime + 0.8
        );
        gain.gain.linearRampToValueAtTime(
            0,
            toguzAmbientCtx.currentTime + 3.2
        );

        osc.connect(gain);
        gain.connect(toguzAmbientMasterGain);

        osc.start();
        osc.stop(toguzAmbientCtx.currentTime + 3.4);
    }, 6500);
}