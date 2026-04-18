export const formatDate = (dateValue) => {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (dateValue) => {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const isTodayDate = (dateValue) => {
  const now = new Date();
  const date = new Date(dateValue);

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export const isFutureDate = (dateValue) => {
  return new Date(dateValue).getTime() > Date.now();
};

export const canCancelPatientAppointment = (appointment) => {
  if (appointment.status !== "upcoming") {
    return false;
  }

  const appointmentDate = new Date(appointment.dateTime).getTime();
  const minCancellationWindowMs = 24 * 60 * 60 * 1000;

  return appointmentDate - Date.now() >= minCancellationWindowMs;
};

export const filterPatientAppointments = (appointments, filter) => {
  if (filter === "all") {
    return appointments;
  }

  return appointments.filter((appointment) => appointment.status === filter);
};

export const filterDoctorAppointments = (appointments, filter) => {
  switch (filter) {
    case "today":
      return appointments.filter((appointment) => isTodayDate(appointment.dateTime));
    case "upcoming":
      return appointments.filter(
        (appointment) => appointment.status === "pending" && isFutureDate(appointment.dateTime)
      );
    case "completed":
    case "cancelled":
      return appointments.filter((appointment) => appointment.status === filter);
    default:
      return appointments;
  }
};

export const filterUsersByRole = (users, filter) => {
  if (filter === "all") {
    return users;
  }

  return users.filter((user) => user.role === filter);
};
