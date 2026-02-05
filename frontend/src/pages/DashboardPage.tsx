import { useAuthStore } from "../store/authStore";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Warehouse,
  Truck,
  Factory,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  Boxes,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../api/services/orders.service";
import { reportsService } from "../api/services/reports.service";
import { stockService } from "../api/services/stock.service";
import { transportService } from "../api/services/transport.service";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // Render role-specific dashboard
  switch (user?.role) {
    case "MANAGER":
      return <ManagerDashboard />;
    case "RAW_STOCK_MANAGER":
      return <RawStockManagerDashboard />;
    case "PRODUCTION_CLIENT":
      return <ProductionClientDashboard />;
    case "DISTRIBUTOR":
      return <DistributorDashboard />;
    case "TRANSPORT_PROVIDER":
      return <TransportProviderDashboard />;
    default:
      return <DefaultDashboard />;
  }
};

// Manager Dashboard (Full Access)
const ManagerDashboard = () => {
  const { user } = useAuthStore();

  // Fetch dashboard stats for managers
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => reportsService.getDashboardStats(),
  });

  // Fetch orders for recent orders table
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getOrders(),
  });

  const isLoading = statsLoading || ordersLoading;

  // Use real stats from API
  const totalOrders = dashboardStats?.orders.total || 0;
  const totalCost = dashboardStats?.orders.costLastMonth || 0;
  const pendingOrders = dashboardStats?.orders.byStatus?.PENDING || 0;
  const completedOrders = dashboardStats?.orders.byStatus?.DELIVERED || 0;

  // Calculate real percentage changes with safe property access
  const costChange = dashboardStats?.orders?.costComparison?.percentageChange ?? 0;
  const ordersChange = dashboardStats?.orders?.orderComparison?.percentageChange ?? 0;

  const stats = [
    {
      label: "Total cost",
      value: `$${totalCost.toFixed(2)}`,
      change: `${costChange >= 0 ? "+" : ""}${costChange.toFixed(1)}%`,
      isPositive: costChange >= 0,
      icon: DollarSign,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      change: `${ordersChange >= 0 ? "+" : ""}${ordersChange.toFixed(1)}%`,
      isPositive: ordersChange >= 0,
      icon: ShoppingCart,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      change: pendingOrders > 0 ? "-5.0%" : "No orders",
      isPositive: pendingOrders === 0,
      icon: AlertCircle,
      color: "from-yellow-600 to-orange-600",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
    },
    {
      label: "Completed Orders",
      value: completedOrders.toString(),
      change: `${ordersChange >= 0 ? "+" : ""}${ordersChange.toFixed(1)}%`,
      isPositive: ordersChange >= 0,
      icon: Package,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
  ];

  const quickActions = [
    {
      label: "Manage Products",
      description: "Add, edit, or remove products",
      icon: Package,
      href: "/products-management",
      color: "from-blue-600 to-cyan-600",
    },
    {
      label: "Manage Orders",
      description: "Track and manage all orders",
      icon: ShoppingCart,
      href: "/orders-management",
      color: "from-purple-600 to-pink-600",
    },
    {
      label: "Stock Management",
      description: "Monitor inventory levels",
      icon: Warehouse,
      href: "/stock",
      color: "from-green-600 to-emerald-600",
    },
    {
      label: "Production",
      description: "Track production batches",
      icon: Factory,
      href: "/production",
      color: "from-orange-600 to-red-600",
    },
    {
      label: "Transport",
      description: "Manage transport operations",
      icon: Truck,
      href: "/transport",
      color: "from-indigo-600 to-purple-600",
    },
    {
      label: "User Management",
      description: "Manage user accounts",
      icon: Users,
      href: "/users",
      color: "from-pink-600 to-rose-600",
    },
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  // Real stock and transport stats with safe access
  const activeDeliveries = dashboardStats?.transport?.byStatus?.IN_TRANSIT ?? 0;
  const activeBatches = dashboardStats?.production?.byStatus?.IN_PROGRESS ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Here's what's happening with your Transport platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div
                className={`flex items-center text-sm font-medium ${
                  stat.isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Orders</h2>
          <Link
            to="/orders-management"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No orders yet
            </h3>
            <p className="text-gray-400 mb-4">
              Orders will appear here once customers start placing them.
            </p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentOrders.map((order) => {
                    const statusColors = {
                      PENDING:
                        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                      CONFIRMED:
                        "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                      IN_TRANSIT:
                        "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                      DELIVERED:
                        "bg-green-500/20 text-green-400 border border-green-500/30",
                      CANCELLED:
                        "bg-red-500/20 text-red-400 border border-red-500/30",
                    };

                    return (
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
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                              {order.createdBy?.firstName?.[0]}
                              {order.createdBy?.lastName?.[0]}
                            </div>
                            <span className="text-sm text-gray-300">
                              {order.createdBy?.firstName || "Unknown"}{" "}
                              {order.createdBy?.lastName || ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusColors[order.status] ||
                              "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-white">
                            ${(order.transportTotal || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            to={`/orders-management/${order.id}`}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Overview */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Stock Overview</h3>
            <Link
              to="/stock"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Warehouse className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Raw Materials</p>
                <p className="text-xs text-gray-400">
                  {dashboardStats?.stock?.rawMaterial?.available ?? 0} units
                  available
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <Package className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  Finished Products
                </p>
                <p className="text-xs text-gray-400">
                  {dashboardStats?.stock?.finishedProduct?.available ?? 0} units
                  available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Operations */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Active Operations
            </h3>
            <Link
              to="/transport"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Truck className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {activeDeliveries} Active Deliveries
                </p>
                <p className="text-xs text-gray-400">In transit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <Factory className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {activeBatches} Production Batches
                </p>
                <p className="text-xs text-gray-400">In progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Raw Stock Manager Dashboard
const RawStockManagerDashboard = () => {
  const { user } = useAuthStore();

  // Fetch raw material stock stats
  const { data: rawMaterialStock, isLoading } = useQuery({
    queryKey: ["rawMaterialStock"],
    queryFn: () => stockService.getRawMaterialStock(),
  });

  // Calculate stats from stock data
  const totalItems = rawMaterialStock?.length || 0;
  const totalQuantity =
    rawMaterialStock?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const reservedQuantity =
    rawMaterialStock?.reduce((sum, item) => sum + item.reservedQuantity, 0) ||
    0;
  const availableQuantity = totalQuantity - reservedQuantity;

  const stats = [
    {
      label: "Total Items",
      value: totalItems.toString(),
      icon: Box,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Total Quantity",
      value: totalQuantity.toString(),
      icon: Boxes,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      label: "Reserved",
      value: reservedQuantity.toString(),
      icon: Clock,
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
    },
    {
      label: "Available",
      value: availableQuantity.toString(),
      icon: CheckCircle2,
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Manage raw material inventory and stock levels.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-purple-500/50 transition-all"
          >
            <div className={`p-3 rounded-lg ${stat.bgColor} inline-block mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/stock"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 mb-4 group-hover:scale-110 transition-transform">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Raw Material Stock
            </h3>
            <p className="text-sm text-gray-400">
              Monitor and update raw material inventory
            </p>
          </Link>

          <Link
            to="/products"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              View Products
            </h3>
            <p className="text-sm text-gray-400">Browse raw material catalog</p>
          </Link>
        </div>
      </div>

      {/* Low Stock Alert */}
      {rawMaterialStock && rawMaterialStock.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Stock Items
          </h3>
          <div className="space-y-3">
            {rawMaterialStock.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.location?.name || "Unknown Location"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {item.quantity} units
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.reservedQuantity} reserved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Your Role</h3>
        <p className="text-gray-300">
          As a Raw Stock Manager, you're responsible for monitoring and managing
          raw material inventory levels. Use the Stock Management section to
          update quantities and track stock movements.
        </p>
      </div>
    </div>
  );
};

// Production Client Dashboard
const ProductionClientDashboard = () => {
  const { user } = useAuthStore();

  // Fetch production batches stats
  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ["productionBatches"],
    queryFn: () => productionService.getBatches(),
  });

  // Fetch production stock
  const { data: productionStock, isLoading: stockLoading } = useQuery({
    queryKey: ["productionStock"],
    queryFn: () => stockService.getProductionStock(),
  });

  const isLoading = batchesLoading || stockLoading;

  // Calculate stats
  const totalBatches = batches?.length || 0;
  const inProgressBatches =
    batches?.filter((b) => b.status === "IN_PROGRESS").length || 0;
  const completedBatches =
    batches?.filter((b) => b.status === "COMPLETED").length || 0;
  const productionStockQuantity =
    productionStock?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const stats = [
    {
      label: "Total Batches",
      value: totalBatches.toString(),
      icon: Factory,
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-400",
    },
    {
      label: "In Progress",
      value: inProgressBatches.toString(),
      icon: Clock,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Completed",
      value: completedBatches.toString(),
      icon: CheckCircle2,
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      label: "Production Stock",
      value: productionStockQuantity.toString(),
      icon: Boxes,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Manage production operations and inventory.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-orange-500/50 transition-all"
          >
            <div className={`p-3 rounded-lg ${stat.bgColor} inline-block mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/production"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 mb-4 group-hover:scale-110 transition-transform">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Production
            </h3>
            <p className="text-sm text-gray-400">
              Manage production batches and recipes
            </p>
          </Link>

          <Link
            to="/stock"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Stock Management
            </h3>
            <p className="text-sm text-gray-400">
              View raw materials and production stock
            </p>
          </Link>

          <Link
            to="/products"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Products</h3>
            <p className="text-sm text-gray-400">Browse product catalog</p>
          </Link>
        </div>
      </div>

      {/* Recent Batches */}
      {batches && batches.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Batches</h3>
            <Link
              to="/production"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {batches.slice(0, 5).map((batch) => {
              const statusColors = {
                IN_PROGRESS:
                  "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                COMPLETED:
                  "bg-green-500/20 text-green-400 border border-green-500/30",
                CANCELLED:
                  "bg-red-500/20 text-red-400 border border-red-500/30",
              };

              return (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Factory className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {batch.recipe?.product?.name || "Unknown Product"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Quantity: {batch.quantityProduced}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[batch.status] ||
                      "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {batch.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Your Role</h3>
        <p className="text-gray-300">
          As a Production Client, you manage production operations, create
          production batches, and monitor raw material and production stock
          levels.
        </p>
      </div>
    </div>
  );
};

// Distributor Dashboard
const DistributorDashboard = () => {
  const { user } = useAuthStore();

  // Fetch finished product stock stats
  const { data: finishedStock, isLoading } = useQuery({
    queryKey: ["finishedProductStock"],
    queryFn: () => stockService.getFinishedProductStock(),
  });

  // Calculate stats
  const totalItems = finishedStock?.length || 0;
  const totalQuantity =
    finishedStock?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const reservedQuantity =
    finishedStock?.reduce((sum, item) => sum + item.reservedQuantity, 0) || 0;
  const availableQuantity = totalQuantity - reservedQuantity;

  const stats = [
    {
      label: "Total Products",
      value: totalItems.toString(),
      icon: Package,
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      label: "Total Stock",
      value: totalQuantity.toString(),
      icon: Boxes,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Reserved",
      value: reservedQuantity.toString(),
      icon: Clock,
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
    },
    {
      label: "Available",
      value: availableQuantity.toString(),
      icon: CheckCircle2,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Manage finished product distribution.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-green-500/50 transition-all"
          >
            <div className={`p-3 rounded-lg ${stat.bgColor} inline-block mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/stock"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Finished Products
            </h3>
            <p className="text-sm text-gray-400">
              View finished product inventory
            </p>
          </Link>

          <Link
            to="/products"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 mb-4 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Browse Products
            </h3>
            <p className="text-sm text-gray-400">View product catalog</p>
          </Link>
        </div>
      </div>

      {/* Finished Products List */}
      {finishedStock && finishedStock.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent Stock Items
          </h3>
          <div className="space-y-3">
            {finishedStock.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.product?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.location?.name || "Unknown Location"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {item.quantity} units
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.reservedQuantity} reserved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Your Role</h3>
        <p className="text-gray-300">
          As a Distributor, you manage finished product inventory and handle
          distribution operations. Monitor stock levels and browse available
          products.
        </p>
      </div>
    </div>
  );
};

// Transport Provider Dashboard
const TransportProviderDashboard = () => {
  const { user } = useAuthStore();

  // Fetch transport jobs stats
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["transportJobs"],
    queryFn: () => transportService.getJobs(),
  });

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => transportService.getVehicles(),
  });

  const isLoading = jobsLoading || vehiclesLoading;

  // Calculate stats
  const totalJobs = jobs?.length || 0;
  const activeJobs = jobs?.filter((j) => j.status === "IN_TRANSIT").length || 0;
  const completedJobs =
    jobs?.filter((j) => j.status === "DELIVERED").length || 0;
  const totalVehicles = vehicles?.length || 0;

  const stats = [
    {
      label: "Total Jobs",
      value: totalJobs.toString(),
      icon: Truck,
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-400",
    },
    {
      label: "Active Jobs",
      value: activeJobs.toString(),
      icon: Clock,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Completed",
      value: completedJobs.toString(),
      icon: CheckCircle2,
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      label: "Total Vehicles",
      value: totalVehicles.toString(),
      icon: Truck,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Manage transport operations and deliveries.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-indigo-500/50 transition-all"
          >
            <div className={`p-3 rounded-lg ${stat.bgColor} inline-block mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/transport"
            className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
          >
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Transport Operations
            </h3>
            <p className="text-sm text-gray-400">
              Manage transport jobs and vehicles
            </p>
          </Link>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 mb-4">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Active Jobs
            </h3>
            <p className="text-sm text-gray-400">
              View your transport schedule
            </p>
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      {jobs && jobs.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Jobs</h3>
            <Link
              to="/transport"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => {
              const statusColors = {
                PENDING:
                  "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
                IN_TRANSIT:
                  "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                DELIVERED:
                  "bg-green-500/20 text-green-400 border border-green-500/30",
                CANCELLED:
                  "bg-red-500/20 text-red-400 border border-red-500/30",
              };

              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Job #{job.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {job.vehicle?.licensePlate || "No vehicle assigned"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[job.status] ||
                      "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Your Role</h3>
        <p className="text-gray-300">
          As a Transport Provider, you manage transport operations, vehicles,
          and delivery schedules. Use the Transport section to view and manage
          your active jobs.
        </p>
      </div>
    </div>
  );
};

// Default Dashboard (fallback)
const DefaultDashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome to the Transport Management Platform.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center">
        <Package className="w-24 h-24 text-gray-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">
          Dashboard Not Available
        </h2>
        <p className="text-gray-400">
          Please contact your administrator for access.
        </p>
      </div>
    </div>
  );
};
