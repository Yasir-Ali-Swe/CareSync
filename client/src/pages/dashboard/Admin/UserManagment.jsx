import React, { useEffect, useMemo, useState } from "react";
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
import {
  filterUsersByRole,
  formatDate,
} from "@/components/dashboard/common/dashboardUtils";
import { usersManagementList } from "@/dummyData/dashboardData";

const UserManagment = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("doctor");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(
    () => filterUsersByRole(usersManagementList, filter),
    [filter]
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

    if (!isDoctorView) {
      return baseColumns;
    }

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
              <DropdownMenuItem disabled={row.status !== "active"}>
                <UserRoundX className="size-4" />
                Suspend User
              </DropdownMenuItem>
              <DropdownMenuItem>
                {row.status === "active" ? (
                  <>
                    <UserRoundX className="size-4" />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <UserRoundCheck className="size-4" />
                    Activate User
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];
  }, [isDoctorView]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <DashboardPageSkeleton cardCount={4} />
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
    </div>
  );
};

export default UserManagment;
