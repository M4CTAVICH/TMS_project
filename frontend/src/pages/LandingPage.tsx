import { Link } from "react-router-dom";
import {
  Package,
  TrendingUp,
  Truck,
  Factory,
  Warehouse,
  BarChart3,
  CheckCircle,
  ArrowRight,
  LogOut,
} from "lucide-react";
import Hyperspeed from "../components/effects/Hyperspeed";
import { useAuthStore } from "../store/authStore";
import { CartIcon } from "../components/layout/CartIcon";
import { LandingHeader } from "../components/layout/LandingHeader";

export const LandingPage = () => {
  const { isAuthenticated, clearAuth } = useAuthStore();

  const features = [
    {
      icon: Package,
      title: "Product Management",
      description: "Manage raw materials and finished products with ease",
    },
    {
      icon: Warehouse,
      title: "Multi-Level Stock",
      description:
        "Track inventory across raw, production, and finished levels",
    },
    {
      icon: Factory,
      title: "Production Tracking",
      description: "Monitor production batches from start to completion",
    },
    {
      icon: Truck,
      title: "Smart Transport",
      description: "Optimize delivery routes and vehicle allocation",
    },
    {
      icon: TrendingUp,
      title: "Order Management",
      description: "Streamline orders from creation to delivery",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights with comprehensive dashboards",
    },
  ];

  const benefits = [
    "Real-time stock tracking across multiple levels",
    "Automated transport cost calculation",
    "Role-based access control",
    "Complete order lifecycle management",
    "Production batch tracking",
    "Comprehensive reporting and analytics",
  ];

  const handleLogout = () => {
    clearAuth();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <LandingHeader />
      {/* Hero Section with Hyperspeed Background */}
      <section className="relative h-screen overflow-hidden">
        {/* Hyperspeed 3D Background */}
        <div className="absolute inset-0 z-0">
          <Hyperspeed
            effectOptions={{
              distortion: "turbulentDistortion",
              length: 400,
              roadWidth: 10,
              islandWidth: 2,
              lanesPerRoad: 3,
              fov: 90,
              fovSpeedUp: 150,
              speedUp: 2,
              carLightsFade: 0.4,
              totalSideLightSticks: 50,
              lightPairsPerRoadWay: 50,
              colors: {
                roadColor: 0x080808,
                islandColor: 0x0a0a0a,
                background: 0x000000,
                shoulderLines: 0x131318,
                brokenLines: 0x131318,
                leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
                rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
                sticks: 0x03b3c3,
              },
            }}
          />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Glassmorphism Card */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Streamline Your{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Transport Operations
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Comprehensive platform for managing production, inventory,
                transportation, and orders from raw materials to finished
                products.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium flex items-center justify-center text-lg"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/products"
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-colors font-medium text-lg flex items-center justify-center"
                >
                  <Package className="mr-2 w-5 h-5" />
                  Browse Products
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  100%
                </div>
                <div className="text-gray-300">Automation</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-cyan-400 mb-2">5+</div>
                <div className="text-gray-300">User Roles</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  24/7
                </div>
                <div className="text-gray-300">Real-time Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features to manage your entire workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Choose Smart TMS?
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Built for modern supply chain management with automation and
                real-time insights at its core.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 shadow-2xl shadow-blue-500/30">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        Active Orders
                      </span>
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white">234</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        Stock Levels
                      </span>
                      <Warehouse className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white">98%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        On-time Delivery
                      </span>
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white">95%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of businesses optimizing their Transport operations
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium text-lg"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
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
