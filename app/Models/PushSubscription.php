<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use NotificationChannels\WebPush\PushSubscription as BasePushSubscription;

class PushSubscription extends BasePushSubscription
{
    // The package's PushSubscription already defines the needed columns.
    // This class exists only to provide a concrete Eloquent model if you need customization.
}
