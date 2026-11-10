<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrivacySettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/privacy', [
            'title' => 'Privacy Settings - Ulo of Stories',
            'settings' => array_map(
                fn (string $key, bool $active) => [
                    'id' => $key,
                    'title' => match ($key) {
                        'global_discovery' => 'Global Discovery',
                        'member_uploads' => 'Member Uploads',
                        'high_fidelity' => 'High Fidelity Archive',
                        default => $key,
                    },
                    'desc' => match ($key) {
                        'global_discovery' => 'Allow distant family to find this house via public search.',
                        'member_uploads' => 'Let any member upload stories without moderator approval.',
                        'high_fidelity' => 'Enable full-quality archiving (uses more storage).',
                        default => '',
                    },
                    'active' => $active,
                ],
                array_keys($request->user()->privacySettings()),
                array_values($request->user()->privacySettings())
            ),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.id' => ['required', 'string', 'in:global_discovery,member_uploads,high_fidelity'],
            'settings.*.active' => ['required', 'boolean'],
        ]);

        $merged = array_merge(User::privacyDefaults(), $request->user()->privacySettings());
        foreach ($validated['settings'] as $setting) {
            $merged[$setting['id']] = (bool) $setting['active'];
        }

        $request->user()->update(['privacy_settings' => $merged]);

        return back()->with('success', 'Privacy settings saved.');
    }
}
