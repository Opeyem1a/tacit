import { createElement } from '../../../core/elements';

export const Wrapper = (
    classNames: string,
    children: (HTMLElement | string)[]
): HTMLDivElement => {
    return createElement<'div'>({
        tag: 'div',
        attributes: {
            classNames,
        },
        children,
    });
};
