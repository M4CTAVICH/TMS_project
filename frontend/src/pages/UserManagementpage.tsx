import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
  Mail,
  Briefcase,
  MapPin,
  X,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import { locationsService } from "../api/services/locations.service";
import { format } from "date-fns";
import { AppHeader } from "../components/layout/AppHeader";
import type { User, Location } from "../types/api.types";

const ROLES = {
  MANAGER: "Manager",
  RAW_STOCK_MANAGER: "Raw Stock Manager",
  PRODUCTION_CLIENT: "Production Client",
  DISTRIBUTOR: "Distributor",
  TRANSPORT_PROVIDER: "Transport Provider",
};

type RoleKey = keyof typeof ROLES;

export const UserManagementPage = () => {
  const { user: currentUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "RAW_STOCK_MANAGER",
    locationId: "",
  });

  // Fetch locations
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsService.getLocations(),
  });

  const {
    users,
    meta,
    isLoading,
    isError,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    activateUserMutation,
    deactivateUserMutation,
  } = useUsers(currentPage, 20, roleFilter !== "ALL" ? roleFilter : undefined);

  // Check if user is manager
  if (currentUser?.role !== "MANAGER") {
    return (
      <div className="min-h-screen bg-black">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">
              Only managers can access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && u.isActive) ||
      (statusFilter === "INACTIVE" && !u.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        locationId: user.locationId || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "RAW_STOCK_MANAGER",
        locationId: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate location requirement for non-MANAGER and non-TRANSPORT_PROVIDER roles
    if (
      formData.role !== "MANAGER" &&
      formData.role !== "TRANSPORT_PROVIDER" &&
      !formData.locationId
    ) {
      alert(
        `Users with role ${ROLES[formData.role as RoleKey]} must have a location assigned`
      );
      return;
    }

    if (
      (formData.role === "MANAGER" || formData.role === "TRANSPORT_PROVIDER") &&
      formData.locationId
    ) {
      alert(`${formData.role} users should not have a location assigned`);
      return;
    }

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          ...(formData.role !== "MANAGER" && formData.role !== "TRANSPORT_PROVIDER" && {
            locationId: formData.locationId || null,
          }),
        },
      });
    } else {
      if (!formData.password) {
        alert("Password is required for new users");
        return;
      }
      const userData: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      };
      
      // Only include locationId for roles that require it
      if (formData.role !== "MANAGER" && formData.role !== "TRANSPORT_PROVIDER") {
        userData.locationId = formData.locationId || null;
      }
      
      createUserMutation.mutate(userData);
    }

    handleCloseModal();
  };

  const handleDelete = (userId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<RoleKey, string> = {
      MANAGER: "bg-red-500/20 text-red-400 border-red-500/30",
      RAW_STOCK_MANAGER: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      PRODUCTION_CLIENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      DISTRIBUTOR: "bg-green-500/20 text-green-400 border-green-500/30",
      TRANSPORT_PROVIDER: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    };
    return colors[role as RoleKey] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                User Management
              </h1>
              <p className="text-gray-400">
                Create, manage, and monitor all system users
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Add New User
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="ALL">All Roles</option>
                {Object.entries(ROLES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Users Table */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
          ) : isError ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">Failed to load users</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-400">
                {users.length === 0
                  ? "Create your first user to get started"
                  : "No users match your search criteria"}
              </p>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                                user.role === "MANAGER"
                                  ? "from-red-600 to-red-400"
                                  : user.role === "RAW_STOCK_MANAGER"
                                  ? "from-purple-600 to-purple-400"
                                  : "from-blue-600 to-blue-400"
                              } flex items-center justify-center text-white font-bold text-sm`}
                            >
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {ROLES[user.role as RoleKey]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.location ? (
                            <div className="flex items-center gap-2 text-gray-300">
                              <MapPin className="w-4 h-4 text-cyan-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {user.location.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.location.locationType}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.isActive ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 text-sm">Inactive</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            {user.isActive ? (
                              <button
                                onClick={() => deactivateUserMutation.mutate(user.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Deactivate user"
                              >
                                <XCircle className="w-4 h-4 text-yellow-400" />
                              </button>
                            ) : (
                              <button
                                onClick={() => activateUserMutation.mutate(user.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Activate user"
                              >
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.pages > 1 && (
                <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Page {meta.page} of {meta.pages} • Total {meta.total} users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(meta.pages, p + 1))
                      }
                      disabled={currentPage === meta.pages}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingUser}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setFormData({
                      ...formData,
                      role: newRole,
                      // Clear location if MANAGER or TRANSPORT_PROVIDER role is selected
                      locationId: newRole === "MANAGER" || newRole === "TRANSPORT_PROVIDER" ? "" : formData.locationId,
                    });
                  }}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                >
                  {Object.entries(ROLES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location - Only show if not MANAGER or TRANSPORT_PROVIDER role */}
              {formData.role !== "MANAGER" && formData.role !== "TRANSPORT_PROVIDER" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                    <span className="text-red-400 ml-1">Required</span>
                  </label>
                  {locations.length > 0 ? (
                    <select
                      value={formData.locationId}
                      onChange={(e) =>
                        setFormData({ ...formData, locationId: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                    >
                      <option value="">Select a location</option>
                      {locations.map((location: Location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.locationType})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading locations...
                    </div>
                  )}
                </div>
              )}

              {/* Submit & Cancel */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {editingUser ? "Update User" : "Create User"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};