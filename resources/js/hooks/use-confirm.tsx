import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default';
}

interface ConfirmContextValue {
    confirm: (messageOrOptions: string | ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<{
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    } | null>(null);

    const confirm = useCallback(
        (messageOrOptions: string | ConfirmOptions): Promise<boolean> => {
            const options: ConfirmOptions =
                typeof messageOrOptions === 'string'
                    ? { message: messageOrOptions }
                    : messageOrOptions;

            return new Promise((resolve) => {
                setState({ options, resolve });
            });
        },
        [],
    );

    const handleConfirm = useCallback(() => {
        state?.resolve(true);
        setState(null);
    }, [state]);

    const handleCancel = useCallback(() => {
        state?.resolve(false);
        setState(null);
    }, [state]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                isOpen={state !== null}
                title={state?.options.title}
                message={state?.options.message ?? ''}
                confirmText={state?.options.confirmText}
                cancelText={state?.options.cancelText}
                variant={state?.options.variant}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm(): (
    messageOrOptions: string | ConfirmOptions,
) => Promise<boolean> {
    const ctx = useContext(ConfirmContext);

    if (!ctx) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }

    return ctx.confirm;
}
