<x-mail::message>
# Welcome to Uloak, {{ $memberName }}!

You have been invited by **{{ $ownerName }}** to join their Family House — a private digital sanctuary to preserve and share family memories, stories, and legacies.

<x-mail::button :url="$accessUrl">
Enter the Family House
</x-mail::button>

This invitation link is unique to you. Share it with no one.

Welcome to the family.<br>
The {{ config('app.name') }} Team
</x-mail::message>
