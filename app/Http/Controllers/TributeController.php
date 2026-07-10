<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessTributeAudioTranscription;
use App\Media\MediaManager;
use App\Models\Candle;
use App\Models\Room;
use App\Models\Tribute;
use App\Notifications\TributeReceived;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class TributeController extends Controller
{
    public function __construct(
        protected ActivityLogger $activityLogger,
        protected MediaManager $mediaManager,
    ) {}

    public function index(Room $room)
    {
        $tributes = $room->tributes()->where('is_approved', true)->latest()->get();
        $candles = $room->candles()->where('is_approved', true)->get();

        return back()->with(['tributes' => $tributes, 'candles' => $candles]);
    }

    public function pending(Room $room)
    {
        $tributes = $room->tributes()->where('is_approved', false)->latest()->get();

        return back()->with('tributes', $tributes);
    }

    public function store(Request $request, Room $room): RedirectResponse
    {
        $isAudioMode = $request->boolean('is_audio_mode');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:255'],
            'message' => [$isAudioMode ? 'nullable' : 'required', 'string', 'max:5000'],
            'quote' => ['nullable', 'string', 'max:1000'],
            'images' => ['nullable', 'array'],
            'images.*' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'video' => ['nullable', 'file', 'mimes:mp4,mov,webm', 'max:51200'],
            'audio' => ['nullable', 'string'],
        ]);

        // Save uploaded images to storage
        $savedImagePaths = [];
        if (! empty($validated['images'])) {
            foreach ($validated['images'] as $image) {
                $media = $this->mediaManager->uploadImage($image);
                $savedImagePaths[] = $media->url();
            }
        }

        // Save uploaded video to storage
        $savedVideoPath = null;
        if (! empty($validated['video'])) {
            $media = $this->mediaManager->uploadVideo($validated['video']);
            $savedVideoPath = $media->url();
        }

        // Save base64 audio to storage (audio is still recorded in browser as base64)
        $savedAudioPath = null;
        if (! empty($validated['audio']) && str_starts_with($validated['audio'], 'data:')) {
            [$meta, $data] = explode(';', $validated['audio'], 2);
            $mime = str_replace('data:', '', $meta);
            $extension = match ($mime) {
                'audio/webm' => 'webm',
                'audio/ogg' => 'ogg',
                'audio/mp4' => 'mp4',
                'audio/mpeg' => 'mp3',
                'audio/wav' => 'wav',
                default => 'bin',
            };
            $base64Data = str_replace('base64,', '', $data);
            $binaryData = base64_decode($base64Data);
            $filename = uniqid('tribute_', true).'.'.$extension;
            Storage::disk('public')->put('tributes/'.$room->id.'/audio/'.$filename, $binaryData);
            $savedAudioPath = '/tributes/'.$room->id.'/audio/'.$filename;
        }

        // Auto-approve tributes for birthday rooms
        $autoApprove = $room->room_type === 'birthday';

        // Save tribute
        $tribute = $room->tributes()->create([
            'name' => $validated['name'],
            'relationship' => $validated['relationship'] ?? null,
            'message' => $validated['message'] ?? '',
            'quote' => $validated['quote'] ?? null,
            'images' => $savedImagePaths,
            'video' => $savedVideoPath,
            'audio' => $savedAudioPath,
            'audio_transcript_status' => $savedAudioPath ? 'processing' : 'pending',
            'is_approved' => $autoApprove,
        ]);

        if ($request->user()) {
            $this->activityLogger->log(
                "Created tribute for room: {$room->name}",
                Tribute::class,
                (string) $tribute->id,
                ['room_id' => $room->id, 'room_name' => $room->name]
            );
        } else {
            $this->activityLogger->logForGuest(
                "Created tribute for room: {$room->name}",
                ['guest_name' => $validated['name'], 'guest_email' => $request->input('email')],
                Tribute::class,
                (string) $tribute->id
            );
        }

        // Dispatch audio transcription job if audio was provided
        if ($savedAudioPath) {
            ProcessTributeAudioTranscription::dispatch($tribute);
        }

        // Notify the room creator about the new tribute
        if ($room->creator) {
            $room->creator->notify(new TributeReceived($tribute));
        }

        $message = $autoApprove
            ? 'Your wish has been submitted and is now live!'
            : 'Your tribute has been submitted and is pending approval.';

        return back()->with('success', $message);
    }

    public function lightCandle(Request $request, Room $room): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:5000'],
            'candle_type' => ['required', 'string', 'max:255'],
        ]);
        $candle = $room->candles()->create([
            'name' => $validated['name'],
            'message' => $validated['message'],
            'candle_type' => $validated['candle_type'],
            'is_approved' => false,
        ]);

        if ($request->user()) {
            $this->activityLogger->log(
                "Lit candle for room: {$room->name}",
                Candle::class,
                (string) $candle->id,
                ['room_id' => $room->id, 'room_name' => $room->name]
            );
        } else {
            $this->activityLogger->logForGuest(
                "Lit candle for room: {$room->name}",
                ['guest_name' => $validated['name']],
                Candle::class,
                (string) $candle->id
            );
        }

        return back()->with('success', 'Candle lit successfully.');
    }

    public function approve(Tribute $tribute): RedirectResponse
    {
        $tribute->update(['is_approved' => true]);

        $this->activityLogger->log(
            "Approved tribute for room: {$tribute->room->name}",
            Tribute::class,
            (string) $tribute->id,
            ['room_id' => $tribute->room->id, 'room_name' => $tribute->room->name]
        );

        return back()->with('success', 'Tribute approved and published.');
    }

    public function approveCandle(Candle $candle): RedirectResponse
    {
        $candle->update(['is_approved' => true]);

        return back()->with('success', 'Candle approved and published.');
    }

    public function destroy(Tribute $tribute): RedirectResponse
    {
        $tribute->delete();

        $this->activityLogger->log(
            "Deleted tribute from room: {$tribute->room->name}",
            Tribute::class,
            (string) $tribute->id,
            ['room_id' => $tribute->room->id, 'room_name' => $tribute->room->name]
        );

        return back()->with('success', 'Tribute deleted.');
    }

    /**
     * Download all media (images + video) from a tribute as a ZIP file.
     */
    public function downloadMedia(Tribute $tribute)
    {
        $files = [];

        // Collect images
        if (! empty($tribute->images)) {
            foreach ($tribute->images as $image) {
                $relativePath = preg_replace('#^storage/#', '', ltrim($image, '/'));
                $absolutePath = Storage::disk('public')->path($relativePath);
                if (file_exists($absolutePath)) {
                    $files[] = [
                        'path' => $absolutePath,
                        'name' => 'image_'.basename($relativePath),
                    ];
                }
            }
        }

        // Collect video
        if (! empty($tribute->video)) {
            $relativePath = preg_replace('#^storage/#', '', ltrim($tribute->video, '/'));
            $absolutePath = Storage::disk('public')->path($relativePath);
            if (file_exists($absolutePath)) {
                $files[] = [
                    'path' => $absolutePath,
                    'name' => 'video_'.basename($relativePath),
                ];
            }
        }

        if (empty($files)) {
            return back()->with('error', 'No media files found for this tribute.');
        }

        // Create ZIP
        $sanitizedName = Str::slug($tribute->name, '_');
        $zipFilename = "tribute_{$sanitizedName}_media.zip";
        $zipPath = sys_get_temp_dir().'/'.$zipFilename;

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return back()->with('error', 'Could not create ZIP file.');
        }

        foreach ($files as $file) {
            $zip->addFile($file['path'], $file['name']);
        }
        $zip->close();

        return response()->download($zipPath, $zipFilename)->deleteFileAfterSend(true);
    }
}
