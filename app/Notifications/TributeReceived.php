<?php

namespace App\Notifications;

use App\Models\Tribute;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class TributeReceived extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The tribute instance.
     */
    protected Tribute $tribute;

    /**
     * Create a new notification instance.
     */
    public function __construct(Tribute $tribute)
    {
        $this->tribute = $tribute;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', WebPushChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $room = $this->tribute->room;

        return (new MailMessage)
            ->subject('New Tribute Submitted')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A new tribute has been submitted for your room "'.$room->name.'" and is awaiting your approval.')
            ->action('Review Tribute', url('/rooms/'.$room->slug.'/tributes'))
            ->line('Thank you for using our service!');
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush($notifiable)
    {
        return (new WebPushMessage)
            ->title('New Tribute Received')
            ->icon('/favicon.ico')
            ->body('A new tribute has been submitted for your room and needs approval.')
            ->action('Review', url('/rooms/'.$this->tribute->room->slug.'/tributes'));
    }
}
