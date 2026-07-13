<?php

namespace App\Http\Controllers;

use App\Media\Cloudinary\MediaAnalyticsService;
use App\Media\Cloudinary\MediaWebhookService;
use App\Media\Exceptions\MediaProcessingException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaWebhookController extends Controller
{
    public function __construct(
        protected MediaWebhookService $webhookService,
        protected MediaAnalyticsService $analytics,
    ) {}

    public function handleCloudinary(Request $request): JsonResponse
    {
        $payload = $request->all();

        $this->analytics->webhookReceived($payload);

        $signature = $request->header('X-Cloudinary-Signature')
            ?? $request->header('X-Signature')
            ?? '';

        $timestamp = $request->header('X-Cloudinary-Timestamp')
            ?? $request->header('X-Timestamp')
            ?? null;

        $rawBody = $request->getContent();

        if ($signature !== '') {
            if (! $this->webhookService->verify($rawBody, $signature, $timestamp)) {
                return response()->json(['message' => 'Invalid signature.'], 403);
            }
        }

        try {
            $this->webhookService->handle($payload, $signature);
        } catch (MediaProcessingException $e) {
            $this->analytics->webhookFailed(
                $payload['public_id'] ?? 'unknown',
                $e->getMessage(),
            );

            return response()->json(['message' => 'OK']);
            // return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'OK']);
    }
}
