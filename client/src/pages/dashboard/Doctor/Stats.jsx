import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Star,
  Users,
} from "lucide-react";
import StatCard from "@/components/dashboard/common/StatCard";
import BarChartCard from "@/components/dashboard/common/BarChartCard";
import DistributionChartCard from "@/components/dashboard/common/DistributionChartCard";
import DataTableCard from "@/components/dashboard/common/DataTableCard";
import DashboardPageSkeleton from "@/components/dashboard/common/DashboardPageSkeleton";
import StatusBadge from "@/components/dashboard/common/StatusBadge";
import { formatDate } from "@/components/dashboard/common/dashboardUtils";
import {
  doctorMonthlyAppointments,
  doctorPatientGrowth,
  doctorRecentPatients,
  doctorStatsMetrics,
  doctorStatusBreakdown,
} from "@/dummyData/dashboardData";

const METRIC_ICONS = {
  totalPatients: Users,
  totalAppointments: CalendarDays,
  completedConsultations: CheckCircle2,
  pendingAppointments: Clock3,
  averageRating: Star,
};

const Stats = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const recentPatientColumns = useMemo(
    () => [
      { key: "patientName", label: "Patient Name" },
      { key: "concern", label: "Concern" },
      {
        key: "lastVisit",
        label: "Last Visit",
        render: (row) => formatDate(row.lastVisit),
      },
      {
        key: "nextAppointment",
        label: "Next Appointment",
        render: (row) =>
          row.nextAppointment === "-" ? "-" : formatDate(row.nextAppointment),
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
        <h1 className="text-2xl font-semibold">Doctor Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Performance insights, consultation trends, and patient follow-up pipeline.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {doctorStatsMetrics.map((metric) => (
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
          title="Monthly Appointments"
          description="Consultation volume by month"
          data={doctorMonthlyAppointments}
        />
        <BarChartCard
          title="Patient Growth"
          description="New patients onboarded per month"
          data={doctorPatientGrowth}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DistributionChartCard
          title="Status Breakdown"
          description="Current state of appointment outcomes"
          data={doctorStatusBreakdown}
        />
        <DataTableCard
          title="Recent Patients"
          description="Patients requiring immediate follow-up"
          columns={recentPatientColumns}
          rows={doctorRecentPatients}
          minWidth="min-w-[860px]"
          emptyState={<p className="text-sm text-muted-foreground">No recent patients available.</p>}
        />
      </section>
    </div>
  );
};

export default Stats;
