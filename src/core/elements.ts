type EventListenerDefinition<K extends keyof HTMLElementEventMap> = {
    type: K;
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown;
    options?: boolean | AddEventListenerOptions;
};

type CustomEventListenerDefinition = {
    customType: string;
    customListener: (this: HTMLElement, ev: CustomEvent) => unknown;
    options?: boolean | AddEventListenerOptions;
};

export type EffectFunc<K extends keyof HTMLElementTagNameMap> = (
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
    events?: (
        | EventListenerDefinition<keyof HTMLElementEventMap>
        | CustomEventListenerDefinition
    )[];
    children?: (HTMLElement | string | null)[];
    effects?: Effects<K>;
};

export const createElement = <T extends keyof HTMLElementTagNameMap>({
    tag,
    attributes: _attributes,
    events: _events,
    children: _children,
    effects: _effects,
}: CreateElementArgs<T>): HTMLElementTagNameMap[T] => {
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
        if ('customType' in event) {
            // @ts-expect-error - this is allowed, but typescript really doesn't like it
            element.addEventListener(event.customType, event.customListener);
            return;
        }

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

type Observer<TValue> = (value: TValue) => void;
type ObservedValue<TValue> = {
    value: TValue;
    setValue: (newValueOrUpdater: TValue | ((prev: TValue) => TValue)) => void;
    addObserver: (callback: Observer<TValue>) => void;
};

export const observed = <TValue extends string | number | object | boolean>(
    initialValue: TValue
): ObservedValue<TValue> => {
    let value = initialValue;
    const observers: Observer<TValue>[] = [];

    function setValue(newValueOrUpdater: TValue | ((prev: TValue) => TValue)) {
        const newValue =
            typeof newValueOrUpdater === 'function'
                ? newValueOrUpdater(value)
                : newValueOrUpdater;
        value = newValue;
        observers.forEach((callback) => {
            callback(newValue);
        });
    }

    function addObserver(callback: Observer<TValue>) {
        observers.push(callback);
    }

    return {
        get value() {
            return value;
        },
        setValue,
        addObserver,
    };
};

/**
 * Basically pure syntax sugar so the code reads nicer,
 * I'm testing if this is a helpful pattern, but yes
 * this is entirely redundant since you can just call
 * addObserver directly
 */
export const when = <TValue>(observedValue: ObservedValue<TValue>) => {
    return {
        changes: (callback: Observer<TValue>) => {
            observedValue.addObserver(callback);
        },
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const combine = <TRaw extends Record<string, ObservedValue<any>>>(
    record: TRaw
) => {
    const initialValue = Object.fromEntries(
        Object.entries(record).map(([name, observedValue]) => {
            return [name, observedValue.value];
        })
    ) as { [K in keyof TRaw]: TRaw[K]['value'] };

    const combined = observed(initialValue);

    Object.entries(record).forEach(([name, observedValue]) => {
        observedValue.addObserver((value) => {
            combined.setValue((prev) => ({ ...prev, [name]: value }));
        });
    });

    return combined;
};
