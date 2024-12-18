import { createElement } from './src/core/elements';
import { COMMANDS } from './src/common/constants';

const TOAST_ELEMENT_ID = 'tacit-extension-toast';
const AUTO_REMOVE_TIME_MS = 4000;

const renderToast = () => {
    const body = document.querySelector('body');
    const host = createElement({ tag: 'div' });
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

    const removeToast = () => {
        shadow.getElementById(TOAST_ELEMENT_ID).remove();
    };

    setTimeout(() => removeToast(), AUTO_REMOVE_TIME_MS);

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
                        removeToast();
                    },
                },
            ],
            children: [
                createElement({
                    tag: 'span',
                    attributes: {
                        classNames: 'title',
                    },
                    children: ['Tacit'],
                }),
                createElement({
                    tag: 'span',
                    attributes: {
                        classNames: 'description',
                    },
                    children: ['Running...'],
                }),
            ],
        })
    );
};

browser.runtime.onMessage.addListener((message) => {
    if (message.command === COMMANDS.TOAST_RUNNING) {
        renderToast();
    }
});
