import { fetchImageUrl } from '@/services/imageService';

const imageCache = new Map();

export async function loadImagesForCards(cards) {
  const authToken = localStorage.getItem('authToken') || 'guest';
  const batchSize = 6;
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    await Promise.all(batch.map(async (card) => {
      if (card.image && card.image.startsWith('/api/products/')) {
        const match = card.image.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
        if (match) {
          const [_, productId, imageId] = match;
          const url = await fetchImageUrl(productId, imageId, authToken !== 'guest' ? authToken : null);
          card.image = url;
        }
      }
    }));
  }
}