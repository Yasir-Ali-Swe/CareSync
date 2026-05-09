import React, { useMemo, useState } from "react";
import {
  Eye,
  MoreHorizontal,
  UserRoundX,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTableCard from "@/components/dashboard/common/DataTableCard";
import DashboardPageSkeleton from "@/components/dashboard/common/DashboardPageSkeleton";
import EmptyStateCard from "@/components/dashboard/common/EmptyStateCard";
import StatusBadge from "@/components/dashboard/common/StatusBadge";
import { formatDate } from "@/components/dashboard/common/dashboardUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApi } from "@/services/admin.api";

const UserManagement = () => {
  const [filter, setFilter] = useState("doctor");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "patient" });

  const createUserMutation = useMutation({
    mutationFn: (payload) => adminApi.createUser(payload),
    onSuccess: async () => {
      setShowCreateModal(false);
      setNewUser({ fullName: "", email: "", password: "", role: "patient" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
      ]);
      toast.success("User created");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to create user.");
    },
  });

  const handleCreateUser = () => {
    // Basic validation
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      toast.error("Please fill all required fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error("Please provide a valid email address");
      return;
    }
    if (newUser.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    createUserMutation.mutate(newUser);
  };

  const usersQuery = useQuery({
    queryKey: ["admin-users", filter, currentPage],
    queryFn: () => adminApi.getUsers({ role: filter, page: currentPage, limit: PAGE_SIZE }),
    keepPreviousData: true,
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }) => adminApi.updateUserStatus(userId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] }),
      ]);
      toast.success("User status updated");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update user status.");
    },
  });

  const handleStatusChange = (userId, status) => {
    updateUserStatusMutation.mutate({ userId, status });
  };

  const filteredUsers = useMemo(
    () =>
      (usersQuery.data?.data?.users || []).map((user) => ({
        id: user._id,
        doctorId: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        joinedDate: user.createdAt,
      })),
    [usersQuery.data],
  );

  const isDoctorView = filter === "doctor";

  const columns = useMemo(() => {
    const baseColumns = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        render: (row) => row.role.charAt(0).toUpperCase() + row.role.slice(1),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "joinedDate",
        label: "Joined Date",
        render: (row) => formatDate(row.joinedDate),
      },
    ];

    return [
      ...baseColumns,
      {
        key: "actions",
        label: "Actions",
        className: "min-w-[240px]",
        render: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Open actions menu">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {row.role === "doctor" ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/doctor-profile/${row.doctorId}`}
                      className="flex items-center gap-2"
                    >
                      <Eye className="size-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
                <DropdownMenuItem
                disabled={row.status !== "active" || updateUserStatusMutation.isLoading}
                onSelect={(event) => {
                  event.preventDefault();
                  if (row.status === "active") {
                    handleStatusChange(row.id, "suspended");
                  }
                }}
              >
                <UserRoundX className="size-4" />
                Suspend User
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={row.status === "active" || updateUserStatusMutation.isLoading}
                onSelect={(event) => {
                  event.preventDefault();
                  if (row.status !== "active") {
                    handleStatusChange(row.id, "active");
                  }
                }}
              >
                <UserRoundCheck className="size-4" />
                Activate User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
  }, [handleStatusChange, updateUserStatusMutation.isLoading]);

  if (usersQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <DashboardPageSkeleton cardCount={4} />
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <p className="text-sm text-destructive">Unable to load users list.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[95%] space-y-6 py-5 md:py-8 lg:max-w-[90%]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage doctors and patients, and control account access across the platform.
          </p>
        </div>
        <div className="w-full md:w-55">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">Doctors</SelectItem>
              <SelectItem value="patient">Patients</SelectItem>
              <SelectItem value="all">All Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create User Button + Modal */}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateModal(true)}>Create User</Button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateModal(false)} />
          <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create User</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input className="w-full border px-3 py-2" value={newUser.fullName} onChange={(e)=>setNewUser({...newUser, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input className="w-full border px-3 py-2" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input type="password" className="w-full border px-3 py-2" value={newUser.password} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">Role</label>
                <select className="w-full border px-3 py-2" value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => handleCreateUser()} disabled={createUserMutation.isLoading}>Create</Button>
            </div>
          </div>
        </div>
      )}

      <DataTableCard
        title="Platform Users"
        description="Directory of all registered accounts"
        columns={columns}
        rows={filteredUsers}
        minWidth={isDoctorView ? "min-w-[980px]" : "min-w-[840px]"}
        emptyState={
          <EmptyStateCard
            title="No Users Found"
            description="No users match the selected filter."
          />
        }
      />

      {/* Pagination Controls */}
      {usersQuery.data?.data?.pagination && (
        <div className="flex items-center justify-center gap-4 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={
              !usersQuery.data?.data?.pagination?.hasPrevPage || usersQuery.isLoading
            }
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {usersQuery.data?.data?.pagination?.page} of{" "}
            {usersQuery.data?.data?.pagination?.totalPages} (
            {usersQuery.data?.data?.pagination?.total} total users)
          </span>

          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={
              !usersQuery.data?.data?.pagination?.hasNextPage || usersQuery.isLoading
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
