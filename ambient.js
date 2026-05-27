window.startAmbientSound = function () {
    console.log('LOUD sound test started');

    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ambientCtx = new Ctx();

    ambientCtx.resume();

    const osc = ambientCtx.createOscillator();
    const gain = ambientCtx.createGain();

    osc.type = 'square';
    osc.frequency.value = 600;

    gain.gain.value = 0.35;

    osc.connect(gain);
    gain.connect(ambientCtx.destination);

    osc.start();

    setTimeout(() => {
        osc.stop();
    }, 1000);
};