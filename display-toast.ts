import { createElement } from './src/core/elements';
import { MESSAGE_KEYS } from './src/common/constants';
import { delay } from './src/core/utils';

const TOAST_ELEMENT_ID = 'tacit-extension-toast';
const SHADOW_HOST_ID = 'tacit-shadow';
// todo: don't do this if tacit is still running though
const AUTO_REMOVE_TIME_MS = 10_000;

const createToast = (initialCurrentProgress?: string) => {
    const oldShadowHost = document.querySelector(`div#${SHADOW_HOST_ID}`);
    if (oldShadowHost) {
        oldShadowHost.remove();
    }
    const shadow = getOrCreateShadowHost();

    setTimeout(() => cleanupToast(), AUTO_REMOVE_TIME_MS);

    shadow.appendChild(
        createElement({
            tag: 'div',
            attributes: {
                id: TOAST_ELEMENT_ID,
            },
            events: [
                {
                    type: 'click',
                    listener: (e) => {
                        e.stopPropagation();
                        void cleanupToast();
                    },
                },
            ],
            children: [
                createElement({
                    tag: 'h4',
                    children: ['tacit'],
                }),
                createElement({
                    tag: 'div',
                    attributes: {
                        classNames: 'loader',
                    },
                    children: [
                        createElement({
                            tag: 'span',
                            attributes: {
                                classNames: 'loader-progress',
                                style: `--progress: ${initialCurrentProgress ?? '0%'}`,
                            },
                        }),
                    ],
                }),
            ],
        })
    );
};

const cleanupToast = async () => {
    await delay(125);
    const shadow = document.querySelector(`div#${SHADOW_HOST_ID}`);
    if (!shadow) {
        return;
    }

    const toast = shadow.shadowRoot.querySelector(`div#${TOAST_ELEMENT_ID}`);
    toast.setAttribute('data-remove', '1');
    toast.setAttribute(
        'style',
        `${toast.getAttribute('style')}--duration:300ms;`
    );

    await delay(325);
    shadow.remove();
};

const updateToast = (currentProgress: `${number}%`) => {
    const shadow = getOrCreateShadowHost();
    let toast = shadow.querySelector(
        `div#${TOAST_ELEMENT_ID} span.loader-progress`
    );

    if (!toast) {
        createToast(currentProgress);
        toast = shadow.querySelector(
            `div#${TOAST_ELEMENT_ID} span.loader-progress`
        );
    }

    toast.setAttribute('style', `--progress: ${currentProgress}`);
};

const getOrCreateShadowHost = (): ShadowRoot => {
    const body = document.querySelector('body');

    const oldShadowHost = document.querySelector(`div#${SHADOW_HOST_ID}`);
    if (oldShadowHost) {
        return oldShadowHost.shadowRoot;
    }

    const host = createElement({
        tag: 'div',
        attributes: { id: SHADOW_HOST_ID, style: 'z-index: 9999999999;' },
    });
    body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const stylesheetLink = browser.runtime.getURL('toast.css');
    shadow.appendChild(
        createElement({
            tag: 'link',
            attributes: {
                rel: 'stylesheet',
                type: 'text/css',
                href: stylesheetLink,
            },
        })
    );

    return shadow;
};

browser.runtime.onMessage.addListener(async (message) => {
    if (message.key === MESSAGE_KEYS.TOAST_RUNNING) {
        createToast();
    }
    if (message.key === MESSAGE_KEYS.TOAST_WILL_UPDATE) {
        updateToast(message.progress);
        if (message.progress === '100%') {
            await cleanupToast();
        }
    }
});
