import React, { useMemo } from "react";
import { CalendarClock, Stethoscope, UserRound, UsersRound, UserCheck } from "lucide-react";
import StatCard from "@/components/dashboard/common/StatCard";
import BarChartCard from "@/components/dashboard/common/BarChartCard";
import DistributionChartCard from "@/components/dashboard/common/DistributionChartCard";
import DashboardPageSkeleton from "@/components/dashboard/common/DashboardPageSkeleton";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/admin.api";
import { appointmentApi } from "@/services/appointment.api";

const METRIC_ICONS = {
  totalUsers: UsersRound,
  totalDoctors: Stethoscope,
  totalPatients: UserRound,
  totalAppointments: CalendarClock,
  activeDoctors: UserCheck,
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
    queryKey: ["admin-stats"],
    queryFn: adminApi.getStats,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", "all"],
    queryFn: () => adminApi.getUsers({ role: "all" }),
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "admin", "all"],
    queryFn: () => appointmentApi.list({ status: "all" }),
  });

  const metrics = statsQuery.data?.data?.metrics || {};
  const adminSpecializationDistribution = statsQuery.data?.data?.specializationDistribution || [];
  const adminAppointmentStatusBreakdown = statsQuery.data?.data?.appointmentStatusBreakdown || [];
  const users = usersQuery.data?.data?.users || [];
  const appointments = appointmentsQuery.data?.data?.appointments || [];

  const adminStatsMetrics = [
    { key: "totalUsers", label: "Total Users", value: metrics.totalUsers ?? 0 },
    { key: "totalDoctors", label: "Total Doctors", value: metrics.totalDoctors ?? 0 },
    { key: "totalPatients", label: "Total Patients", value: metrics.totalPatients ?? 0 },
    { key: "totalAppointments", label: "Total Appointments", value: metrics.totalAppointments ?? 0 },
    { key: "activeDoctors", label: "Active Doctors", value: metrics.activeDoctors ?? 0 },
  ];

  const adminUserGrowth = useMemo(() => {
    const monthly = getLastSixMonths();
    const map = new Map(monthly.map((item) => [item.key, item]));

    users.forEach((user) => {
      const date = new Date(user.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (map.has(key)) {
        map.get(key).value += 1;
      }
    });

    return monthly;
  }, [users]);

  const adminAppointmentTrends = useMemo(() => {
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

  if (statsQuery.isLoading || usersQuery.isLoading || appointmentsQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <DashboardPageSkeleton cardCount={5} />
      </div>
    );
  }

  if (statsQuery.isError || usersQuery.isError || appointmentsQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-[95%] py-5 md:py-8 lg:max-w-[90%]">
        <p className="text-sm text-destructive">Unable to load admin dashboard data.</p>
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
