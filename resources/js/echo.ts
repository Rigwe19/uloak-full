import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

type ReverbEcho = Echo<'reverb'>;

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: ReverbEcho;
    }
}

window.Pusher = Pusher;

let echoInstance: ReverbEcho | null = null;

export function initEcho(): ReverbEcho | null {
    // console.log('🔥 initEcho() called');

    if (echoInstance) {
        return echoInstance;
    }

    const key = import.meta.env.VITE_REVERB_APP_KEY;

    if (!key) {
        console.error('VITE_REVERB_APP_KEY is missing');

        return null;
    }

    const host = import.meta.env.VITE_REVERB_HOST || 'uloak.test';
    const port = Number(import.meta.env.VITE_REVERB_PORT || 8080);
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'https';

    const useTLS = scheme === 'https';

    // console.log('Initializing Reverb:', {
    //     key,
    //     host,
    //     port,
    //     scheme,
    //     useTLS,
    // });

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key,

        wsHost: host,
        wsPort: port,
        wssPort: port,

        forceTLS: useTLS,

        enabledTransports: ['ws', 'wss'],
    });

    window.Echo = echoInstance;

    return echoInstance;
}

export function getEcho(): ReverbEcho | null {
    return echoInstance ?? initEcho();
}

if (typeof window !== 'undefined') {
    // console.log('🔥 ECHO MODULE LOADED');
    initEcho();
}
