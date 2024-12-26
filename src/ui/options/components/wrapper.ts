import { createElement } from '../../../core/elements';

export const Wrapper = (
    classNames: string,
    children: (HTMLElement | string)[]
): HTMLDivElement => {
    return createElement(
        'div',
        {
            attributes: {
                classNames,
            },
        },
        children
    );
};
