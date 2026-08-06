<!doctype html>
<html>
<head>
    <title>{{ $owner->name }} Family House - Ulo of Stories</title>

    <meta property="og:title" content="{{ $owner->name }} Family House - Ulo of Stories">
    <meta property="og:description"
          content="{{ "View and share memories in {$owner->name} house as a member." }}">
    <meta property="og:image"
          content="{{ $owner->house_thumbnail_url }}">
    <meta property="og:url"
          content="{{ request()->url() }}">
    <meta property="og:type" content="website">

    <meta http-equiv="refresh"
          content="0;url={{ $redirect }}">
</head>
<body>
<script>
    window.location.replace(@json($redirect));
</script>
</body>
</html>