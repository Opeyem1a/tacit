export const COMMANDS = {
    RUN: 'run-actions',
};

export interface ToastUpdatePayload {
    progress: `${number}%`;
    frame: number;
}

export interface TacitMessageBase {
    key: string;
    /**
     * Instance is a unique identifier of a "run" of tacit.
     * Hitting the command creates an "instance", hitting
     * it again would be a new "instance" with a different id
     */
    instance: number;
}

export type TacitMessage = TacitMessageBase &
    (
        | { key: 'START' }
        | { key: 'TOAST_SHOW' }
        | ({ key: 'TOAST_UPDATE_INTENT' } & ToastUpdatePayload)
        | ({ key: 'TOAST_UPDATE' } & ToastUpdatePayload)
    );
export type MessageKey = TacitMessage['key'];
