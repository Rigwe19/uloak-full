<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateEventZip;
use App\Jobs\GenerateRoomZip;
use App\Models\DownloadRequest;
use App\Models\Event;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
        logger()->info('download zip mail', [
            'validated' => $validated,
        ]);

        if ($validated['type'] === 'room') {
            $room = Room::where('slug', $validated['slug'])->firstOrFail();

            if (! $this->isDownloadAllowed($room, $request->user())) {
                return Inertia::render('error', [
                    'status' => 403,
                    'message' => 'Download is disabled for this room.',
                ]);
            }

            GenerateRoomZip::dispatch($room, $validated['email']);
        } else {
            $event = Event::where('slug', $validated['slug'])->firstOrFail();

            if (! $this->isDownloadAllowed($event, $request->user())) {
                return Inertia::render('error', [
                    'status' => 403,
                    'message' => 'Download is disabled for this event.',
                ]);
            }

            GenerateEventZip::dispatch($event, $validated['email']);
        }

        return back()->with('success', 'Your download is being prepared. You will receive an email with the download link shortly.');
    }

    protected function isDownloadAllowed(Event|Room $model, ?User $user): bool
    {
        if ($user && ! empty($model->created_by) && $model->created_by === $user->getKey()) {
            return true;
        }

        return (bool) $model->allow_download;
    }

    /**
     * Serve the downloadable ZIP file.
     */
    public function download(string $token)
    {
        $downloadRequest = DownloadRequest::where('token', $token)->firstOrFail();

        if ($downloadRequest->isExpired()) {
            return Inertia::render('error', [
                'status' => 410,
                'message' => 'This download link has expired. Downloads are only available for 48 hours.',
            ]);
        }

        $zipFullPath = Storage::disk('public')->path($downloadRequest->zip_path);

        if (! file_exists($zipFullPath)) {
            return Inertia::render('error', [
                'status' => 404,
                'message' => 'The requested file could not be found.',
            ]);
        }

        $downloadRequest->update(['downloaded_at' => now()]);

        $response = response()->download($zipFullPath);

        return $response->deleteFileAfterSend(false);
    }
}
