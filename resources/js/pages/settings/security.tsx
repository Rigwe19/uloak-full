import { Form, Head } from '@inertiajs/react';
import { ShieldCheck, Lock, Globe, FileUp, Database, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/dashboard/ui';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';
import React from 'react';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    passwordRules,
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

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

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
                    {...(SecurityController.update as any).form()}
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

                                <Form {...(disable as any).form()}>
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
                                            {...(enable as any).form()}
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
