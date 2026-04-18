import React, { useEffect, useMemo, useState } from "react";
import { Eye, MessageCircleMore, RefreshCw } from "lucide-react";
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
  filterDoctorAppointments,
  formatDateTime,
} from "@/components/dashboard/common/dashboardUtils";
import { doctorAppointments } from "@/dummyData/dashboardData";

const Appointment = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const filteredAppointments = useMemo(
    () => filterDoctorAppointments(doctorAppointments, filter),
    [filter]
  );

  const columns = useMemo(
    () => [
      { key: "patientName", label: "Patient Name" },
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
        className: "min-w-[260px]",
        render: () => (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="size-4" />
              View Patient
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircleMore className="size-4" />
              Open Chat
            </Button>
            <Button variant="secondary" size="sm">
              <RefreshCw className="size-4" />
              Update Status
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
