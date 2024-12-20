export const COMMANDS = {
    RUN: 'run-actions',
};

export interface ToastUpdatePayload {
    progress: `${number}%`;
    frame: number;
}

export type TacitMessage = { key: string } & (
    | { key: 'START' }
    | { key: 'TOAST_SHOW' }
    | ({ key: 'TOAST_UPDATE_INTENT' } & ToastUpdatePayload)
    | ({ key: 'TOAST_UPDATE' } & ToastUpdatePayload)
);
export type MessageKey = TacitMessage['key'];
