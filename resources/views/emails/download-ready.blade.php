<x-mail::message>
# Your download is ready, {{ $name }}!

Your photos and videos from **{{ $spaceName }}** are ready to download.

<x-mail::button :url="$downloadUrl">
Download Your Memories
</x-mail::button>

This download link will expire in **48 hours** for security purposes.

Thank you,<br>
The {{ config('app.name') }} Team
</x-mail::message>