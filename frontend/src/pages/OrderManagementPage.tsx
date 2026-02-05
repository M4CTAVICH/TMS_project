import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  XCircle,
  MapPin,
  Calendar,
  Truck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../api/services/orders.service";
import { OrderStatus } from "../types/api.types";
import { format } from "date-fns";
import { useOrders } from "../hooks/useOrders";
import { toast } from "sonner";

export const OrderManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getOrders(),
  });

  const { cancelOrder, isCancelling } = useOrders();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case OrderStatus.CONFIRMED:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case OrderStatus.PREPARING:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case OrderStatus.IN_TRANSIT:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case OrderStatus.DELIVERED:
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case OrderStatus.CANCELLED:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // Get unique providers for filter dropdown
  const uniqueProviders = Array.from(
    new Set(
      orders?.map((order) => order.transportProvider?.id).filter(Boolean) || []
    )
  );

  const providerNames = orders?.reduce(
    (acc, order) => {
      if (order.transportProvider?.id) {
        acc[order.transportProvider.id] = order.transportProvider.name;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  // Filter orders
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.createdBy.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.transportProvider?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    const matchesProvider =
      providerFilter === "ALL" ||
      order.transportProvider?.id === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  const handleCancelOrder = (orderId: string) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      setCancellingOrderId(orderId);
      cancelOrder(orderId, {
        onSuccess: () => {
          setCancellingOrderId(null);
        },
        onError: () => {
          setCancellingOrderId(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Order Management
          </h1>
          <p className="text-gray-400">
            Manage and track all orders in the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order, customer, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "ALL")
              }
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value={OrderStatus.PENDING}>Pending</option>
              <option value={OrderStatus.CONFIRMED}>Confirmed</option>
              <option value={OrderStatus.PREPARING}>Preparing</option>
              <option value={OrderStatus.IN_TRANSIT}>In Transit</option>
              <option value={OrderStatus.DELIVERED}>Delivered</option>
              <option value={OrderStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div className="relative">
            <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="ALL">All Providers</option>
              {uniqueProviders.map((providerId) => (
                <option key={providerId} value={providerId}>
                  {providerNames?.[providerId] || "Unknown Provider"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Total Orders</span>
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{orders?.length || 0}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Pending</span>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {orders?.filter((o) => o.status === OrderStatus.PENDING).length ||
              0}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">In Transit</span>
            <MapPin className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {orders?.filter((o) => o.status === OrderStatus.IN_TRANSIT)
              .length || 0}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Delivered</span>
            <Package className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {orders?.filter((o) => o.status === OrderStatus.DELIVERED).length ||
              0}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to load orders
          </h2>
          <p className="text-gray-400">Please try again later</p>
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            No orders found
          </h2>
          <p className="text-gray-400 mb-6">
            {searchTerm || statusFilter !== "ALL" || providerFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Orders will appear here once created"}
          </p>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                          {order.createdBy?.firstName?.[0]}
                          {order.createdBy?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {order.createdBy?.firstName}{" "}
                            {order.createdBy?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.createdBy?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-white flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {order.fromLocation.name} → {order.toLocation.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {order.distanceKm.toFixed(2)} km
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-orange-400" />
                        <div>
                          <p className="text-sm text-white font-medium">
                            {order.transportProvider?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.transportProvider?.email || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white">
                        ${order.transportTotal.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(order.orderDate), "PP")}
                        </p>
                        <p className="text-xs">
                          {format(new Date(order.orderDate), "p")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/orders-management/${order.id}`)
                          }
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/orders-management/${order.id}/edit`)
                          }
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Status"
                          disabled={
                            order.status === OrderStatus.CANCELLED ||
                            order.status === OrderStatus.DELIVERED
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Cancel Order"
                          disabled={
                            order.status === OrderStatus.CANCELLED ||
                            order.status === OrderStatus.DELIVERED ||
                            (isCancelling && cancellingOrderId === order.id)
                          }
                        >
                          {isCancelling && cancellingOrderId === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
