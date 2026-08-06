<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HouseMemberInvitation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $memberName,
        public string $accessUrl,
        public string $ownerName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to {$this->ownerName}'s Family House on Ulo of Stories",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.house-member-invitation',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
