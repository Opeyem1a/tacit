import { createElement } from '../../core/elements';
import { ACTIONS, TriggeredAction } from '../../core/actions';
import { sortActions } from '../../core/utils';
import {
    assertActionCheckboxIsValid,
    assertActionClickIsValid,
    assertActionInputIsValid,
    assertActionKindIsValid,
    assertActionPriorityIsValid,
    assertActionSelectIsValid,
} from '../../core/assertions';

window.addEventListener('load', async () => {
    const root = document.getElementById('root');
    if (!root) {
        throw new Error('Root element could not be found');
    }

    const actions = sortActions(await getActions());
    root.appendChild(component({ actions }));
});

const component = ({ actions }: { actions: readonly TriggeredAction[] }) => {
    return createElement<'form'>({
        tag: 'form',
        children: [
            createElement<'div'>({
                tag: 'div',
                attributes: {
                    classNames: 'flex flex-col py-4 px-4 gap-4',
                },
                children: [
                    createElement<'div'>({
                        tag: 'div',
                        attributes: {
                            classNames: 'flex gap-3',
                        },
                        children: [
                            createElement<'div'>({
                                tag: 'div',
                                attributes: {
                                    classNames: 'rounded-lg w-4 bg-[#ff00c8]',
                                },
                            }),
                            createElement<'div'>({
                                tag: 'div',
                                attributes: {
                                    classNames: 'flex flex-col gap-1',
                                },
                                children: [
                                    createElement<'label'>({
                                        tag: 'label',
                                        attributes: {
                                            classNames: 'text-base font-medium',
                                        },
                                        children: ['Configured actions'],
                                    }),
                                    createElement<'p'>({
                                        tag: 'p',
                                        attributes: {
                                            classNames: 'text-sm text-gray-700',
                                        },
                                        children: [
                                            `
                                            This array defines the "actions" that will be attempted by Tacit
                                            when the command is run. I haven't gotten around to writing any 
                                            docs yet, but if the schema makes sense to you then have fun
                                            (it has validation and won't let you save something wonky).
                                            `,
                                        ],
                                    }),
                                    createElement<'div'>({
                                        tag: 'div',
                                        attributes: {
                                            classNames:
                                                'flex justify-between items-center gap-2 mt-2',
                                        },
                                        children: [
                                            createElement<'button'>({
                                                tag: 'button',
                                                attributes: {
                                                    classNames:
                                                        'h-9 rounded-md px-3 text-sm text-blue-600 bg-white hover:bg-blue-50/90 transition-colors',
                                                },
                                                children: [
                                                    'Reset to default (Shopify checkout)',
                                                ],
                                            }),
                                            createElement<'div'>({
                                                tag: 'div',
                                                attributes: {
                                                    classNames: 'flex gap-2',
                                                },
                                                children: [
                                                    createElement<'button'>({
                                                        tag: 'button',
                                                        attributes: {
                                                            classNames:
                                                                'h-9 rounded-md px-3 text-sm bg-white text-gray-900 hover:bg-gray-50/90 transition-colors border border-input',
                                                        },
                                                        children: ['Discard'],
                                                    }),
                                                    createElement<'button'>({
                                                        tag: 'button',
                                                        attributes: {
                                                            classNames:
                                                                'h-9 rounded-md px-3 text-sm bg-gray-900 text-gray-50 hover:bg-gray-900/90 transition-colors',
                                                        },
                                                        children: ['Save'],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    createElement<'textarea'>({
                        tag: 'textarea',
                        attributes: {
                            // the number of lines a single actions takes is ~6, this is a gross approximation + the 2 for []
                            rows: String(actions.length * 6 + 2),
                            classNames:
                                'text-sm bg-gray-800 text-gray-50 font-mono p-2.5 rounded-xl border border-gray-600',
                        },
                        effects: {
                            postInit: (element) => {
                                element.value = JSON.stringify(
                                    actions,
                                    undefined,
                                    2
                                );
                            },
                        },
                    }),
                ],
            }),
        ],
    });
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
    return tacitActions.filter((action) => {
        return safeParseAction(action).success;
    });
};

// const setActions = async (_actions: TriggeredAction[]) => {
//     const result = safeParseActions(_actions);
//
//     if (!result.success) {
//         // todo: this is suspect
//         throw new Error(result.error);
//     }
//
//     await browser.storage.sync.set({
//         [TACIT_ACTIONS_STORAGE_KEY]: result.data,
//     });
// };

type SafeParseResult<T, E> =
    | { success: true; data: T }
    | { success: false; error: E };
const safeParseAction = (
    _action: unknown
): SafeParseResult<TriggeredAction, string> => {
    try {
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
            error,
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

// const validateActions = (
//     _actions: unknown
// ) => {
//     // todo: safe parse
//     // todo: extra validations (max number of actions, priorities can't be negative or ludicrous, etc)
// }
