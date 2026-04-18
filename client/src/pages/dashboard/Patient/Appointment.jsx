import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle, Eye, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    [filter]
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
        className: "min-w-[220px]",
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="size-4" />
              View
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="size-4" />
              Chat
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!canCancelPatientAppointment(row)}
            >
              Cancel
            </Button>
          </div>
        ),
      },
    ],
    []
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
        emptyState={
          <EmptyStateCard
            title="No Appointments Found"
            description="There are no appointments in this category right now."
          />
        }
      />

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground flex items-start gap-2">
        <CalendarRange className="mt-0.5 size-4" />
        <p>
          Cancellation is available for upcoming appointments with at least 24 hours remaining.
        </p>
      </div>
    </div>
  );
};

export default Appointment;
