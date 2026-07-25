<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessDriveImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriveImportController extends Controller
{
    /**
     * Accept a Google Drive share URL (file or folder).
     * Dispatches queue jobs to download each file asynchronously.
     */
    public function download(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string'],
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'event_id' => ['nullable', 'integer', 'exists:events,id'],
        ]);

        $url = $request->input('url');
        $userId = $request->user()->id;
        $roomId = (int) $request->input('room_id');
        $eventId = $request->input('event_id') ? (int) $request->input('event_id') : null;

        // Detect if it's a Google Drive folder
        if (str_contains($url, '/folders/') || str_contains($url, 'id=')) {
            $folderId = $this->extractFolderId($url);

            if (! $folderId) {
                return response()->json(['error' => 'Invalid Google Drive folder URL.'], 422);
            }

            // Use the public Drive API to list folder contents
            $files = $this->listFolderFiles($folderId);

            if (empty($files)) {
                return response()->json([
                    'success' => true,
                    'dispatched' => 0,
                    'message' => 'No files found in the folder, or the folder is empty.',
                ]);
            }

            $dispatched = 0;
            foreach ($files as $file) {
                ProcessDriveImport::dispatch(
                    fileId: $file['id'],
                    fileName: $file['name'],
                    userId: $userId,
                    roomId: $roomId,
                    eventId: $eventId,
                );
                $dispatched++;
            }

            return response()->json([
                'success' => true,
                'dispatched' => $dispatched,
                'message' => "Found {$dispatched} file(s) in folder. Import started in the background.",
            ]);
        }

        // Single file
        $fileId = $this->extractFileId($url);

        if (! $fileId) {
            return response()->json(['error' => 'Invalid Google Drive URL.'], 422);
        }

        ProcessDriveImport::dispatch(
            fileId: $fileId,
            fileName: "drive-{$fileId}",
            userId: $userId,
            roomId: $roomId,
            eventId: $eventId,
        );

        return response()->json([
            'success' => true,
            'dispatched' => 1,
            'message' => 'Import started in the background.',
        ]);
    }

    /**
     * List files in a public Google Drive folder.
     */
    private function listFolderFiles(string $folderId): array
    {
        try {
            $url = "https://www.googleapis.com/drive/v3/files?q='{$folderId}'+in+parents&fields=files(id,name,mimeType)&key=AIzaSyDIQjFdFGwjc6sVJ2cXgZb5Z8g5Z5Z5Z5Z";

            // Fallback: use the public Drive folder view page
            $html = @file_get_contents("https://drive.google.com/drive/folders/{$folderId}");

            if (! $html) {
                return [];
            }

            // Parse file entries from the HTML
            $files = [];
            preg_match_all('/"([a-zA-Z0-9_-]{28,})"/', $html, $matches);

            // Use a simpler approach: fetch the folder export endpoint
            $feedUrl = "https://drive.google.com/embeddedfolderview?id={$folderId}#list";
            $feedHtml = @file_get_contents($feedUrl);

            if ($feedHtml) {
                preg_match_all('/<a[^>]*href="[^"]*id=([a-zA-Z0-9_-]{28,})[^"]*"[^>]*>([^<]+)</', $feedHtml, $linkMatches, PREG_SET_ORDER);

                $seen = [];
                foreach ($linkMatches as $m) {
                    $id = $m[1];
                    $name = strip_tags($m[2]);
                    if (! isset($seen[$id])) {
                        $seen[$id] = true;
                        $files[] = ['id' => $id, 'name' => $name];
                    }
                }
            }

            // If parsing fails, try to extract from script data
            if (empty($files)) {
                preg_match_all('/"([a-zA-Z0-9_-]{28,})"/', $html, $idMatches);
                $uniqueIds = array_unique($idMatches[1]);

                foreach (array_slice($uniqueIds, 0, 50) as $id) {
                    $files[] = ['id' => $id, 'name' => "file-{$id}"];
                }
            }

            return $files;
        } catch (\Exception $e) {
            logger()->error("Failed to list Drive folder {$folderId}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Extract file ID from a Drive share URL.
     */
    private function extractFileId(string $url): ?string
    {
        $patterns = [
            '/\/d\/([a-zA-Z0-9_-]+)/',
            '/[?&]id=([a-zA-Z0-9_-]+)/',
            '/^([a-zA-Z0-9_-]{25,})$/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Extract folder ID from a Drive folder URL.
     */
    private function extractFolderId(string $url): ?string
    {
        $patterns = [
            '/\/folders\/([a-zA-Z0-9_-]+)/',
            '/[?&]id=([a-zA-Z0-9_-]+)/',
            '/^([a-zA-Z0-9_-]{25,})$/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}