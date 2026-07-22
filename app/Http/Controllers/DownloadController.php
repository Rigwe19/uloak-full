<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateEventZip;
use App\Jobs\GenerateRoomZip;
use App\Models\DownloadRequest;
use App\Models\Event;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DownloadController extends Controller
{
    /**
     * Request a download and queue ZIP generation.
     */
    public function requestDownload(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'type' => ['required', 'string', 'in:room,event'],
            'slug' => ['required', 'string'],
        ]);

        if ($validated['type'] === 'room') {
            $room = Room::where('slug', $validated['slug'])->firstOrFail();

            abort_unless($room->allow_download, 403);

            GenerateRoomZip::dispatch($room, $validated['email']);
        } else {
            $event = Event::where('slug', $validated['slug'])->firstOrFail();

            abort_unless($event->allow_download, 403);

            GenerateEventZip::dispatch($event, $validated['email']);
        }

        return back()->with('success', 'Your download is being prepared. You will receive an email with the download link shortly.');
    }

    /**
     * Serve the downloadable ZIP file.
     */
    public function download(string $token)
    {
        $downloadRequest = DownloadRequest::where('token', $token)->firstOrFail();

        if ($downloadRequest->isExpired()) {
            abort(410, 'This download link has expired. Downloads are only available for 48 hours.');
        }

        if (! Storage::exists($downloadRequest->zip_path)) {
            abort(404, 'The requested file could not be found.');
        }

        $downloadRequest->update(['downloaded_at' => now()]);

        $zipFullPath = Storage::disk('public')->path($downloadRequest->zip_path);

        return response()->download($zipFullPath)->deleteFileAfterSend(false);
    }
}
