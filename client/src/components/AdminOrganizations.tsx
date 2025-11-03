import { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Mail,
  Calendar,
  Users,
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { getAuthHeader } from "../auth/tokenAuth";

interface Organization {
  id: number;
  name: string;
  description: string | null;
  contactEmail: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    event: number;
  };
}

interface Event {
  id: number;
  title: string;
  date: string;
  status: string;
  category: string;
  _count?: {
    ticket: number;
  };
}

interface OrganizationDetails extends Organization {
  events?: Event[];
  organizerCount?: number;
}

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");

  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetails | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    contactEmail: "",
    isActive: true,
  });

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    contactEmail: "",
    isActive: true,
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const getAuthHeaders = () => {
    return {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/organizations`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationDetails = async (orgId: number) => {
    try {
      const orgResponse = await fetch(
        `${API_BASE_URL}/api/admin/organizations/${orgId}`,
        {
          headers: getAuthHeaders(),
        },
      );

      const eventsResponse = await fetch(
        `${API_BASE_URL}/api/admin/organizations/${orgId}/events`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (orgResponse.ok && eventsResponse.ok) {
        const orgData = await orgResponse.json();
        const eventsData = await eventsResponse.json();

        setSelectedOrg({
          ...orgData,
          events: eventsData,
        });
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching organization details:", error);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      alert("Organization name is required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/organizations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        await fetchOrganizations();
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          description: "",
          contactEmail: "",
          isActive: true,
        });
        alert("Organization created successfully!");
      } else {
        const errorData = await response.json();
        alert(
          `Failed to create organization: ${errorData.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Failed to create organization");
    }
  };

  const handleEdit = (org: Organization) => {
    setEditForm({
      name: org.name,
      description: org.description || "",
      contactEmail: org.contactEmail || "",
      isActive: org.isActive,
    });
    setSelectedOrg(org);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrg) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/organizations/${selectedOrg.id}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(editForm),
        },
      );

      if (response.ok) {
        await fetchOrganizations();
        setShowEditModal(false);
        alert("Organization updated successfully!");
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update organization");
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/organizations/${selectedOrg.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        await fetchOrganizations();
        setShowDeleteModal(false);
        setShowDetailsModal(false);
        alert("Organization deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("Failed to delete organization");
    }
  };

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === "all" ||
      (filterActive === "active" && org.isActive) ||
      (filterActive === "inactive" && !org.isActive);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredOrganizations.length}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          Create Organization
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <div
            key={org.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{org.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      org.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {org.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {org.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {org.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              {org.contactEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{org.contactEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{org._count.event} events</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => fetchOrganizationDetails(org.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => handleEdit(org)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedOrg(org);
                  setShowDeleteModal(true);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No organizations found matching your criteria.
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Create New Organization
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Add a new organization to the platform
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="Enter organization name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter organization description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={createForm.contactEmail}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      contactEmail: e.target.value,
                    })
                  }
                  placeholder="contact@organization.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-isActive"
                  checked={createForm.isActive}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="create-isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    name: "",
                    description: "",
                    contactEmail: "",
                    isActive: true,
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Organization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedOrg.name}
                  </h2>
                  <span
                    className={`inline-block px-3 py-1 text-sm rounded-full mt-2 ${
                      selectedOrg.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedOrg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Organization Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Organization Information
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {selectedOrg.description && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Description:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {selectedOrg.description}
                      </p>
                    </div>
                  )}
                  {selectedOrg.contactEmail && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Contact Email:
                      </span>
                      <p className="text-gray-900 mt-1">
                        {selectedOrg.contactEmail}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Created:
                    </span>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedOrg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-900">
                          {selectedOrg._count.event}
                        </div>
                        <div className="text-sm text-blue-600">
                          Total Events
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-900">
                          {selectedOrg.organizerCount || 0}
                        </div>
                        <div className="text-sm text-purple-600">
                          Organizers
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              {selectedOrg.events && selectedOrg.events.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Events</h3>
                  <div className="space-y-2">
                    {selectedOrg.events.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} •{" "}
                            {event.category}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            event.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : event.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedOrg);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Edit Organization
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Organization
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Update organization details
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Organization name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Organization description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactEmail: e.target.value })
                  }
                  placeholder="contact@organization.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="edit-isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Delete Organization
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  Are you sure you want to delete{" "}
                  <strong>{selectedOrg.name}</strong>? This will also delete all
                  associated events ({selectedOrg._count.event}).
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
