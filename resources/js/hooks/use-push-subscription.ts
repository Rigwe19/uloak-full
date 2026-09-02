import { useCallback, useEffect, useRef } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const output = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        output[i] = rawData.charCodeAt(i);
    }

    return output;
}

async function doSubscribe(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();

        if (existing) {
            return true;
        }

        const resp = await fetch('/push-public-key');
        const { publicKey } = (await resp.json()) as { publicKey: string };

        if (!publicKey) {
            return false;
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                publicKey,
            ) as unknown as string,
        });

        const subData = subscription.toJSON();
        await fetch('/push-subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
            },
            body: JSON.stringify({
                endpoint: subData.endpoint,
                p256dh: subData.keys?.p256dh,
                auth: subData.keys?.auth,
            }),
        });

        return true;
    } catch {
        return false;
    }
}

/**
 * Hook to manage web push notification subscriptions.
 */
export function usePushSubscription() {
    const subscribed = useRef(false);

    const trySubscribe = useCallback(async () => {
        if (subscribed.current) {
            return;
        }

        if (Notification.permission === 'granted') {
            const ok = await doSubscribe();

            if (ok) {
                subscribed.current = true;
            }
        }
    }, []);

    useEffect(() => {
        // Calling requestPermission() on mount makes the browser
        // notification icon appear in the address bar.
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Subscribe if permission already granted
        trySubscribe();

        // Listen for permission changes — fires when user clicks the
        // browser notification icon and grants/denies permission
        const handlePermissionChange = () => {
            if (Notification.permission === 'granted') {
                trySubscribe();
            }
        };

        // Modern browsers support the 'permissionchange' event on Notification
        if ('onpermissionchange' in Notification) {
            (Notification as any).onpermissionchange = handlePermissionChange;
        }

        // Fallback: also check on focus/visibility change
        const handleVisibility = () => {
            if (
                document.visibilityState === 'visible' &&
                Notification.permission === 'granted'
            ) {
                trySubscribe();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [trySubscribe]);

    const enableNotifications = useCallback(async (): Promise<boolean> => {
        if (subscribed.current) {
            return true;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                return false;
            }
        }

        if (Notification.permission === 'granted') {
            const ok = await doSubscribe();

            if (ok) {
                subscribed.current = true;
            }

            return ok;
        }

        return false;
    }, []);

    return { enableNotifications };
}
