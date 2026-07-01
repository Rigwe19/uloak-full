import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import { Button } from '@/components/dashboard/ui';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import { Form, Head } from '@inertiajs/react';
import { Check, Fingerprint, Lock, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function convertCredentialOptions(options: any): any {
    const converted = { ...options };

    if (converted.challenge && typeof converted.challenge === 'string') {
        converted.challenge = base64urlToArrayBuffer(converted.challenge);
    }

    if (converted.user?.id && typeof converted.user.id === 'string') {
        converted.user = { ...converted.user, id: base64urlToArrayBuffer(converted.user.id) };
    }

    if (converted.excludeCredentials) {
        converted.excludeCredentials = converted.excludeCredentials.map((cred: any) => ({
            ...cred,
            id: typeof cred.id === 'string' ? base64urlToArrayBuffer(cred.id) : cred.id,
        }));
    }

    return converted;
}

type Passkey = {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string;
    authenticator?: string;
};

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
    passkeys?: Passkey[];
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    passwordRules,
    passkeys: initialPasskeys = [],
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    const [passkeys, setPasskeys] = useState<Passkey[]>(initialPasskeys);
    const [isPasskeySupported, setIsPasskeySupported] = useState(false);
    const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
    const [passkeyName, setPasskeyName] = useState('');
    const [showPasskeyNameInput, setShowPasskeyNameInput] = useState(false);
    const [deletingPasskeyId, setDeletingPasskeyId] = useState<number | null>(null);

    useEffect(() => {
        setIsPasskeySupported(
            typeof window !== 'undefined' &&
                window.PublicKeyCredential !== undefined,
        );
    }, []);

    const fetchPasskeys = useCallback(async () => {
        try {
            const response = await fetch('/user/passkeys');
            if (response.ok) {
                const data = await response.json();
                setPasskeys(data.passkeys ?? []);
            }
        } catch {
            // passkeys not available
        }
    }, []);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    const handleRegisterPasskey = async () => {
        if (!isPasskeySupported || isRegisteringPasskey) return;

        setIsRegisteringPasskey(true);

        try {
            const optionsResponse = await fetch('/user/passkeys/options', {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!optionsResponse.ok) {
                const errorText = await optionsResponse.text();
                throw new Error(`Failed to get registration options: ${errorText}`);
            }

            const responseData = await optionsResponse.json();
            const creationOptions = convertCredentialOptions(responseData.options);

            const credential = await navigator.credentials.create({
                publicKey: creationOptions,
            });

            if (!credential) {
                throw new Error('Passkey registration cancelled');
            }

            const pubKeyCred = credential as PublicKeyCredential;
            const attestationResponse = pubKeyCred.response as AuthenticatorAttestationResponse;

            const storeResponse = await fetch('/user/passkeys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    name: passkeyName || `Passkey ${new Date().toLocaleDateString()}`,
                    id: pubKeyCred.id,
                    type: pubKeyCred.type,
                    rawId: Array.from(new Uint8Array(pubKeyCred.rawId)),
                    response: {
                        clientDataJSON: Array.from(new Uint8Array(attestationResponse.clientDataJSON)),
                        attestationObject: Array.from(new Uint8Array(attestationResponse.attestationObject)),
                        transports: attestationResponse.getTransports ? attestationResponse.getTransports() : [],
                    },
                }),
            });

            if (storeResponse.ok) {
                setShowPasskeyNameInput(false);
                setPasskeyName('');
                await fetchPasskeys();
            } else {
                const errorData = await storeResponse.json();
                throw new Error(errorData.message || 'Failed to register passkey');
            }
        } catch (error) {
            console.error('Passkey registration error:', error);
        } finally {
            setIsRegisteringPasskey(false);
        }
    };

    const handleDeletePasskey = async (passkeyId: number) => {
        setDeletingPasskeyId(passkeyId);

        try {
            const response = await fetch(`/user/passkeys/${passkeyId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
                },
            });

            if (response.ok) {
                await fetchPasskeys();
            }
        } catch (error) {
            console.error('Failed to delete passkey:', error);
        } finally {
            setDeletingPasskeyId(null);
        }
    };

    return (
        <div className="space-y-12">
            <Head title="Security" />

            {/* Password Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <Lock size={20} className="text-accent-gold" />
                    <h3 className="text-xl font-bold text-text-primary">Update Password</h3>
                </div>

                <Form
                    action={SecurityController.update().url}
                    method="post"
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Current Password
                                </label>
                                <PasswordInput
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.current_password} />
                            </div>

                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    New Password
                                </label>
                                <PasswordInput
                                    ref={passwordInput}
                                    name="password"
                                    className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-2">
                                <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Confirm New Password
                                </label>
                                <PasswordInput
                                    name="password_confirmation"
                                    className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="pt-2 sm:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    variant="primary"
                                    icon={Check}
                                    className="w-full px-8 shadow-lg shadow-accent-gold/10 sm:w-auto"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {/* Passkeys Section */}
            {isPasskeySupported && (
                <>
                    <div className="h-px w-full bg-border-subtle" />
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <Fingerprint size={20} className="text-accent-gold" />
                            <h3 className="text-xl font-bold text-text-primary">Passkeys</h3>
                        </div>

                        <p className="text-sm text-text-muted leading-relaxed max-w-xl">
                            Use your device's biometric or PIN to sign in quickly and securely.
                        </p>

                        {passkeys.length > 0 && (
                            <div className="space-y-3">
                                {passkeys.map((passkey) => (
                                    <div
                                        key={passkey.id}
                                        className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-dark/50 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Fingerprint size={18} className="text-accent-gold" />
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">
                                                    {passkey.name}
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    {passkey.authenticator ?? 'Passkey'} &middot; Added {new Date(passkey.created_at).toLocaleDateString()}
                                                    {passkey.last_used_at && ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePasskey(passkey.id)}
                                            disabled={deletingPasskeyId === passkey.id}
                                            className="rounded-xl p-2 text-text-muted transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                            title="Remove passkey"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showPasskeyNameInput ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                        Passkey Name
                                    </label>
                                    <input
                                        type="text"
                                        value={passkeyName}
                                        onChange={(e) => setPasskeyName(e.target.value)}
                                        placeholder="e.g., My iPhone, YubiKey"
                                        className="mt-2 w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleRegisterPasskey}
                                        disabled={isRegisteringPasskey}
                                        variant="primary"
                                        icon={Fingerprint}
                                    >
                                        {isRegisteringPasskey ? 'Registering...' : 'Register Passkey'}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasskeyNameInput(false);
                                            setPasskeyName('');
                                        }}
                                        className="rounded-2xl border border-border-subtle bg-surface px-6 py-3.5 text-sm text-text-muted transition-all hover:text-text-primary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => setShowPasskeyNameInput(true)}
                                variant="primary"
                                icon={Plus}
                            >
                                Add Passkey
                            </Button>
                        )}
                    </div>
                </>
            )}

            {canManageTwoFactor && (
                <>
                    <div className="h-px w-full bg-border-subtle" />
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-accent-gold" />
                            <h3 className="text-xl font-bold text-text-primary">Two-Factor Authentication</h3>
                        </div>

                        {twoFactorEnabled ? (
                            <div className="flex flex-col items-start space-y-6">
                                <p className="text-sm text-text-muted leading-relaxed max-w-xl">
                                    You will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone.
                                </p>

                                <Form action={disable().url} method={disable().method}>
                                    {({ processing }) => (
                                        <Button
                                            variant="danger"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Disable 2FA
                                        </Button>
                                    )}
                                </Form>

                                <TwoFactorRecoveryCodes
                                    recoveryCodesList={recoveryCodesList}
                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                    errors={errors}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-start space-y-6">
                                <p className="text-sm text-text-muted leading-relaxed max-w-xl">
                                    When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone.
                                </p>

                                <div>
                                    {hasSetupData ? (
                                        <Button
                                            onClick={() => setShowSetupModal(true)}
                                            variant="primary"
                                            icon={ShieldCheck}
                                        >
                                            Continue Setup
                                        </Button>
                                    ) : (
                                        <Form
                                            action={enable().url}
                                            method={enable().method}
                                            onSuccess={() => setShowSetupModal(true)}
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    variant="primary"
                                                    icon={ShieldCheck}
                                                >
                                                    Enable 2FA
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            </div>
                        )}

                        <TwoFactorSetupModal
                            isOpen={showSetupModal}
                            onClose={() => setShowSetupModal(false)}
                            requiresConfirmation={requiresConfirmation}
                            twoFactorEnabled={twoFactorEnabled}
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            clearSetupData={clearSetupData}
                            fetchSetupData={fetchSetupData}
                            errors={errors}
                        />
                    </div>
                </>
            )}
        </div>
    );
}