import { tacit } from './src/core/engine';
import { MESSAGE_KEYS } from './src/common/constants';

const STATE = {
    running: false,
};

browser.runtime.onMessage.addListener((message) => {
    if (message.key === MESSAGE_KEYS.RUN) {
        if (STATE.running) return;

        STATE.running = true;
        console.info('[tacit] Running...');

        tacit({ updateProgress }).then(() => {
            STATE.running = false;
        });
    }
});

const updateProgress = async ({
    complete,
    total,
}: {
    complete: number;
    total: number;
}) => {
    const ratio = total > 0 ? complete / total : 1;
    const progress = `${ratio * 100}%`;
    await browser.runtime.sendMessage({
        key: MESSAGE_KEYS.TOAST_SHOULD_UPDATE,
        progress,
    });
};
