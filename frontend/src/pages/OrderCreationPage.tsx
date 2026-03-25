import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { locationsService } from "@/api/services/locations.service";
import { usersService } from "@/api/services/users.service";
import { stockService } from "@/api/services/stock.service";
import { ordersService } from "@/api/services/orders.service";
import { transportService } from "@/api/services/transport.service";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { UserRole, OrderType, ProductType } from "@/types/api.types";

interface OrderItem {
  productId: string;
  productName: string;
  productType: ProductType;
  quantity: number;
  availableQuantity: number;
}

export const OrderCreationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFromLocation, setSelectedFromLocation] = useState<string>("");
  const [selectedToLocation, setSelectedToLocation] = useState<string>("");
  const [confirmingUserId, setConfirmingUserId] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [transportProviderId, setTransportProviderId] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);

  // Set auto toLocation for non-MANAGER users
  const autoToLocation = user?.role !== UserRole.MANAGER ? user?.locationId : undefined;

  // Queries
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsService.getLocations(),
  });

  const { data: availableProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["availableProducts", selectedFromLocation, step],
    queryFn: () => stockService.getAvailableProductsAtLocation(selectedFromLocation),
    enabled: !!selectedFromLocation && step >= 2,
  });

  const { data: usersAtLocation, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["usersAtLocation", selectedFromLocation],
    queryFn: () => usersService.getUsersByLocation(selectedFromLocation),
    enabled: !!selectedFromLocation && step >= 3,
  });

  const { data: transportProviders } = useQuery({
    queryKey: ["transportProviders"],
    queryFn: () => transportService.getTransportProviders(),
  });

  // Calculate distance when both locations selected
  const { data: distanceData } = useQuery({
    queryKey: ["distance", selectedFromLocation, selectedToLocation],
    queryFn: async () => {
      if (!selectedFromLocation || !selectedToLocation) return null;
      const distance = await locationsService.calculateDistance(
        selectedFromLocation,
        selectedToLocation
      );
      return distance;
    },
    enabled: !!selectedFromLocation && !!selectedToLocation && step >= 4,
  });

  // Calculate transport cost
  const { mutate: calculateTransportCost } = useMutation({
    mutationFn: async () => {
      if (!transportProviderId || !distanceData) return;
      
      const totalWeight = selectedProducts.reduce((sum, item) => {
        const product = availableProducts?.find((p: any) => p.id === item.productId);
        return sum + (product?.unitWeight || 0) * item.quantity;
      }, 0);

      const cost = await transportService.calculateTransportCost(
        transportProviderId,
        totalWeight,
        distanceData.distance
      );
      
      setDistanceKm(distanceData.distance);
      setTransportCost(cost.totalCost);
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      // Get token from store and ensure it's available
      const authState = useAuthStore.getState();
      const currentToken = authState.token;

      if (!currentToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Ensure token is in localStorage for axios interceptor
      localStorage.setItem("auth_token", currentToken);

      // Validate that all products are the same type
      const allProductTypes = selectedProducts.map(p => p.productType);
      const allSameType = allProductTypes.every(type => type === allProductTypes[0]);

      if (!allSameType) {
        throw new Error("All products must be of the same type. You cannot mix raw materials with finished products in a single order.");
      }

      const orderType = selectedProducts[0]?.productType === ProductType.RAW_MATERIAL 
        ? OrderType.RAW_MATERIAL_ORDER 
        : OrderType.FINISHED_PRODUCT_ORDER;

      return ordersService.createOrder({
        type: orderType,
        fromLocationId: selectedFromLocation,
        toLocationId: autoToLocation || selectedToLocation,
        confirmingUserId,
        transportProviderId,
        items: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      });
    },
    onSuccess: (order) => {
      navigate(`/orders/${order.id}`);
    },
    onError: (error: any) => {
      console.error("Order creation error:", error);
      if (error.statusCode === 401) {
        // Token expired or invalid - redirect to login
        useAuthStore.getState().clearAuth();
        navigate("/login");
      }
    },
  });

  const handleAddProduct = (product: any) => {
    if (selectedProducts.find((p) => p.productId === product.productId)) {
      return;
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        productId: product.productId,
        productName: product.productName,
        productType: product.productType,
        quantity: 1,
        availableQuantity: product.availableQty,
      },
    ]);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId
          ? {
              ...p,
              quantity: Math.max(1, Math.min(newQuantity, p.availableQuantity)),
            }
          : p
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productId !== productId));
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedFromLocation) return;
    if (step === 2 && selectedProducts.length === 0) return;
    if (step === 3 && !confirmingUserId) return;
    if (step === 4 && !transportProviderId) return;
    
    if (step < 5) {
      setStep((step + 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />
      
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-4">Create New Order</h1>
          <p className="text-xl text-gray-400">Professional order management system</p>
        </div>
      </section>

      <section className="py-12 bg-black min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div key={stepNum} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= stepNum
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {step > stepNum ? <CheckCircle2 className="w-6 h-6" /> : stepNum}
                  </div>
                  {stepNum < 5 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-all ${
                        step > stepNum ? "bg-blue-600" : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>From Location</span>
              <span>Select Products</span>
              <span>Confirm User</span>
              <span>Transport</span>
              <span>Review Order</span>
            </div>
          </div>

          {/* Step 1: Selection From Location */}
          {step === 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Step 1: Select From Location</h2>
              
              <label className="block mb-4">
                <span className="text-gray-400 mb-2 block">Select Location to Order From</span>
                <select
                  value={selectedFromLocation}
                  onChange={(e) => setSelectedFromLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose a location...</option>
                  {locations?.map((loc: any) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} - {loc.locationType}
                    </option>
                  ))}
                </select>
              </label>

              {selectedFromLocation && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <p className="text-green-400 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Location selected successfully
                  </p>
                </div>
              )}

              <button
                onClick={handleNextStep}
                disabled={!selectedFromLocation}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                Continue to Products →
              </button>
            </div>
          )}

          {/* Step 2: Select Products */}
          {step === 2 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Step 2: Select Products</h2>
              
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="ml-2 text-gray-400">Loading available products...</span>
                </div>
              ) : !availableProducts || availableProducts.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    No products available at this location
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">
                      Available Products
                    </h3>
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {availableProducts.map((product: any) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-white">{product.productName}</p>
                            <p className="text-sm text-gray-400">
                              Available: {product.availableQty} units
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddProduct(product)}
                            disabled={selectedProducts.some((p) => p.productId === product.productId)}
                            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded flex items-center gap-2 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-300 mb-4">
                        Selected Products ({selectedProducts.length})
                      </h3>
                      <div className="space-y-3">
                        {selectedProducts.map((product) => (
                          <div
                            key={product.productId}
                            className="flex items-center justify-between bg-gray-900 p-4 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-white">{product.productName}</p>
                              <p className="text-sm text-gray-400">
                                Max available: {product.availableQuantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <input
                                type="number"
                                min="1"
                                max={product.availableQuantity}
                                value={product.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    product.productId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-center focus:outline-none focus:border-blue-500"
                              />
                              <button
                                onClick={() => handleRemoveProduct(product.productId)}
                                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={selectedProducts.length === 0}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                  Continue to Confirmation →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Confirming User */}
          {step === 3 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 3: Select Confirming User
              </h2>
              
              <p className="text-gray-400 mb-6">
                Select the user at {locations?.find((l: any) => l.id === selectedFromLocation)?.name} who will confirm and prepare this order.
              </p>

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <label className="block mb-6">
                  <span className="text-gray-400 mb-2 block">Select User</span>
                  <select
                    value={confirmingUserId}
                    onChange={(e) => setConfirmingUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {usersAtLocation?.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-blue-400">
                  This user will receive a notification to accept and prepare the order.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!confirmingUserId}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                  Select Transport →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Transport Provider */}
          {step === 4 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 4: Select Transport Provider
              </h2>
              
              <p className="text-gray-400 mb-6">
                Choose a transport provider for this order.
              </p>

              {!transportProviders || transportProviders.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    No transport providers available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {transportProviders.map((provider: any) => (
                    <div
                      key={provider.id}
                      onClick={() => setTransportProviderId(provider.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        transportProviderId === provider.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700 bg-gray-800 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{provider.name}</p>
                          <p className="text-sm text-gray-400">
                            {provider.vehicles?.length || 0} vehicles available
                          </p>
                        </div>
                        {transportProviderId === provider.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-blue-400">
                  Transport cost will be calculated based on distance and weight.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!transportProviderId}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review Order */}
          {step === 5 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Step 5: Review & Confirm</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Order Summary */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>From:</span>
                      <span className="text-white">
                        {locations?.find((l: any) => l.id === selectedFromLocation)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>To:</span>
                      <span className="text-white">
                        {locations?.find(
                          (l: any) => l.id === (autoToLocation || selectedToLocation)
                        )?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Distance:</span>
                      <span className="text-white">{distanceKm.toFixed(2)} km</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3 flex justify-between font-semibold">
                      <span>Transport Cost:</span>
                      <span className="text-green-400">€{transportCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded p-4">
                    <p className="text-gray-400 mb-2">Confirming User:</p>
                    <p className="text-white font-semibold">
                      {usersAtLocation?.find((u: any) => u.id === confirmingUserId)?.firstName}{" "}
                      {usersAtLocation?.find((u: any) => u.id === confirmingUserId)?.lastName}
                    </p>
                  </div>
                </div>

                {/* Products Summary */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Products ({selectedProducts.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="flex justify-between text-gray-400 text-sm py-2 border-b border-gray-700"
                      >
                        <span>{product.productName}</span>
                        <span className="text-gray-300 font-semibold">
                          x{product.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => createOrderMutation.mutate()}
                  disabled={createOrderMutation.isPending}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Create Order
                    </>
                  )}
                </button>
              </div>

              {createOrderMutation.isError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400">
                    Error creating order: {(createOrderMutation.error as any)?.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
