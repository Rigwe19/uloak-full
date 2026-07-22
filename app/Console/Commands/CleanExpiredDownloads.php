<?php

namespace App\Console\Commands;

use App\Models\DownloadRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanExpiredDownloads extends Command
{
    protected $signature = 'downloads:clean-expired';

    protected $description = 'Delete expired download ZIP files and their records';

    public function handle(): void
    {
        $expired = DownloadRequest::where('expires_at', '<', now())->get();

        foreach ($expired as $request) {
            if (Storage::exists($request->zip_path)) {
                Storage::delete($request->zip_path);
            }

            $request->delete();
        }

        $this->info("Cleaned {$expired->count()} expired download requests.");
    }
}
