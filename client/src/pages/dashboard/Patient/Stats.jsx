import React, { useEffect, useMemo, useState } from "react";
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
import {
  patientAppointmentsOverTime,
  patientRecentActivities,
  patientStatsMetrics,
  patientStatusDistribution,
} from "@/dummyData/dashboardData";

const METRIC_ICONS = {
  totalAppointments: CalendarCheck,
  upcomingAppointments: CalendarClock,
  completedAppointments: CheckCircle2,
  totalDoctorsConsulted: Activity,
  unreadMessages: MessageSquareMore,
};

const Stats = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <DashboardPageSkeleton cardCount={5} />
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
