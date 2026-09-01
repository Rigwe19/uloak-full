import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type Story = {
  id: string | number;
  assets?: Array<{
    media_uuid: string;
    url: string;
    thumbnail?: string;
    status?: string;
  }>;
  thumbnail?: string;
  file_url?: string;
};

export function useStoryMediaSync() {
  useEffect(() => {
    const checkStories = () => {
      const page = usePage();
      const stories = page.props.stories as Story[] | undefined;
      
      if (!stories) {
return;
}

      let hasPending = false;
      
      for (const story of stories) {
        const assets = story.assets || [];

        for (const asset of assets) {
          if (asset.status === 'pending' || asset.status === 'processing') {
            hasPending = true;
            break;
          }
        }

        if (hasPending) {
break;
}
      }

      if (!hasPending) {
return;
}

      // Poll for media updates every 10 seconds
      const interval = setInterval(async () => {
        for (const story of stories) {
          const assets = story.assets || [];
          const pendingAssets = assets.filter(
            (a) => a.status === 'pending' || a.status === 'processing'
          );
          
          if (pendingAssets.length === 0) {
continue;
}
          
          // Check each pending asset
          for (const asset of pendingAssets) {
            try {
              const res = await fetch(`/api/media/${asset.media_uuid}`, {
                headers: {
                  'Accept': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                },
              });
              
              if (!res.ok) {
continue;
}
              
              const { data } = await res.json();
              
              if (data.status === 'ready') {
                // Update story with new data
                updateStoryWithMedia(story.id, {
                  id: data.id,
                  url: data.url,
                  thumbnail: data.thumbnail,
                });
              }
            } catch {
              // Silent fail
            }
          }
        }
      }, 10000);

      return () => {
        clearInterval(interval);
      };
    };

    checkStories();
  }, []);
}

function updateStoryWithMedia(
  storyId: string | number,
  mediaData: { id: string; url: string | null; thumbnail: string | null }
): void {
  const page = usePage();
  const stories = page.props.stories as Story[] | undefined;
  
  if (!stories) {
return;
}

  const updatedStories = stories.map((story) => {
    if (story.id !== storyId) {
return story;
}

    const assets = story.assets || [];
    const updatedAssets = assets.map((asset) => {
      if (asset.media_uuid === mediaData.id) {
        return {
          ...asset,
          url: mediaData.url || asset.url,
          thumbnail: mediaData.thumbnail || asset.thumbnail,
          status: 'ready',
          updated_at: new Date().toISOString(),
        };
      }

      return asset;
    });

    let updatedThumbnail = story.thumbnail;

    if (story.thumbnail && story.thumbnail.includes(mediaData.id)) {
      updatedThumbnail = mediaData.thumbnail || updatedThumbnail;
    }

    return {
      ...story,
      assets: updatedAssets,
      thumbnail: updatedThumbnail,
    };
  });

  router.replace(window.location.href, {
    only: ['stories'],
    preserveScroll: true,
    onSuccess: () => {
      // Update Inertia page props with new stories
      window.Inertia?.replaceState({
        props: {
          ...page.props,
          stories: updatedStories,
        },
      });
    },
  });
}
