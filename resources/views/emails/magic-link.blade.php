<x-mail::message>
# Welcome to Ulo of Stories, {{ $name }}!

You have been invited to access and participate in the legacy preservation space: **{{ $spaceName }}**.

To join this space and share your memories, please use the secure button below:

<x-mail::button :url="$magicUrl">
Enter {{ $spaceName }}
</x-mail::button>

*Note: This link will expire in 30 minutes for security purposes.*

Thank you,<br>
The {{ config('app.name') }} Team
</x-mail::message>
