import React, { useEffect, useState } from "react";
import { CalendarClock, Stethoscope, UserRound, UsersRound, UserCheck } from "lucide-react";
import StatCard from "@/components/dashboard/common/StatCard";
import BarChartCard from "@/components/dashboard/common/BarChartCard";
import DistributionChartCard from "@/components/dashboard/common/DistributionChartCard";
import DashboardPageSkeleton from "@/components/dashboard/common/DashboardPageSkeleton";
import {
  adminAppointmentStatusBreakdown,
  adminAppointmentTrends,
  adminSpecializationDistribution,
  adminStatsMetrics,
  adminUserGrowth,
} from "@/dummyData/dashboardData";

const METRIC_ICONS = {
  totalUsers: UsersRound,
  totalDoctors: Stethoscope,
  totalPatients: UserRound,
  totalAppointments: CalendarClock,
  activeDoctors: UserCheck,
};

const Stats = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

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
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          System analytics, platform growth, and operational health metrics.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {adminStatsMetrics.map((metric) => (
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
          title="User Growth"
          description="New user registrations by month"
          data={adminUserGrowth}
        />
        <BarChartCard
          title="Appointment Trends"
          description="Total booked appointments over time"
          data={adminAppointmentTrends}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DistributionChartCard
          title="Doctor Specialization Distribution"
          description="Coverage across major specialties"
          data={adminSpecializationDistribution}
        />
        <DistributionChartCard
          title="Appointment Status Breakdown"
          description="Platform-wide outcome mix"
          data={adminAppointmentStatusBreakdown}
        />
      </section>
    </div>
  );
};

export default Stats;
