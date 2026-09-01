import { useForm, Head, usePage } from '@inertiajs/react';
import { Camera, Check, ShieldCheck } from 'lucide-react';
import React from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { Button, Badge } from '@/components/dashboard/ui';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props as any;
    const [preview, setPreview] = React.useState<string | null>(auth.user.avatar_url);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        _method: 'patch',
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('avatar', file);
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ProfileController.update().url, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <div className="space-y-12">
            <Head title="Profile Settings" />

            <div className="space-y-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row md:gap-8">
                    <div className="group relative">
                        <img
                            src={preview || '/images/01-ulo-team-studio.jpg'}
                            className="h-20 w-20 rounded-[32px] object-cover ring-4 ring-border-subtle md:h-24 md:w-24"
                            alt=""
                        />
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[32px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <Camera size={20} className="text-white" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleAvatarChange}
                            accept="image/*"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-text-primary md:text-xl">
                            {auth.user.name}
                        </h3>
                        <p className="text-xs text-text-muted md:text-sm">
                            Custodian since {new Date(auth.user.created_at).getFullYear()}
                        </p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 text-[10px] font-bold tracking-widest text-accent-gold uppercase hover:underline"
                        >
                            Change Avatar
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Full Name
                            </label>
                            <input
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                className="w-full rounded-2xl border border-border-subtle bg-bg-dark px-5 py-3.5 text-sm text-text-primary transition-all outline-none focus:border-accent-gold/50 md:px-6 md:py-4"
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <label className="ml-1 text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                Role in House
                            </label>
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-subtle bg-bg-dark p-4 md:p-5">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <ShieldCheck
                                        size={18}
                                        className="shrink-0 text-accent-gold"
                                    />
                                    <span className="truncate text-xs font-bold text-text-primary md:text-sm">
                                        House Administrator
                                    </span>
                                </div>
                                <Badge className="shrink-0 border border-accent-gold/30 text-[9px] md:text-[10px]">
                                    Primary
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            variant="primary"
                            icon={Check}
                            className="w-full px-8 shadow-lg shadow-accent-gold/10 sm:w-auto"
                        >
                            Save Profile
                        </Button>
                    </div>
                </form>
            </div>

            <div className="h-px w-full bg-border-subtle" />

            <div className="space-y-6">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-red-500">Danger Zone</h4>
                    <p className="text-sm text-text-muted">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                </div>
                <DeleteUser />
            </div>
        </div>
    );
}
