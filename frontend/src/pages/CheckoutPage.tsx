import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  Truck,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useQuery, useMutation } from "@tanstack/react-query";
import { locationsService } from "../api/services/locations.service";
import { transportService } from "../api/services/transport.service";
import { ordersService } from "../api/services/orders.service";
import { OrderType } from "../types/api.types";
import { toast } from "sonner";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart, getTotalPrice, getTotalWeight } = useCartStore();

  const [selectedFromLocation, setSelectedFromLocation] = useState("");
  const [selectedToLocation, setSelectedToLocation] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsService.getLocations(),
  });

  // Fetch transport providers
  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ["transport-providers"],
    queryFn: () => transportService.getProviders(),
  });

  // Calculate distance when both locations are selected
  const { data: distanceData, isLoading: distanceLoading } = useQuery({
    queryKey: ["distance", selectedFromLocation, selectedToLocation],
    queryFn: () =>
      locationsService.calculateDistance(
        selectedFromLocation,
        selectedToLocation
      ),
    enabled: !!selectedFromLocation && !!selectedToLocation,
  });

  // Determine order type from cart items
  const orderType = useMemo(() => {
    const hasRawMaterials = items.some(
      (item) => item.product.type === "RAW_MATERIAL"
    );
    const hasFinishedProducts = items.some(
      (item) => item.product.type === "FINISHED_PRODUCT"
    );

    if (hasRawMaterials && !hasFinishedProducts) {
      return OrderType.RAW_MATERIAL_ORDER;
    } else if (hasFinishedProducts && !hasRawMaterials) {
      return OrderType.FINISHED_PRODUCT_ORDER;
    }
    return null;
  }, [items]);

  // Filter locations based on order type
  const filteredFromLocations = useMemo(() => {
    if (!locations) return [];

    if (orderType === OrderType.RAW_MATERIAL_ORDER) {
      // For raw materials, look for RAW_WAREHOUSE or similar
      return locations.filter(
        (loc) =>
          loc.locationType.toLowerCase().includes("warehouse") ||
          loc.locationType.toLowerCase().includes("raw")
      );
    } else if (orderType === OrderType.FINISHED_PRODUCT_ORDER) {
      // For finished products, look for DISTRIBUTION_CENTER or similar
      return locations.filter(
        (loc) =>
          loc.locationType.toLowerCase().includes("distribution") ||
          loc.locationType.toLowerCase().includes("finished")
      );
    }
    return locations;
  }, [locations, orderType]);

  const filteredToLocations = useMemo(() => {
    if (!locations) return [];

    if (orderType === OrderType.RAW_MATERIAL_ORDER) {
      // Raw materials go to production facilities
      return locations.filter(
        (loc) =>
          loc.locationType.toLowerCase().includes("production") ||
          loc.locationType.toLowerCase().includes("facility")
      );
    } else if (orderType === OrderType.FINISHED_PRODUCT_ORDER) {
      // Finished products can go anywhere
      return locations.filter((loc) => loc.id !== selectedFromLocation);
    }
    return locations;
  }, [locations, orderType, selectedFromLocation]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: ordersService.createOrder,
    onSuccess: (order) => {
      clearCart();
      toast.success("Order created successfully!");
      navigate(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      // Extract error message from different possible locations
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        error.response?.data?.data?.message ||
        "Failed to create order";

      // Check if it's a stock availability error
      if (errorMessage.includes("not available at this location")) {
        toast.error(
          "Products not available at selected location. Please contact admin to add stock or choose a different location.",
          { duration: 6000 }
        );
      } else if (
        errorMessage.includes("Insufficient stock") ||
        errorMessage.includes("Quantity must be greater than 0")
      ) {
        toast.error(errorMessage, { duration: 6000 });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleCheckout = () => {
    if (!selectedFromLocation || !selectedToLocation || !selectedProvider) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!orderType) {
      toast.error(
        "Cannot mix raw materials and finished products in one order"
      );
      return;
    }

    createOrderMutation.mutate({
      type: orderType,
      fromLocationId: selectedFromLocation,
      toLocationId: selectedToLocation,
      transportProviderId: selectedProvider,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });
  };

  const totalPrice = getTotalPrice();
  const totalWeight = getTotalWeight();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Your cart is empty
          </h2>
          <Link
            to="/products"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium inline-block"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Check for mixed product types
  const hasMixedTypes = !orderType;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Smart TMS
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <CreditCard className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">Checkout</h1>
          </div>
          <p className="text-xl text-gray-400">Complete your order details</p>
        </div>
      </section>

      {/* Error Banner for Mixed Types */}
      {hasMixedTypes && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">
                  Invalid Order Combination
                </h3>
                <p className="text-red-300 text-sm">
                  You cannot mix raw materials and finished products in the same
                  order. Please remove items from your cart to proceed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Content */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">
                      Stock Availability Notice
                    </p>
                    <p>
                      Products must be available at the selected origin
                      location. If you encounter errors, please contact an
                      administrator to add stock or select a different location.
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Selection */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Delivery Locations
                  </h2>
                </div>

                {locationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* From Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        From Location (Origin - must have stock)
                      </label>
                      <select
                        value={selectedFromLocation}
                        onChange={(e) => {
                          setSelectedFromLocation(e.target.value);
                          // Reset destination if same as origin
                          if (e.target.value === selectedToLocation) {
                            setSelectedToLocation("");
                          }
                        }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        disabled={hasMixedTypes}
                      >
                        <option value="">Select origin location</option>
                        {filteredFromLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.locationType}
                          </option>
                        ))}
                      </select>
                      {orderType === OrderType.RAW_MATERIAL_ORDER && (
                        <p className="mt-2 text-xs text-gray-400">
                          Showing warehouses with raw materials
                        </p>
                      )}
                      {orderType === OrderType.FINISHED_PRODUCT_ORDER && (
                        <p className="mt-2 text-xs text-gray-400">
                          Showing distribution centers with finished products
                        </p>
                      )}
                    </div>

                    {/* To Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        To Location (Destination)
                      </label>
                      <select
                        value={selectedToLocation}
                        onChange={(e) => setSelectedToLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        disabled={!selectedFromLocation || hasMixedTypes}
                      >
                        <option value="">Select destination</option>
                        {filteredToLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.locationType}
                          </option>
                        ))}
                      </select>
                      {orderType === OrderType.RAW_MATERIAL_ORDER && (
                        <p className="mt-2 text-xs text-gray-400">
                          Showing production facilities
                        </p>
                      )}
                    </div>

                    {/* Distance Display */}
                    {distanceLoading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calculating distance...</span>
                      </div>
                    ) : distanceData ? (
                      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">
                            Distance: {distanceData.distanceKm.toFixed(2)} km
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Transport Provider Selection */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Transport Provider
                  </h2>
                </div>

                {providersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providers?.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() =>
                          !hasMixedTypes && setSelectedProvider(provider.id)
                        }
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          hasMixedTypes
                            ? "opacity-50 cursor-not-allowed"
                            : selectedProvider === provider.id
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">
                              {provider.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {provider.vehicles.length} vehicle
                              {provider.vehicles.length !== 1 ? "s" : ""}{" "}
                              available
                            </p>
                          </div>
                          {selectedProvider === provider.id &&
                            !hasMixedTypes && (
                              <CheckCircle className="w-6 h-6 text-cyan-400" />
                            )}
                        </div>
                      </div>
                    ))}

                    {providers?.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No transport providers available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items Summary */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Order Items
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Qty: {item.quantity} units (
                            {(item.product.unitWeight * item.quantity).toFixed(
                              2
                            )}{" "}
                            kg)
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-cyan-400">
                        $0.00
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Products Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Total Weight</span>
                    <span>{totalWeight.toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Transport Cost</span>
                    <span className="text-gray-500">Calculated on order</span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Distance</span>
                      <span>
                        {distanceData
                          ? `${distanceData.distanceKm.toFixed(2)} km`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Estimated Total</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                        ${totalPrice.toFixed(2)}+
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Final total will include transport costs
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={
                    hasMixedTypes ||
                    !selectedFromLocation ||
                    !selectedToLocation ||
                    !selectedProvider ||
                    createOrderMutation.isPending
                  }
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>

                {(hasMixedTypes ||
                  !selectedFromLocation ||
                  !selectedToLocation ||
                  !selectedProvider) && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2 text-yellow-400 text-sm">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {hasMixedTypes
                          ? "Please remove mixed product types from cart"
                          : "Please select locations and transport provider to continue"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
