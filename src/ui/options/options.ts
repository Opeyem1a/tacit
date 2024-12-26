import { createElement, observed, combine, when } from '../../core/elements';
import { ACTIONS, TriggeredAction } from '../../core/actions';
import { formatJsonString, sortActions } from '../../core/utils';
import {
    assertActionCheckboxIsValid,
    assertActionClickIsValid,
    assertActionInputIsValid,
    assertActionIsObject,
    assertActionKindIsValid,
    assertActionPriorityIsValid,
    assertActionSelectIsValid,
} from '../../core/assertions';
import { Wrapper } from './components/wrapper';
import { Button, disableButton, enableButton } from './components/button';

window.addEventListener('load', async () => {
    const root = document.getElementById('root');
    if (!root) {
        throw new Error('Root element could not be found');
    }

    const actions = sortActions(await getActions());
    root.appendChild(component({ actions }));
});

const component = ({ actions }: { actions: readonly TriggeredAction[] }) => {
    const initialActions = formatJsonString(actions);
    const formIsDirty = observed<boolean>(false);
    const formIsSubmitting = observed<boolean>(false);
    const formIsValidating = observed<boolean>(false);
    const formErrors = observed<string[]>([]);
    const currentActionsString = observed<string>('');

    const buttonState = combine({
        formIsDirty,
        formIsSubmitting,
        formIsValidating,
        formErrors,
    });

    let textareaRef: HTMLTextAreaElement;

    currentActionsString.setValue(initialActions);

    when(currentActionsString).changes((value) => {
        formIsDirty.setValue(initialActions !== currentActionsString.value);
        validateForm(value);
    });

    function validateForm(actionsString: string): string[] {
        formIsValidating.setValue(true);
        try {
            JSON.parse(actionsString);
        } catch {
            const _errors = ['Must be a valid JSON'];
            formErrors.setValue(_errors);
            formIsValidating.setValue(false);
            return _errors;
        }

        const actions: unknown = JSON.parse(actionsString);
        if (!Array.isArray(actions)) {
            const _errors = ['Must be an array'];
            formErrors.setValue(_errors);
            formIsValidating.setValue(false);
            return _errors;
        }

        const _errors = [];
        actions.forEach((_action) => {
            const safe = safeParseAction(_action);
            if (!safe.success) {
                _errors.push(safe.error);
            }
        });

        const MAX_ACTIONS = 50;
        if (actions.length > MAX_ACTIONS) {
            _errors.push(
                `You may only define up to ${MAX_ACTIONS} actions at once.`
            );
        }
        formErrors.setValue(_errors);
        formIsValidating.setValue(false);
        return _errors;
    }

    return createElement('form', {}, [
        Wrapper('flex flex-col py-4 px-4 gap-4', [
            Wrapper('flex gap-3', [
                Wrapper('rounded-lg w-4 bg-[#ff00c8]', []),
                Wrapper('flex flex-col gap-1', [
                    createElement(
                        'label',
                        {
                            attributes: {
                                classNames: 'text-base font-medium',
                            },
                        },
                        ['Configured actions']
                    ),
                    createElement(
                        'p',
                        {
                            attributes: {
                                classNames: 'text-sm text-gray-700',
                            },
                        },
                        [
                            `
                                This array defines the "actions" that will be attempted by Tacit
                                when the command is run. I haven't gotten around to writing any 
                                docs yet, but if the schema makes sense to you then have fun
                                (it has validation and won't let you save something wonky).
                                `,
                        ]
                    ),
                    Wrapper('flex justify-between items-center gap-2 mt-2', [
                        Button({
                            text: 'Reset to default (Shopify checkout)',
                            variant: 'info',
                            initiallyDisabled: false,
                            postInit: (element) => {
                                when(buttonState).changes((value) => {
                                    if (
                                        !value.formIsSubmitting &&
                                        !value.formIsValidating
                                    ) {
                                        disableButton(element);
                                    } else {
                                        enableButton(element);
                                    }
                                });
                            },
                            onClick: () => {
                                textareaRef.value = formatJsonString(
                                    sortActions(ACTIONS)
                                );
                                textareaRef.dispatchEvent(new Event('input'));
                            },
                        }),
                        Wrapper('flex gap-2', [
                            Button({
                                text: 'Discard',
                                variant: 'secondary',
                                initiallyDisabled: true,
                                postInit: (element) => {
                                    when(buttonState).changes((value) => {
                                        if (
                                            !value.formIsSubmitting &&
                                            !value.formIsValidating &&
                                            value.formIsDirty
                                        ) {
                                            disableButton(element);
                                        } else {
                                            enableButton(element);
                                        }
                                    });
                                },
                                onClick: () => {
                                    textareaRef.value = initialActions;
                                    textareaRef.dispatchEvent(
                                        new Event('input')
                                    );
                                },
                            }),
                            Button({
                                text: 'Save',
                                variant: 'primary',
                                initiallyDisabled: true,
                                postInit: (element) => {
                                    when(buttonState).changes((value) => {
                                        if (
                                            !value.formErrors.length &&
                                            !value.formIsSubmitting &&
                                            !value.formIsValidating &&
                                            value.formIsDirty
                                        ) {
                                            disableButton(element);
                                        } else {
                                            enableButton(element);
                                        }
                                    });
                                },
                                onClick: async () => {
                                    const _errors = validateForm(
                                        currentActionsString.value
                                    );
                                    if (_errors.length) return;

                                    formIsSubmitting.setValue(true);
                                    await setActions(
                                        JSON.parse(
                                            currentActionsString.value
                                        ) as TriggeredAction[]
                                    );
                                    formIsSubmitting.setValue(false);
                                },
                            }),
                        ]),
                    ]),
                ]),
            ]),
            Wrapper('flex flex-col gap-2', [
                createElement(
                    'div',
                    {
                        attributes: {
                            classNames:
                                'flex flex-col p-3 rounded-md bg-red-200 text-sm text-red-800 hidden',
                        },
                        effects: {
                            postInit: (element) => {
                                when(formErrors).changes((value) => {
                                    if (!value.length) {
                                        element.classList.add('hidden');
                                        return;
                                    }

                                    element.classList.remove('hidden');
                                    element.innerText = value.join('\n');
                                });
                            },
                        },
                    },
                    [formErrors.value.join('\n')]
                ),
                createElement('textarea', {
                    attributes: {
                        // the number of lines a single actions takes is ~6, this is a gross approximation + the 2 for []
                        rows: String(actions.length * 6 + 2),
                        classNames:
                            'text-sm bg-gray-800 text-gray-50 font-mono p-2.5 rounded-xl border border-gray-600',
                    },
                    events: [
                        {
                            type: 'change',
                            listener: (event) => {
                                /**
                                 * Format the JSON when it changes
                                 */
                                if (!formErrors.value.length) {
                                    (
                                        event.target as HTMLTextAreaElement
                                    ).value = formatJsonString(
                                        JSON.parse(currentActionsString.value)
                                    );
                                    event.target?.dispatchEvent(
                                        new Event('input')
                                    );
                                }
                            },
                        },
                        {
                            type: 'input',
                            listener: (event) => {
                                const value = (
                                    event.target as HTMLTextAreaElement
                                ).value;
                                currentActionsString.setValue(value);
                            },
                        },
                    ],
                    effects: {
                        postInit: (element) => {
                            element.value = currentActionsString.value;
                            textareaRef = element;
                        },
                    },
                }),
            ]),
        ]),
    ]);
};

const TACIT_ACTIONS_STORAGE_KEY = 'tacitActions';
const getActions = async (): Promise<readonly TriggeredAction[]> => {
    /**
     * Note that the destructured key here needs to match the value of {@link TACIT_ACTIONS_STORAGE_KEY}
     */
    const { tacitActions } = await browser.storage.sync.get([
        TACIT_ACTIONS_STORAGE_KEY,
    ]);

    /**
     * If the user has never saved a custom actions array, this will be
     * undefined, if they intentionally save an empty actions array, then
     * this case is not triggered
     */
    if (tacitActions === undefined) {
        return ACTIONS;
    }

    /**
     * Only return the valid actions
     */
    return tacitActions.filter((action: unknown) => {
        return safeParseAction(action).success;
    });
};

const setActions = async (actions: TriggeredAction[]) => {
    await browser.storage.sync.set({
        [TACIT_ACTIONS_STORAGE_KEY]: actions,
    });
};

type SafeParseResult<T, E> =
    | { success: true; data: T }
    | { success: false; error: E };
const safeParseAction = (
    _action: unknown
): SafeParseResult<TriggeredAction, string> => {
    try {
        assertActionIsObject(_action);
        assertActionKindIsValid(_action);
        assertActionPriorityIsValid(_action);

        if (_action.kind === 'input') {
            assertActionInputIsValid(_action);
        }

        if (_action.kind === 'select') {
            assertActionSelectIsValid(_action);
        }

        if (_action.kind === 'click') {
            assertActionClickIsValid(_action);
        }

        if (_action.kind === 'checkbox') {
            assertActionCheckboxIsValid(_action);
        }
    } catch (error) {
        console.error(`[tacit] Safe parse error - ${error}`);
        return {
            success: false,
            // @ts-expect-error - it's an error with a message for sure
            error: String(error.message),
        };
    }

    return {
        success: true,
        /**
         * @unsafe 'as'
         */
        data: _action as TriggeredAction,
    };
};
