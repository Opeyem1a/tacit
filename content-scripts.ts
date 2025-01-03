import { tacit } from './src/core/engine';
import { TacitMessage } from './src/common/constants';
import { typed } from './src/core/utils';

const STATE = {
    running: false,
};

browser.runtime.onMessage.addListener((message: TacitMessage) => {
    if (message.key === 'START') {
        if (STATE.running) return;

        STATE.running = true;
        console.info('[tacit] Running...');

        tacit({
            updateProgress: (args) =>
                // every updateProgress call should pass the same instance to the underlying helper
                updateProgress({ ...args, instance: message.instance }),
        }).then(() => {
            STATE.running = false;
        });
    }
});

const updateProgress = async ({
    instance,
    complete,
    total,
}: {
    instance: number;
    complete: number;
    total: number;
}) => {
    const frame = browser.runtime.getFrameId(window);
    const ratio = total > 0 ? complete / total : 1;
    const progress: `${number}%` = `${ratio * 100}%`;

    await browser.runtime.sendMessage(
        typed<TacitMessage>({
            key: 'TOAST_UPDATE_INTENT',
            instance,
            progress,
            frame,
        })
    );
};
