export const getDashboardRoutes = (role) => {
  switch (role) {
    case "patient":
      return [
        { name: "Stats", route: "/dashboard/patient/stats" },
        { name: "Appointments", route: "/dashboard/patient/appointments" },
        { name: "Profile", route: "/dashboard/patient/profile" },
      ];
    case "doctor":
      return [
        { name: "Stats", route: "/dashboard/doctor/stats" },
        { name: "Appointments", route: "/dashboard/doctor/appointments" },
        { name: "Availability", route: "/dashboard/doctor/availability" },
        { name: "Profile", route: "/dashboard/doctor/profile" },
      ];
    case "admin":
      return [
        { name: "Stats", route: "/dashboard/admin/stats" },
        { name: "Users", route: "/dashboard/admin/users-management" },
        { name: "Profile", route: "/dashboard/admin/profile" },
      ];
    default:
      return [];
  }
};

export const getDashboardHomeRoute = (role) => {
  switch (role) {
    case "patient":
      return "/dashboard/patient/stats";
    case "doctor":
      return "/dashboard/doctor/stats";
    case "admin":
      return "/dashboard/admin/stats";
    default:
      return "/";
  }
};
