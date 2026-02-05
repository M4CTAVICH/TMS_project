import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/cartStore";

export const CartIcon = () => {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <Link
      to="/cart"
      className="relative px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
    >
      <ShoppingCart className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
};
