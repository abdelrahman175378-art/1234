
import { useApp } from '../AppContext';

export const useWishlist = () => {
  const { wishlist, toggleWishlist, products } = useApp();

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return {
    wishlist,
    toggleWishlist,
    favoriteProducts,
    isInWishlist: (id: string) => wishlist.includes(id)
  };
};
