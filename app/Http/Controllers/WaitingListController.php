<?php

namespace App\Http\Controllers;

use App\Mail\WaitingListConfirmationMail;
use App\Models\WaitingList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class WaitingListController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render('waiting-list');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:waiting_lists,email'],
        ]);

        WaitingList::create($validated);

        Mail::to($validated['email'])->send(
            new WaitingListConfirmationMail($validated['name'])
        );

        return back()->with('success', 'You\'ve been added to our waiting list! Check your email for confirmation.');
    }
}
