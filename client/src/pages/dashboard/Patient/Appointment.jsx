import React, { useEffect, useMemo, useState } from "react";
import { Eye, MessageCircle, MoreHorizontal, XCircle } from "lucide-react";
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
  canCancelPatientAppointment,
  filterPatientAppointments,
  formatDateTime,
} from "@/components/dashboard/common/dashboardUtils";
import { patientAppointments } from "@/dummyData/dashboardData";

const Appointment = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredAppointments = useMemo(
    () => filterPatientAppointments(patientAppointments, filter),
    [filter],
  );

  const columns = useMemo(
    () => [
      { key: "doctorName", label: "Doctor Name" },
      { key: "specialization", label: "Specialization" },
      {
        key: "dateTime",
        label: "Date & Time",
        render: (row) => formatDateTime(row.dateTime),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        label: "Actions",
        className: "w-[72px]",
        render: (row) => {
          const canCancel = row.status === "upcoming" && canCancelPatientAppointment(row);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Open actions menu">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link
                    to={`/doctor-profile/${row.doctorId}`}
                    className="flex items-center gap-2"
                  >
                    <Eye className="size-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to={`/messages/${row.conversationId}`}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="size-4" />
                    Chat
                  </Link>
                </DropdownMenuItem>
                {row.status === "upcoming" ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" disabled={!canCancel}>
                      <XCircle className="size-4" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

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
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Manage your upcoming, completed, and cancelled consultations.
          </p>
        </div>
        <div className="w-full md:w-55">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter appointments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTableCard
        title="All Appointments"
        description="Track each appointment and take quick actions"
        columns={columns}
        rows={filteredAppointments}
        minWidth="min-w-[930px]"
        emptyState={
          <EmptyStateCard
            title="No Appointments Found"
            description="There are no appointments in this category right now."
          />
        }
      />
    </div>
  );
};

export default Appointment;
