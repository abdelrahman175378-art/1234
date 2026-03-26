
import { useApp } from '../AppContext';
import { CartItem } from '../types';

export const useCart = () => {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    subtotal,
    totalItems
  };
};
