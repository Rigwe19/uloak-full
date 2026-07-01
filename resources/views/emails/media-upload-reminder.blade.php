<x-mail::message>
Dear {{ $name }},

Thank you so much for gracing **{{ $roomName }}** with your presence, love, laughter, prayers, gifts, and beautiful energy.

Having you there meant more to me than words can fully express. Every smile, every hug, every dance, every picture, every little moment helped make the day truly unforgettable. I am still carrying the joy in my heart.

I would really love to keep those memories close, so please kindly upload any pictures or videos you captured from the event to my Uloak event room using the link below:

<x-mail::button :url="$roomUrl">
Upload Your Memories
</x-mail::button>

Whether it is a short video, a group photo, a selfie, a funny moment, a dance clip, or a quiet beautiful memory, I would be so grateful to have it. These memories mean so much to me, and I would love to preserve them properly.

You can also share this upload link with anyone else you know who attended the event and may have lovely photos or videos from the day.

Thank you again for celebrating with me and making my event so special. I am truly grateful.

With love and appreciation,<br>
{{ $ownerName }}
</x-mail::message>