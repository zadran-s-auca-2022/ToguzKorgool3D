// ===== TOGUZ KORGOOL AMBIENT SOUND TEST =====

window.startAmbientSound = function () {
    console.log('Ambient sound test: started');

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;

    const ambientCtx = new Ctx();

    const osc = ambientCtx.createOscillator();
    const gain = ambientCtx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 120;

    gain.gain.value = 0.03;

    osc.connect(gain);
    gain.connect(ambientCtx.destination);

    osc.start();
};