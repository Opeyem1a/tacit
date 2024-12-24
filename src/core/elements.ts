type EventListenerDefinition<K extends keyof HTMLElementEventMap> = {
    type: K;
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown;
    options?: boolean | AddEventListenerOptions;
};

type EffectFunc<K extends keyof HTMLElementTagNameMap> = (
    element: HTMLElementTagNameMap[K],
    props?: CreateElementArgs<K>
) => void;

type Effects<K extends keyof HTMLElementTagNameMap> = {
    postInit?: EffectFunc<K>;
};

type CreateElementArgs<K extends keyof HTMLElementTagNameMap> = {
    tag: K;
    // fixme: could use conditional types to make sure only the attribute names that extend from string are included (to not include .addEventListener and stuff)
    attributes?: Partial<
        Record<keyof HTMLElementTagNameMap[K] | 'classNames', string>
    >;
    events?: EventListenerDefinition<keyof HTMLElementEventMap>[];
    children?: (HTMLElement | string | null)[];
    effects?: Effects<K>;
};

export const createElement = <T extends keyof HTMLElementTagNameMap>({
    tag,
    attributes: _attributes,
    events: _events,
    children: _children,
    effects: _effects,
}: CreateElementArgs<T>): HTMLElement => {
    const element = document.createElement(tag);

    /**
     * Default values are handled this way so typescript
     * knows they are never undefined without needing "!"
     */
    const attributes = _attributes ?? {};
    const events = _events ?? [];
    const children = _children ?? [];
    const effects = _effects ?? {};

    events.forEach((event) => {
        element.addEventListener(event.type, event.listener);
    });

    /**
     * @unsafe - 'as' is needed so TypeScript respects us, but is a weak pattern
     * It's unsafe because TypeScript doesn't do excess property checking well, so using Partial<Record<..., ...>>
     * destroys the inferred type of Object.entries(). Only use this if confident there's no excess properties with
     * values outside your specified type
     *
     * @see {@link https://stackoverflow.com/questions/60141960/typescript-key-value-relation-preserving-object-entries-type}
     */
    const entries = Object.entries(attributes) as Array<Array<string>>;

    entries.forEach(([_name, value]) => {
        const name = _name === 'classNames' ? 'class' : _name;
        element.setAttribute(name, value);
    });

    children.forEach((child) => {
        if (child === null) return;
        appendChild(element, child);
    });

    if (effects.postInit) {
        effects.postInit(element, {
            tag,
            attributes,
            effects,
            events,
            children,
        });
    }

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
