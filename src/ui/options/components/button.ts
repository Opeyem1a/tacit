import { createElement, EffectFunc } from '../../../core/elements';

export const Button = ({
    text,
    variant,
    postInit,
    initiallyDisabled,
    onClick,
}: {
    text: string;
    variant: 'primary' | 'secondary' | 'info';
    postInit: EffectFunc<'button'>;
    initiallyDisabled: boolean;
    onClick: () => void;
}): HTMLElement => {
    const classNames = {
        primary:
            'bg-gray-900 text-gray-50 hover:bg-gray-900/90 disabled:bg-gray-900/50',
        secondary:
            'bg-white text-gray-900 border border-input hover:bg-gray-50/90 disabled:text-gray-900/50',
        info: 'text-blue-600 bg-white hover:bg-blue-50/90 disabled:bg-blue-50/50 disabled:text-blue-600/50',
    } as const;

    return createElement(
        'button',
        {
            attributes: {
                type: 'button',
                classNames: `${classNames[variant]} h-9 rounded-md px-3 text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed`,
                ...(initiallyDisabled && { disabled: 'true' }),
            },
            effects: { postInit },
            events: [
                {
                    type: 'click',
                    listener: (e) => {
                        e.preventDefault();
                        onClick();
                    },
                },
            ],
        },
        [text]
    );
};

export const disableButton = (element: HTMLElement) => {
    element.removeAttribute('disabled');
};

export const enableButton = (element: HTMLElement) => {
    element.setAttribute('disabled', 'true');
};
