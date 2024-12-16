import { tacit } from './src/core/engine';
import { COMMANDS } from './src/common/constants';

const STATE = {
    running: false,
};

browser.runtime.onMessage.addListener((message) => {
    if (message.command === COMMANDS.RUN) {
        if (STATE.running) return;

        STATE.running = true;
        console.info('[tacit] Running...');

        tacit().then(() => {
            STATE.running = false;
        });
    }
});
