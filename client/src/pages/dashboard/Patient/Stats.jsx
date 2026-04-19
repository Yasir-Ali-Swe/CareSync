import React, { useMemo } from "react";
import {
  Activity,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  MessageSquareMore,
} from "lucide-react";
import StatCard from "@/components/dashboard/common/StatCard";
import BarChartCard from "@/components/dashboard/common/BarChartCard";
import DistributionChartCard from "@/components/dashboard/common/DistributionChartCard";
import DataTableCard from "@/components/dashboard/common/DataTableCard";
import DashboardPageSkeleton from "@/components/dashboard/common/DashboardPageSkeleton";
import StatusBadge from "@/components/dashboard/common/StatusBadge";
import { formatDate } from "@/components/dashboard/common/dashboardUtils";
import { useQuery } from "@tanstack/react-query";
import { patientApi } from "@/services/patient.api";

const METRIC_ICONS = {
  totalAppointments: CalendarCheck,
  upcomingAppointments: CalendarClock,
  completedAppointments: CheckCircle2,
  totalDoctorsConsulted: Activity,
  unreadMessages: MessageSquareMore,
};

const getLastSixMonths = () => {
  const now = new Date();
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      value: 0,
    };
  });
};

const Stats = () => {
  const statsQuery = useQuery({
    queryKey: ["patient-stats"],
    queryFn: patientApi.getStats,
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "patient", "all"],
    queryFn: () => patientApi.getAppointments({ status: "all" }),
  });

  const metrics = statsQuery.data?.data?.metrics || {};
  const appointments = appointmentsQuery.data?.data?.appointments || [];

  const patientStatsMetrics = [
    { key: "totalAppointments", label: "Total Appointments", value: metrics.totalAppointments ?? 0 },
    { key: "upcomingAppointments", label: "Upcoming Appointments", value: metrics.upcomingAppointments ?? 0 },
    { key: "completedAppointments", label: "Completed Appointments", value: metrics.completedAppointments ?? 0 },
    { key: "totalDoctorsConsulted", label: "Doctors Consulted", value: metrics.totalDoctorsConsulted ?? 0 },
    { key: "unreadMessages", label: "Unread Messages", value: 0 },
  ];

  const patientStatusDistribution = [
    { label: "Completed", value: metrics.completedAppointments ?? 0 },
    { label: "Upcoming", value: metrics.upcomingAppointments ?? 0 },
    { label: "Cancelled", value: metrics.cancelledAppointments ?? 0 },
  ];

  const patientAppointmentsOverTime = useMemo(() => {
    const monthly = getLastSixMonths();
    const map = new Map(monthly.map((item) => [item.key, item]));

    appointments.forEach((appointment) => {
      const date = new Date(appointment.dateTime);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (map.has(key)) {
        map.get(key).value += 1;
      }
    });

    return monthly;
  }, [appointments]);

  const patientRecentActivities = useMemo(
    () =>
      appointments.slice(0, 8).map((appointment) => ({
        id: appointment._id,
        activity:
          appointment.status === "completed"
            ? "Consultation completed"
            : appointment.status === "cancelled"
              ? "Appointment cancelled"
              : "Appointment scheduled",
        doctorName: appointment.doctor?.fullName || "-",
        date: appointment.dateTime,
        status: appointment.status,
      })),
    [appointments],
  );

  const activityColumns = useMemo(
    () => [
      { key: "activity", label: "Activity" },
      { key: "doctorName", label: "Doctor" },
      {
        key: "date",
        label: "Date",
        render: (row) => formatDate(row.date),
      },
      {
        key: "status",
        label: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
    ],
    []
  );

  if (statsQuery.isLoading || appointmentsQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <DashboardPageSkeleton cardCount={5} />
      </div>
    );
  }

  if (statsQuery.isError || appointmentsQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <p className="text-sm text-destructive">Unable to load patient dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[95%] space-y-6 py-5 md:py-8 lg:max-w-[90%]">
      <div>
        <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your appointments, consultations, and communication activity.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {patientStatsMetrics.map((metric) => (
          <StatCard
            key={metric.key}
            title={metric.label}
            value={metric.value}
            icon={METRIC_ICONS[metric.key]}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BarChartCard
          title="Appointments Over Time"
          description="Monthly booking pattern across recent periods"
          data={patientAppointmentsOverTime}
        />
        <DistributionChartCard
          title="Status Distribution"
          description="Breakdown of current appointment states"
          data={patientStatusDistribution}
        />
      </section>

      <section>
        <DataTableCard
          title="Recent Activity"
          description="Latest interactions and appointment events"
          columns={activityColumns}
          rows={patientRecentActivities}
          minWidth="min-w-[720px]"
          emptyState={<p className="text-sm text-muted-foreground">No recent activity available.</p>}
        />
      </section>
    </div>
  );
};

export default Stats;
