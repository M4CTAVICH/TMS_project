import { Link } from "react-router-dom";
import { Package, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../api/services/orders.service";
import { OrderStatus } from "../types/api.types";
import { format } from "date-fns";
import { AppHeader } from "@/components/layout/AppHeader";

export const OrdersPage = () => {
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getOrders(),
  });

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

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-4">My Orders</h1>
          <p className="text-xl text-gray-400">View and track your orders</p>
        </div>
      </section>

      <section className="py-12 bg-black min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-gray-400">Failed to load orders</p>
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                No orders yet
              </h2>
              <Link
                to="/products"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(order.orderDate), "PPP 'at' p")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">From</p>
                      <p className="text-white font-medium">
                        {order.fromLocation.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">To</p>
                      <p className="text-white font-medium">
                        {order.toLocation.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Distance</p>
                      <p className="text-white font-medium">
                        {order.distanceKm.toFixed(2)} km
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-400">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      ${order.transportTotal.toFixed(2)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
