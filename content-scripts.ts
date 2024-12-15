import { tacit } from './src/core/engine';

const STATE = {
    running: false,
};

window.addEventListener('keydown', (event) => {
    if (STATE.running) return;
    // shortcut is hardcoded to [META (command) + SHIFT + ' (single quote)]
    if (!(event.metaKey && event.shiftKey && event.key === "'")) return;

    STATE.running = true;
    console.info('[Tacit] Running...');

    tacit().then(() => {
        STATE.running = false;
    });
});
