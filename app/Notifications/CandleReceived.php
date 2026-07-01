<?php

namespace App\Notifications;

use App\Models\Candle;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;

class CandleReceived extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The candle instance.
     */
    protected Candle $candle;

    /**
     * Create a new notification instance.
     */
    public function __construct(Candle $candle)
    {
        $this->candle = $candle;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'webpush'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $room = $this->candle->room;

        return (new MailMessage)
            ->subject('New Candle Lit')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A new candle has been lit in your room "'.$room->name.'" and is awaiting your approval.')
            ->action('Review Candle', url('/rooms/'.$room->slug.'/candles'))
            ->line('Thank you for using our service!');
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable)
    {
        $room = $this->candle->room;

        return (new WebPushMessage)
            ->title('New Candle Lit')
            ->icon('/favicon.ico')
            ->body('A new candle has been lit in your room and needs approval.')
            ->action('Review', url('/rooms/'.$room->slug.'/candles'));
    }
}
