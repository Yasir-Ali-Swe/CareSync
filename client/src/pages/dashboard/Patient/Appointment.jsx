import React, { useMemo, useState } from "react";
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
  formatDateTime,
} from "@/components/dashboard/common/dashboardUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { patientApi } from "@/services/patient.api";
import { appointmentApi } from "@/services/appointment.api";

const Appointment = () => {
  const [filter, setFilter] = useState("upcoming");
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "patient", filter],
    queryFn: () =>
      patientApi.getAppointments({
        status: filter === "all" ? "all" : filter,
      }),
  });

  const filteredAppointments = useMemo(
    () =>
      (appointmentsQuery.data?.data?.appointments || []).map((appointment) => ({
        id: appointment._id,
        doctorId: appointment.doctor?._id,
        conversationId: appointment.conversation,
        doctorName: appointment.doctor?.fullName || "-",
        specialization: appointment.doctorProfile?.specialization || "-",
        dateTime: appointment.dateTime,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
      })),
    [appointmentsQuery.data],
  );

  const cancelMutation = useMutation({
    mutationFn: ({ appointmentId }) => appointmentApi.cancel(appointmentId),
    onSuccess: () => {
      toast.success("Appointment cancelled.");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to cancel appointment.";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patient-stats"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

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
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={!canCancel || cancelMutation.isPending}
                      onClick={() => {
                        if (!canCancel) return;
                        cancelMutation.mutate({ appointmentId: row.id });
                      }}
                    >
                      <XCircle className="size-4" />
                      {cancelMutation.isPending ? "Cancelling..." : "Cancel Appointment"}
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

  if (appointmentsQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <DashboardPageSkeleton cardCount={4} />
      </div>
    );
  }

  if (appointmentsQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <p className="text-sm text-destructive">Unable to load appointments.</p>
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
