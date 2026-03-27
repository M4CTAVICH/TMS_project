import { useMemo, useState } from "react";
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
import { UserRole, OrderType, ProductType } from "@/types/api.types";

type RequestMode = "ORDER" | "DELIVERY";

interface OrderItem {
  productId: string;
  productName: string;
  productType: ProductType;
  quantity: number;
  availableQuantity: number;
  unitWeight: number;
}

interface Location {
  id: string;
  name: string;
  locationType: string;
}

interface UserLike {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  locationId?: string | null;
}

interface ProviderLike {
  id: string;
  name: string;
  vehicles?: Array<{ id: string; status?: string }>;
}

const asArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== "object") return [];
  const v = value as any;
  if (Array.isArray(v.data)) return v.data;
  if (Array.isArray(v.items)) return v.items;
  if (Array.isArray(v.providers)) return v.providers;
  if (Array.isArray(v.locations)) return v.locations;
  if (v.data && Array.isArray(v.data.items)) return v.data.items;
  if (v.data && Array.isArray(v.data.providers)) return v.data.providers;
  if (v.data && Array.isArray(v.data.locations)) return v.data.locations;
  return [];
};

const getErrorMessage = (error: any): string => {
  const apiMsg = error?.response?.data?.message || error?.message;
  if (
    Array.isArray(error?.response?.data?.errors) &&
    error.response.data.errors.length
  ) {
    const first = error.response.data.errors[0];
    if (first?.field && first?.message)
      return `${first.field}: ${first.message}`;
  }
  return apiMsg || "Something went wrong";
};

export const OrderCreationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [mode, setMode] = useState<RequestMode>("ORDER");

  const [selectedFromLocation, setSelectedFromLocation] = useState<string>(
    user?.locationId || "",
  );
  const [selectedToLocation, setSelectedToLocation] = useState<string>("");

  const [confirmingUserId, setConfirmingUserId] = useState<string>("");
  const [destinationUserId, setDestinationUserId] = useState<string>("");

  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [transportProviderId, setTransportProviderId] = useState<string>("");

  const canCreate = [
    UserRole.PRODUCTION_CLIENT,
    UserRole.DISTRIBUTOR,
    UserRole.FINISHED_STOCK_MANAGER,
  ].includes((user?.role as UserRole) || UserRole.CUSTOMER);

  // ===== Queries =====
  const { data: locationsRaw } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsService.getLocations(),
  });
  const locations = asArray<Location>(locationsRaw);

  const { data: availableProductsRaw, isLoading: isLoadingProducts } = useQuery(
    {
      queryKey: ["availableProducts", selectedFromLocation],
      queryFn: () =>
        stockService.getAvailableProductsAtLocation(selectedFromLocation),
      enabled: !!selectedFromLocation && step >= 2,
    },
  );
  const availableProducts = asArray<any>(availableProductsRaw);

  const { data: usersAtFromRaw, isLoading: isLoadingUsersFrom } = useQuery({
    queryKey: ["usersAtFromLocation", selectedFromLocation],
    queryFn: () => usersService.getUsersByLocation(selectedFromLocation),
    enabled: !!selectedFromLocation && step >= 3,
  });
  const usersAtFromLocation = asArray<UserLike>(usersAtFromRaw);

  const { data: usersAtToRaw, isLoading: isLoadingUsersTo } = useQuery({
    queryKey: ["usersAtToLocation", selectedToLocation],
    queryFn: () => usersService.getUsersByLocation(selectedToLocation),
    enabled: mode === "DELIVERY" && !!selectedToLocation && step >= 3,
  });
  const usersAtToLocation = asArray<UserLike>(usersAtToRaw);

  const { data: transportProvidersRaw } = useQuery({
    queryKey: ["transportProviders"],
    queryFn: () => transportService.getTransportProviders(),
  });
  const transportProviders = asArray<ProviderLike>(transportProvidersRaw);

  const { data: distanceData } = useQuery({
    queryKey: ["distance", selectedFromLocation, selectedToLocation],
    queryFn: () =>
      locationsService.calculateDistance(
        selectedFromLocation,
        selectedToLocation,
      ),
    enabled: !!selectedFromLocation && !!selectedToLocation && step >= 4,
  });

  const totalWeight = useMemo(
    () =>
      selectedProducts.reduce(
        (sum, item) => sum + (item.unitWeight || 0) * item.quantity,
        0,
      ),
    [selectedProducts],
  );

  const { data: costData, isFetching: isQuotingCost } = useQuery({
    queryKey: [
      "transportCost",
      transportProviderId,
      totalWeight,
      distanceData?.distance,
    ],
    queryFn: () =>
      transportService.calculateTransportCost(
        transportProviderId,
        totalWeight,
        Number(distanceData?.distance || 0),
      ),
    enabled:
      !!transportProviderId &&
      !!distanceData?.distance &&
      totalWeight > 0 &&
      step >= 4,
  });

  const distanceKm = Number(distanceData?.distance || 0);
  const transportCost = Number((costData as any)?.totalCost || 0);

  // ===== Derived role/location behavior =====
  const fromLocationLocked =
    user?.role === UserRole.PRODUCTION_CLIENT ||
    user?.role === UserRole.FINISHED_STOCK_MANAGER;

  const filteredToLocations = useMemo(() => {
    if (mode === "ORDER") {
      // For order, typically to current user location for non-manager flows
      return locations;
    }

    // DELIVERY-specific destination rules
    if (user?.role === UserRole.PRODUCTION_CLIENT) {
      return locations.filter((l) => l.locationType === "FINISHED_WAREHOUSE");
    }
    if (user?.role === UserRole.FINISHED_STOCK_MANAGER) {
      return locations.filter((l) => l.locationType === "DISTRIBUTION_CENTER");
    }
    return locations;
  }, [locations, mode, user?.role]);

  const providersWithAvailableVehicles = useMemo(
    () =>
      transportProviders.filter((p) =>
        (p.vehicles || []).some(
          (v) => (v.status || "").toUpperCase() === "AVAILABLE",
        ),
      ),
    [transportProviders],
  );

  const selectedFromLocationObj = locations.find(
    (l) => l.id === selectedFromLocation,
  );
  const selectedToLocationObj = locations.find(
    (l) => l.id === selectedToLocation,
  );

  // ===== Mutations =====
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProducts.length)
        throw new Error("Please select at least one product");
      const allProductTypes = selectedProducts.map((p) => p.productType);
      const sameType = allProductTypes.every((t) => t === allProductTypes[0]);
      if (!sameType)
        throw new Error("All selected products must have the same type");

      if (!selectedFromLocation) throw new Error("From location is required");
      if (!selectedToLocation) throw new Error("To location is required");
      if (!transportProviderId)
        throw new Error("Transport provider is required");

      if (mode === "DELIVERY") {
        if (!destinationUserId)
          throw new Error("Destination user is required for delivery");
        return ordersService.createOrder({
          type: OrderType.DELIVERY,
          fromLocationId: selectedFromLocation,
          toLocationId: selectedToLocation,
          destinationUserId,
          transportProviderId,
          items: selectedProducts.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        });
      }

      if (!confirmingUserId)
        throw new Error("Confirming user is required for order");

      const orderType =
        selectedProducts[0].productType === ProductType.RAW_MATERIAL
          ? OrderType.RAW_MATERIAL_ORDER
          : OrderType.FINISHED_PRODUCT_ORDER;

      return ordersService.createOrder({
        type: orderType,
        fromLocationId: selectedFromLocation,
        toLocationId: selectedToLocation,
        confirmingUserId,
        transportProviderId,
        items: selectedProducts.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      });
    },
    onSuccess: (res: any) => {
      const id =
        res?.id || res?.order?.id || res?.data?.id || res?.data?.order?.id;
      navigate(id ? `/orders/${id}` : "/orders");
    },
  });

  // ===== Handlers =====
  const resetDownstream = () => {
    setSelectedProducts([]);
    setConfirmingUserId("");
    setDestinationUserId("");
    setTransportProviderId("");
    setSelectedToLocation("");
  };

  const handleAddProduct = (product: any) => {
    const pid = product.productId || product.id;
    if (!pid || selectedProducts.some((p) => p.productId === pid)) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: pid,
        productName: product.productName || product.name || "Unnamed Product",
        productType: product.productType || product.type,
        quantity: 1,
        availableQuantity: Number(
          product.availableQty || product.quantity || 0,
        ),
        unitWeight: Number(product.unitWeight || 1),
      },
    ]);
  };

  const handleQuantityChange = (productId: string, qty: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? {
              ...p,
              quantity: Math.max(
                1,
                Math.min(Number.isFinite(qty) ? qty : 1, p.availableQuantity),
              ),
            }
          : p,
      ),
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productId !== productId),
    );
  };

  const isStepValid = () => {
    if (step === 1) return !!selectedFromLocation && !!selectedToLocation;
    if (step === 2) return selectedProducts.length > 0;
    if (step === 3)
      return mode === "DELIVERY" ? !!destinationUserId : !!confirmingUserId;
    if (step === 4) return !!transportProviderId;
    return true;
  };

  const next = () => {
    if (!isStepValid()) return;
    setStep((s) => (s < 5 ? ((s + 1) as any) : s));
  };

  const prev = () => setStep((s) => (s > 1 ? ((s - 1) as any) : s));

  if (!canCreate) {
    return (
      <div className="min-h-screen bg-black">
        <AppHeader />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-white mb-3">
              Create Request
            </h1>
            <p className="text-gray-400">
              Your role is not allowed to create orders or deliveries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />

      <section className="bg-gradient-to-b from-gray-900 to-black py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-3">Create Request</h1>
          <p className="text-gray-400">
            Create an Order or Delivery in one flow
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold ${step >= n ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
                  >
                    {step > n ? <CheckCircle2 className="w-5 h-5" /> : n}
                  </div>
                  {n < 5 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${step > n ? "bg-blue-600" : "bg-gray-700"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-white">
                Step 1: Request Type & Route
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  className={`p-4 rounded-lg border ${mode === "ORDER" ? "border-blue-500 bg-blue-500/10 text-white" : "border-gray-700 text-gray-300"}`}
                  onClick={() => {
                    setMode("ORDER");
                    resetDownstream();
                  }}
                >
                  Order
                </button>
                <button
                  className={`p-4 rounded-lg border ${mode === "DELIVERY" ? "border-blue-500 bg-blue-500/10 text-white" : "border-gray-700 text-gray-300"}`}
                  onClick={() => {
                    setMode("DELIVERY");
                    resetDownstream();
                  }}
                >
                  Delivery
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="text-gray-400 block mb-2">
                    From Location
                  </span>
                  <select
                    value={selectedFromLocation}
                    disabled={fromLocationLocked}
                    onChange={(e) => {
                      setSelectedFromLocation(e.target.value);
                      resetDownstream();
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-70"
                  >
                    <option value="">Choose from location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.locationType})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-gray-400 block mb-2">To Location</span>
                  <select
                    value={selectedToLocation}
                    onChange={(e) => setSelectedToLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Choose destination...</option>
                    {filteredToLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.locationType})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                onClick={next}
                disabled={!isStepValid()}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-semibold"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Step 2: Select Products
              </h2>

              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading
                  products...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 mb-6 max-h-80 overflow-y-auto">
                    {availableProducts.map((p: any) => {
                      const pid = p.productId || p.id;
                      const already = selectedProducts.some(
                        (s) => s.productId === pid,
                      );
                      return (
                        <div
                          key={pid}
                          className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {p.productName || p.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              Available: {p.availableQty ?? p.quantity ?? 0}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddProduct(p)}
                            disabled={already}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {selectedProducts.length === 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-300 mb-4">
                      Select at least one product.
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className="space-y-3">
                      {selectedProducts.map((p) => (
                        <div
                          key={p.productId}
                          className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white">{p.productName}</p>
                            <p className="text-sm text-gray-400">
                              Max: {p.availableQuantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={p.availableQuantity}
                              value={p.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  p.productId,
                                  Number(e.target.value),
                                )
                              }
                              className="w-24 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-center"
                            />
                            <button
                              onClick={() => handleRemoveProduct(p.productId)}
                              className="p-2 rounded bg-red-600/20 text-red-300 hover:bg-red-600/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={prev}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  disabled={!isStepValid()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Step 3:{" "}
                {mode === "DELIVERY"
                  ? "Select Destination User"
                  : "Select Confirming User"}
              </h2>

              {mode === "DELIVERY" ? (
                <>
                  {isLoadingUsersTo ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading
                      users...
                    </div>
                  ) : (
                    <label>
                      <span className="text-gray-400 block mb-2">
                        User at destination location
                      </span>
                      <select
                        value={destinationUserId}
                        onChange={(e) => setDestinationUserId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="">Choose user...</option>
                        {usersAtToLocation.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.role})
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              ) : (
                <>
                  {isLoadingUsersFrom ? (
                    <div className="flex items-center justify-center py-10 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading
                      users...
                    </div>
                  ) : (
                    <label>
                      <span className="text-gray-400 block mb-2">
                        User at source location
                      </span>
                      <select
                        value={confirmingUserId}
                        onChange={(e) => setConfirmingUserId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      >
                        <option value="">Choose user...</option>
                        {usersAtFromLocation.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.role})
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={prev}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  disabled={!isStepValid()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Step 4: Select Transport Provider
              </h2>

              {providersWithAvailableVehicles.length === 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-300">
                  No providers with AVAILABLE vehicles.
                </div>
              ) : (
                <div className="grid gap-3">
                  {providersWithAvailableVehicles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTransportProviderId(p.id)}
                      className={`text-left p-4 rounded-lg border ${
                        transportProviderId === p.id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-gray-700 bg-gray-800"
                      }`}
                    >
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-sm text-gray-400">
                        AVAILABLE vehicles:{" "}
                        {
                          (p.vehicles || []).filter(
                            (v) =>
                              (v.status || "").toUpperCase() === "AVAILABLE",
                          ).length
                        }
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={prev}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  disabled={!isStepValid()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Step 5: Review & Submit
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
                  <p className="text-gray-400">
                    Type: <span className="text-white">{mode}</span>
                  </p>
                  <p className="text-gray-400">
                    From:{" "}
                    <span className="text-white">
                      {selectedFromLocationObj?.name || "-"}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    To:{" "}
                    <span className="text-white">
                      {selectedToLocationObj?.name || "-"}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Weight:{" "}
                    <span className="text-white">
                      {totalWeight.toFixed(2)} kg
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Distance:{" "}
                    <span className="text-white">
                      {distanceKm.toFixed(2)} km
                    </span>
                  </p>
                  <p className="text-gray-400">
                    Transport:{" "}
                    <span className="text-green-400">
                      €{transportCost.toFixed(2)}
                    </span>
                  </p>
                  {isQuotingCost && (
                    <p className="text-blue-300 text-sm flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      Calculating cost...
                    </p>
                  )}
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-white font-semibold mb-3">
                    Items ({selectedProducts.length})
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {selectedProducts.map((p) => (
                      <div
                        key={p.productId}
                        className="text-sm text-gray-300 flex justify-between border-b border-gray-700 pb-1"
                      >
                        <span>{p.productName}</span>
                        <span>x{p.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  ← Back
                </button>
                <button
                  onClick={() => createOrderMutation.mutate()}
                  disabled={createOrderMutation.isPending || !transportCost}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Create{" "}
                      {mode === "DELIVERY" ? "Delivery" : "Order"}
                    </>
                  )}
                </button>
              </div>

              {createOrderMutation.isError && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{getErrorMessage(createOrderMutation.error)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
