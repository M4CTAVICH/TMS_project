// src/pages/CartPage.tsx
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { AppHeader } from "../components/layout/AppHeader";

export const CartPage = () => {
  const { isAuthenticated, clearAuth } = useAuthStore();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalWeight,
  } = useCartStore();

  const handleLogout = () => {
    clearAuth();
  };

  const totalPrice = getTotalPrice();
  const totalWeight = getTotalWeight();

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <AppHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <ShoppingCart className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">Shopping Cart</h1>
          </div>
          <p className="text-xl text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
            • {totalWeight.toFixed(2)} kg total weight
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12 bg-black min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ShoppingCart className="w-24 h-24 text-gray-600 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-400 mb-6">
                Add some products to get started!
              </p>
              <Link
                to="/products"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start gap-6">
                      {/* Product Icon */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <Package className="w-10 h-10 text-white" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                          SKU: {item.product.sku}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {item.product.description}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.product.type === "RAW_MATERIAL"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                            }`}
                          >
                            {item.product.type === "RAW_MATERIAL"
                              ? "Raw Material"
                              : "Finished Product"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {item.product.unitWeight} kg per unit
                          </span>
                        </div>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex flex-col items-end gap-4">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            $
                            0.00
                          </p>
                          <p className="text-sm text-gray-400">
                            No per-unit pricing
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(item.product.unitWeight * item.quantity).toFixed(
                              2
                            )}{" "}
                            kg total
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="px-4 text-white font-medium min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 hover:bg-white/10 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.quantity}{" "}
                            {item.quantity === 1 ? "unit" : "units"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Total Weight</span>
                      <span>{totalWeight.toFixed(2)} kg</span>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between text-xl font-bold text-white">
                        <span>Total</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium text-lg mb-3 block text-center"
                  >
                    Proceed to Checkout
                  </Link>

                  <button
                    onClick={clearCart}
                    className="w-full px-6 py-3 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-colors font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 Smart TMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
