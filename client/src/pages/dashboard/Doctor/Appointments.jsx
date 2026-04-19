import React, { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  MessageCircleMore,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { doctorApi } from "@/services/doctor.api";
import { appointmentApi } from "@/services/appointment.api";

const renderAppointmentType = (type) => {
  const normalizedType = String(type || "").toLowerCase();

  if (normalizedType === "online") {
    return <Badge variant="secondary">Online</Badge>;
  }

  if (normalizedType === "in-person" || normalizedType === "inperson") {
    return <Badge variant="outline">In-person</Badge>;
  }

  return <Badge variant="outline">{type || "-"}</Badge>;
};

const renderActions = (row, updateStatus, isUpdating) => {
  const status = String(row.status || "").toLowerCase();
  const chatRoute = `/messages/${row.conversationId}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Open actions menu">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to={chatRoute} className="flex items-center gap-2">
            <MessageCircleMore className="size-4" />
            Chat
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={status !== "upcoming" || isUpdating}
          onClick={() => updateStatus(row.id, "completed")}
        >
          <CheckCircle2 className="size-4" />
          {isUpdating ? "Updating..." : "Mark as Completed"}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={status !== "upcoming" || isUpdating}
          onClick={() => updateStatus(row.id, "cancelled")}
        >
          <Ban className="size-4" />
          {isUpdating ? "Updating..." : "Cancel Appointment"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Appointment = () => {
  const [filter, setFilter] = useState("today");
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "doctor", filter],
    queryFn: () => {
      if (filter === "today") {
        return doctorApi.getAppointments({ filter: "today" });
      }

      return doctorApi.getAppointments({ status: filter });
    },
  });

  const filteredAppointments = useMemo(
    () =>
      (appointmentsQuery.data?.data?.appointments || []).map((appointment) => ({
        id: appointment._id,
        conversationId: appointment.conversation,
        patientName: appointment.patient?.fullName || "-",
        patientAge: "-",
        patientGender: "-",
        appointmentType: appointment.appointmentType,
        dateTime: appointment.dateTime,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
      })),
    [appointmentsQuery.data],
  );

  const statusMutation = useMutation({
    mutationFn: ({ appointmentId, status }) =>
      appointmentApi.updateStatus(appointmentId, { status }),
    onSuccess: (_response, variables) => {
      toast.success(
        variables.status === "completed"
          ? "Appointment marked as completed."
          : "Appointment cancelled.",
      );
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || "Failed to update appointment status.";
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

  const handleStatusUpdate = (appointmentId, status) => {
    if (statusMutation.isPending) return;
    statusMutation.mutate({ appointmentId, status });
  };

  const columns = useMemo(
    () => [
      {
        key: "patientName",
        label: "Patient Name",
        render: (row) => (
          <div className="space-y-0.5 min-w-0">
            <p className="font-medium text-foreground">{row.patientName}</p>
            <p className="text-xs text-muted-foreground">
              {row.patientAge} yrs · {row.patientGender}
            </p>
          </div>
        ),
      },
      {
        key: "dateTime",
        label: "Date & Time",
        render: (row) => {
          const date = new Date(row.dateTime);
          return (
            <div className="space-y-0.5">
              <p className="font-medium text-foreground">{formatDate(row.dateTime)}</p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(date)}
              </p>
            </div>
          );
        },
      },
      {
        key: "appointmentType",
        label: "Appointment Type",
        render: (row) => renderAppointmentType(row.appointmentType),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "paymentStatus",
        label: "Payment",
        render: (row) => <StatusBadge status={row.paymentStatus} />,
      },
      {
        key: "actions",
        label: "Actions",
        className: "w-[72px]",
        render: (row) => renderActions(row, handleStatusUpdate, statusMutation.isPending),
      },
    ],
    [statusMutation.isPending]
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
        <p className="text-sm text-destructive">Unable to load doctor appointments.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[95%] space-y-6 py-5 md:py-8 lg:max-w-[90%]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Monitor today&apos;s visits, upcoming schedules, and completed consultations.
          </p>
        </div>
        <div className="w-full md:w-55">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter appointments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTableCard
        title="Doctor Appointments"
        description="Patient sessions and operational actions"
        columns={columns}
        rows={filteredAppointments}
        minWidth="min-w-[1120px]"
        emptyState={
          <EmptyStateCard
            title="No Appointments Found"
            description="No appointments match this filter at the moment."
          />
        }
      />
    </div>
  );
};

export default Appointment;
