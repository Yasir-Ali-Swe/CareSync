import React, { useMemo } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { doctorApi } from "@/services/doctor.api";

const METRIC_ICONS = {
  totalPatients: Users,
  totalAppointments: CalendarDays,
  completedConsultations: CheckCircle2,
  pendingAppointments: Clock3,
  averageRating: Star,
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
    queryKey: ["doctor-stats"],
    queryFn: doctorApi.getStats,
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "doctor", "all"],
    queryFn: () => doctorApi.getAppointments(),
  });

  const metrics = statsQuery.data?.data?.metrics || {};
  const appointments = appointmentsQuery.data?.data?.appointments || [];

  const doctorStatsMetrics = [
    { key: "totalPatients", label: "Total Patients", value: metrics.totalPatients ?? 0 },
    { key: "totalAppointments", label: "Total Appointments", value: metrics.totalAppointments ?? 0 },
    { key: "completedConsultations", label: "Completed Consultations", value: metrics.completedConsultations ?? 0 },
    { key: "pendingAppointments", label: "Pending Appointments", value: metrics.pendingAppointments ?? 0 },
    { key: "averageRating", label: "Average Rating", value: "-" },
  ];

  const doctorMonthlyAppointments = useMemo(() => {
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

  const doctorPatientGrowth = useMemo(() => {
    const monthly = getLastSixMonths();
    const map = new Map(monthly.map((item) => [item.key, item]));
    const firstSeenByPatient = new Map();

    [...appointments]
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .forEach((appointment) => {
        const patientId = appointment.patient?._id;
        if (!patientId || firstSeenByPatient.has(patientId)) return;

        firstSeenByPatient.set(patientId, appointment.dateTime);
        const date = new Date(appointment.dateTime);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (map.has(key)) {
          map.get(key).value += 1;
        }
      });

    return monthly;
  }, [appointments]);

  const doctorStatusBreakdown = useMemo(() => {
    const values = { completed: 0, upcoming: 0, cancelled: 0 };

    appointments.forEach((appointment) => {
      const status = String(appointment.status || "").toLowerCase();
      if (status === "completed") values.completed += 1;
      else if (status === "cancelled") values.cancelled += 1;
      else values.upcoming += 1;
    });

    return [
      { label: "Completed", value: values.completed },
      { label: "Upcoming", value: values.upcoming },
      { label: "Cancelled", value: values.cancelled },
    ];
  }, [appointments]);

  const doctorRecentPatients = useMemo(() => {
    const patientMap = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;
      if (!patient?._id) return;

      const existing = patientMap.get(patient._id);
      const currentDate = new Date(appointment.dateTime);

      if (!existing) {
        patientMap.set(patient._id, {
          id: patient._id,
          patientName: patient.fullName || "-",
          concern: appointment.notes || "General consultation",
          lastVisit: appointment.dateTime,
          nextAppointment: "-",
          status: appointment.status,
        });
        return;
      }

      if (currentDate > new Date(existing.lastVisit)) {
        existing.lastVisit = appointment.dateTime;
        existing.status = appointment.status;
        if (!existing.concern || existing.concern === "General consultation") {
          existing.concern = appointment.notes || "General consultation";
        }
      }

      if (
        appointment.status === "upcoming" &&
        (existing.nextAppointment === "-" || currentDate < new Date(existing.nextAppointment))
      ) {
        existing.nextAppointment = appointment.dateTime;
        existing.status = "pending";
      }
    });

    return Array.from(patientMap.values())
      .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
      .slice(0, 8);
  }, [appointments]);

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
        <p className="text-sm text-destructive">Unable to load doctor dashboard data.</p>
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
