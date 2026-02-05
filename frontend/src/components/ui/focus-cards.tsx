// src/components/ui/focus-cards.tsx
import { useState } from "react";
import { cn } from "../../lib/utils";
import { ShoppingCart, Package } from "lucide-react";

export type Card = {
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  sku?: string;
  price?: number;
  unit?: string;
  onAddToCart?: () => void;
};

export const FocusCards = ({ cards }: { cards: Card[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
      {cards.map((card, index) => (
        <div
          key={card.title + index}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "rounded-xl relative bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden h-96 w-full transition-all duration-300 ease-out group cursor-pointer border border-white/10",
            hovered !== null && hovered !== index && "blur-sm scale-[0.98]",
            hovered === index &&
              "border-blue-500/50 shadow-lg shadow-blue-500/20"
          )}
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-blue-500/30 rounded-full" />
              <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-cyan-500/30 rounded-full" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/20 rounded-lg rotate-45" />
            </div>
          </div>

          {/* Badge */}
          {card.badge && (
            <div className="absolute top-4 right-4 z-10">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                  card.badgeColor ||
                    "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                )}
              >
                {card.badge}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 p-6 z-10 flex flex-col justify-between">
            {/* Top section - SKU */}
            {card.sku && (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Package className="w-3 h-3" />
                <span>SKU: {card.sku}</span>
              </div>
            )}

            {/* Middle section - Title, Description, Price */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white transition-all duration-300">
                {card.title}
              </h3>

              {card.description && (
                <p className="text-gray-300 text-sm line-clamp-2">
                  {card.description}
                </p>
              )}

              {/* Price Display */}
              {card.price !== undefined && (
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    ${card.price.toFixed(2)}
                  </span>
                  {card.unit && (
                    <span className="text-gray-400 text-sm">/ {card.unit}</span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom section - Add to Cart Button */}
            {card.onAddToCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  card.onAddToCart?.();
                }}
                className={cn(
                  "w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50",
                  hovered === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                )}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
