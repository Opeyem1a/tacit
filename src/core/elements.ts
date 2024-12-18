type EventListenerDefinition<K extends keyof HTMLElementEventMap> = {
    type: K;
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any;
    options?: boolean | AddEventListenerOptions;
};

type CreateElementArgs = {
    tag: keyof HTMLElementTagNameMap;
    attributes?: Record<string, string>;
    events?: EventListenerDefinition<keyof HTMLElementEventMap>[];
    children?: Array<HTMLElement | string>;
};

export const createElement = ({
    tag,
    attributes: _attributes,
    events: _events,
    children: _children,
}: CreateElementArgs): HTMLElement => {
    const element = document.createElement(tag);

    /**
     * Default values are handled this way so typescript
     * knows they are never undefined without needing "!"
     */
    const attributes = _attributes ?? {};
    const events = _events ?? [];
    const children = _children ?? [];

    events.forEach((event) => {
        element.addEventListener(event.type, event.listener);
    });

    Object.entries(attributes).forEach(([_name, value]) => {
        const name = _name === 'classNames' ? 'class' : _name;
        element.setAttribute(name, value);
    });

    children.forEach((child) => {
        appendChild(element, child);
    });

    return element;
};

const appendChild = (parent: HTMLElement, child: HTMLElement | string) => {
    if (Array.isArray(child)) {
        child.forEach((nestedChild) => appendChild(parent, nestedChild));
        return;
    }

    parent.appendChild(
        typeof child === 'string' ? document.createTextNode(child) : child
    );
};
