const ambientSound = new Audio(
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=night-nature-crickets-8085.mp3'
);

ambientSound.loop = true;
ambientSound.volume = 0.25;

window.startAmbientSound = function () {

    ambientSound.play().catch(() => {});
};

window.stopAmbientSound = function () {

    ambientSound.pause();
};

window.resumeAmbientSound = function () {

    ambientSound.play().catch(() => {});
};