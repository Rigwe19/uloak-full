import React, { useState } from 'react';
import {
    Save,
    CheckCircle,
    Globe,
    Mail,
    Palette,
    Shield,
    Info,
} from 'lucide-react';
import { Button } from '../../components/UI';

export default function GlobalSettings() {
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Uloak',
        adminEmail: 'admin@uloak.com',
        contactEmail: 'hello@uloak.com',
        defaultLanguage: 'English',
        maintenanceMode: false,
        accentColor: '#C6A15B',
        allowPublicRooms: true,
    });

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }, 1000);
    };

    return (
        <div className="animate-in space-y-10 duration-700 fade-in">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                        Global Settings
                    </h1>
                    <p className="mt-2 text-text-muted">
                        Manage your platform's core identity and operational
                        configuration.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {success && (
                        <span className="flex animate-in items-center gap-2 text-xs font-medium text-green-400 slide-in-from-right-4">
                            <CheckCircle size={14} /> Settings updated
                        </span>
                    )}
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <div className="space-y-10 lg:col-span-2">
                    {/* General Branding */}
                    <div className="space-y-8 rounded-3xl border border-border-subtle bg-surface p-8">
                        <div className="flex items-center gap-4 text-accent-gold">
                            <Globe size={20} />
                            <h3 className="text-sm font-bold tracking-widest uppercase">
                                Platform Branding
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            siteName: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-gold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Default Language
                                </label>
                                <select
                                    value={settings.defaultLanguage}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            defaultLanguage: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-gold"
                                >
                                    <option>English</option>
                                    <option>French</option>
                                    <option>Spanish</option>
                                    <option>Yoruba</option>
                                    <option>Igbo</option>
                                    <option>Twi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8 rounded-3xl border border-border-subtle bg-surface p-8">
                        <div className="flex items-center gap-4 text-accent-gold">
                            <Mail size={20} />
                            <h3 className="text-sm font-bold tracking-widest uppercase">
                                Communication
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Admin User Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.adminEmail}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            adminEmail: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-gold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Public Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            contactEmail: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-gold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-8 rounded-3xl border border-border-subtle bg-surface p-8">
                        <div className="flex items-center gap-4 text-accent-gold">
                            <Palette size={20} />
                            <h3 className="text-sm font-bold tracking-widest uppercase">
                                Visual Identity
                            </h3>
                        </div>

                        <div className="flex items-center gap-6">
                            <div
                                className="h-12 w-12 rounded-xl border border-white/10 bg-accent-gold"
                                style={{
                                    backgroundColor: settings.accentColor,
                                }}
                            />
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
                                    Primary Accent Color
                                </label>
                                <input
                                    type="text"
                                    value={settings.accentColor}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            accentColor: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-border-subtle bg-bg-dark px-4 py-3 font-mono text-sm text-text-primary outline-none focus:border-accent-gold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Security & Access */}
                    <div className="space-y-6 rounded-3xl border border-border-subtle bg-surface p-8">
                        <div className="mb-2 flex items-center gap-4 text-accent-gold">
                            <Shield size={20} />
                            <h3 className="text-sm font-bold tracking-widest uppercase">
                                Access Control
                            </h3>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-text-primary">
                                    Maintenance Mode
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    Restrict access to admins only.
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        maintenanceMode:
                                            !settings.maintenanceMode,
                                    })
                                }
                                className={`relative h-6 w-12 rounded-full transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-surface-light border border-border-subtle'}`}
                            >
                                <div
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-text-primary">
                                    Public Sharing
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    Allow non-users to view shared rooms.
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        allowPublicRooms:
                                            !settings.allowPublicRooms,
                                    })
                                }
                                className={`relative h-6 w-12 rounded-full transition-all ${settings.allowPublicRooms ? 'bg-accent-gold' : 'bg-surface-light border border-border-subtle'}`}
                            >
                                <div
                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${settings.allowPublicRooms ? 'right-1' : 'left-1'}`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 rounded-3xl border border-accent-gold/20 bg-accent-gold/5 p-6">
                        <Info className="shrink-0 text-accent-gold" size={20} />
                        <p className="text-xs leading-relaxed text-text-muted">
                            Global settings affect the entire platform. Changes
                            are applied instantly to the application's
                            configuration store.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
