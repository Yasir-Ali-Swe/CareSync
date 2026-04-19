export const ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  ADMIN: "admin",
};

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

export const APPOINTMENT_STATUS = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING: "pending",
};

export const APPOINTMENT_TYPE = {
  ONLINE: "online",
  IN_PERSON: "in-person",
};

export const PAYMENT_STATUS = {
  PAID: "paid",
  UNPAID: "unpaid",
  REFUNDED: "refunded",
};

export const PAYMENT_METHOD = {
  ONLINE: "Pay Online",
  CASH: "Pay at Clinic (Cash)",
};

export const GENDERS = ["male", "female", "other"];

export const RELATIONSHIPS = ["Father", "Mother", "Spouse", "Sibling", "Child", "Other"];

export const NOTIFICATION_TYPES = {
  APPOINTMENT_CONFIRMED: "appointment_confirmed",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  APPOINTMENT_REMINDER: "appointment_reminder",
  CHAT_MESSAGE: "chat_message",
  SYSTEM: "system",
};
