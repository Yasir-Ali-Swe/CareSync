export const patientStatsMetrics = [
  { key: "totalAppointments", label: "Total Appointments", value: "128" },
  { key: "upcomingAppointments", label: "Upcoming Appointments", value: "5" },
  { key: "completedAppointments", label: "Completed Appointments", value: "113" },
  { key: "totalDoctorsConsulted", label: "Doctors Consulted", value: "14" },
  { key: "unreadMessages", label: "Unread Messages", value: "7" },
];

export const patientAppointmentsOverTime = [
  { label: "Jan", value: 9 },
  { label: "Feb", value: 14 },
  { label: "Mar", value: 16 },
  { label: "Apr", value: 13 },
  { label: "May", value: 18 },
  { label: "Jun", value: 12 },
];

export const patientStatusDistribution = [
  { label: "Completed", value: 113 },
  { label: "Upcoming", value: 5 },
  { label: "Cancelled", value: 10 },
];

export const patientRecentActivities = [
  {
    id: "pa-activity-1",
    activity: "Follow-up consultation completed",
    doctorName: "Dr. Ayesha Malik",
    date: "2026-04-15",
    status: "completed",
  },
  {
    id: "pa-activity-2",
    activity: "Appointment scheduled",
    doctorName: "Dr. Faisal Qureshi",
    date: "2026-04-19",
    status: "upcoming",
  },
  {
    id: "pa-activity-3",
    activity: "Prescription review cancelled",
    doctorName: "Dr. Sana Riaz",
    date: "2026-04-10",
    status: "cancelled",
  },
  {
    id: "pa-activity-4",
    activity: "Lab result discussion completed",
    doctorName: "Dr. Hamza Nadeem",
    date: "2026-04-04",
    status: "completed",
  },
];

export const patientAppointments = [
  {
    id: "pa-1",
    doctorId: 1,
    conversationId: "1",
    doctorName: "Dr. Ayesha Malik",
    specialization: "Cardiology",
    dateTime: "2026-04-19T10:30:00",
    status: "upcoming",
    paymentStatus: "paid",
  },
  {
    id: "pa-2",
    doctorId: 2,
    conversationId: "2",
    doctorName: "Dr. Faisal Qureshi",
    specialization: "Dermatology",
    dateTime: "2026-04-22T14:00:00",
    status: "upcoming",
    paymentStatus: "unpaid",
  },
  {
    id: "pa-3",
    doctorId: 3,
    conversationId: "3",
    doctorName: "Dr. Sana Riaz",
    specialization: "Neurology",
    dateTime: "2026-03-28T16:15:00",
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "pa-4",
    doctorId: 4,
    conversationId: "4",
    doctorName: "Dr. Hamza Nadeem",
    specialization: "Orthopedics",
    dateTime: "2026-03-15T11:45:00",
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "pa-5",
    doctorId: 5,
    conversationId: "5",
    doctorName: "Dr. Nadia Asif",
    specialization: "Endocrinology",
    dateTime: "2026-02-25T09:00:00",
    status: "cancelled",
    paymentStatus: "refunded",
  },
  {
    id: "pa-6",
    doctorId: 6,
    conversationId: "6",
    doctorName: "Dr. Bilal Ahmed",
    specialization: "ENT",
    dateTime: "2026-04-30T13:30:00",
    status: "upcoming",
    paymentStatus: "unpaid",
  },
  {
    id: "pa-7",
    doctorId: 7,
    conversationId: "7",
    doctorName: "Dr. Zainab Sheikh",
    specialization: "General Medicine",
    dateTime: "2026-01-22T12:00:00",
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "pa-8",
    doctorId: 8,
    conversationId: "8",
    doctorName: "Dr. Kamran Ilyas",
    specialization: "Pulmonology",
    dateTime: "2026-02-05T10:00:00",
    status: "cancelled",
    paymentStatus: "refunded",
  },
];

export const doctorStatsMetrics = [
  { key: "totalPatients", label: "Total Patients", value: "342" },
  { key: "totalAppointments", label: "Total Appointments", value: "518" },
  { key: "completedConsultations", label: "Completed Consultations", value: "473" },
  { key: "pendingAppointments", label: "Pending Appointments", value: "21" },
  { key: "averageRating", label: "Average Rating", value: "4.8 / 5" },
];

export const doctorMonthlyAppointments = [
  { label: "Jan", value: 62 },
  { label: "Feb", value: 77 },
  { label: "Mar", value: 83 },
  { label: "Apr", value: 89 },
  { label: "May", value: 94 },
  { label: "Jun", value: 78 },
];

export const doctorPatientGrowth = [
  { label: "Jan", value: 18 },
  { label: "Feb", value: 24 },
  { label: "Mar", value: 27 },
  { label: "Apr", value: 31 },
  { label: "May", value: 29 },
  { label: "Jun", value: 22 },
];

export const doctorStatusBreakdown = [
  { label: "Completed", value: 473 },
  { label: "Pending", value: 21 },
  { label: "Cancelled", value: 24 },
];

export const doctorRecentPatients = [
  {
    id: "dr-patient-1",
    patientName: "Mariam Khan",
    concern: "Hypertension Follow-up",
    lastVisit: "2026-04-16",
    nextAppointment: "2026-04-24",
    status: "pending",
  },
  {
    id: "dr-patient-2",
    patientName: "Usman Tariq",
    concern: "Post-operative Review",
    lastVisit: "2026-04-14",
    nextAppointment: "2026-04-29",
    status: "pending",
  },
  {
    id: "dr-patient-3",
    patientName: "Areeba Noor",
    concern: "Migraine Management",
    lastVisit: "2026-04-11",
    nextAppointment: "-",
    status: "completed",
  },
  {
    id: "dr-patient-4",
    patientName: "Daniyal Shah",
    concern: "Annual Wellness Check",
    lastVisit: "2026-04-09",
    nextAppointment: "2026-05-03",
    status: "pending",
  },
];

export const doctorAppointments = [
  {
    id: "dr-a-1",
    conversationId: "conv-1",
    patientName: "Mariam Khan",
    patientAge: 32,
    patientGender: "Female",
    appointmentType: "Online",
    dateTime: "2026-04-17T09:30:00",
    status: "upcoming",
    paymentStatus: "paid",
  },
  {
    id: "dr-a-2",
    conversationId: "conv-2",
    patientName: "Usman Tariq",
    patientAge: 41,
    patientGender: "Male",
    appointmentType: "In-person",
    dateTime: "2026-04-17T11:00:00",
    status: "upcoming",
    paymentStatus: "unpaid",
  },
  {
    id: "dr-a-3",
    conversationId: "conv-3",
    patientName: "Sana Irfan",
    patientAge: 27,
    patientGender: "Female",
    appointmentType: "Online",
    dateTime: "2026-04-20T10:00:00",
    status: "upcoming",
    paymentStatus: "paid",
  },
  {
    id: "dr-a-4",
    conversationId: "conv-4",
    patientName: "Ali Hassan",
    patientAge: 55,
    patientGender: "Male",
    appointmentType: "In-person",
    dateTime: "2026-04-23T14:30:00",
    status: "upcoming",
    paymentStatus: "unpaid",
  },
  {
    id: "dr-a-5",
    conversationId: "conv-5",
    patientName: "Areeba Noor",
    patientAge: 29,
    patientGender: "Female",
    appointmentType: "Online",
    dateTime: "2026-04-11T15:00:00",
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "dr-a-6",
    conversationId: "conv-6",
    patientName: "Bilal Ahmed",
    patientAge: 46,
    patientGender: "Male",
    appointmentType: "In-person",
    dateTime: "2026-04-08T12:30:00",
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "dr-a-7",
    conversationId: "conv-7",
    patientName: "Hina Rauf",
    patientAge: 38,
    patientGender: "Female",
    appointmentType: "Online",
    dateTime: "2026-04-03T16:45:00",
    status: "cancelled",
    paymentStatus: "refunded",
  },
  {
    id: "dr-a-8",
    conversationId: "conv-8",
    patientName: "Kamran Siddiqui",
    patientAge: 33,
    patientGender: "Male",
    appointmentType: "In-person",
    dateTime: "2026-04-28T09:15:00",
    status: "upcoming",
    paymentStatus: "paid",
  },
];

export const adminStatsMetrics = [
  { key: "totalUsers", label: "Total Users", value: "19,842" },
  { key: "totalDoctors", label: "Total Doctors", value: "2,184" },
  { key: "totalPatients", label: "Total Patients", value: "17,658" },
  { key: "totalAppointments", label: "Total Appointments", value: "58,432" },
  { key: "activeDoctors", label: "Active Doctors", value: "1,763" },
];

export const adminUserGrowth = [
  { label: "Jan", value: 980 },
  { label: "Feb", value: 1120 },
  { label: "Mar", value: 1260 },
  { label: "Apr", value: 1385 },
  { label: "May", value: 1490 },
  { label: "Jun", value: 1605 },
];

export const adminAppointmentTrends = [
  { label: "Jan", value: 8210 },
  { label: "Feb", value: 8675 },
  { label: "Mar", value: 9140 },
  { label: "Apr", value: 9710 },
  { label: "May", value: 10220 },
  { label: "Jun", value: 10840 },
];

export const adminSpecializationDistribution = [
  { label: "General Medicine", value: 510 },
  { label: "Cardiology", value: 286 },
  { label: "Dermatology", value: 241 },
  { label: "Neurology", value: 191 },
  { label: "Orthopedics", value: 209 },
  { label: "Other", value: 747 },
];

export const adminAppointmentStatusBreakdown = [
  { label: "Completed", value: 46120 },
  { label: "Pending", value: 7830 },
  { label: "Cancelled", value: 4482 },
];

export const usersManagementList = [
  {
    id: "usr-1",
    doctorId: 1,
    name: "Dr. Ayesha Malik",
    email: "ayesha.malik@caresync.app",
    role: "doctor",
    status: "active",
    joinedDate: "2025-02-15",
  },
  {
    id: "usr-2",
    doctorId: 2,
    name: "Dr. Faisal Qureshi",
    email: "faisal.qureshi@caresync.app",
    role: "doctor",
    status: "suspended",
    joinedDate: "2024-11-22",
  },
  {
    id: "usr-3",
    name: "Mariam Khan",
    email: "mariam.khan@email.com",
    role: "patient",
    status: "active",
    joinedDate: "2025-08-03",
  },
  {
    id: "usr-4",
    name: "Usman Tariq",
    email: "usman.tariq@email.com",
    role: "patient",
    status: "inactive",
    joinedDate: "2025-07-19",
  },
  {
    id: "usr-5",
    name: "Areeba Noor",
    email: "areeba.noor@email.com",
    role: "patient",
    status: "active",
    joinedDate: "2026-01-10",
  },
  {
    id: "usr-6",
    doctorId: 6,
    name: "Dr. Sana Riaz",
    email: "sana.riaz@caresync.app",
    role: "doctor",
    status: "active",
    joinedDate: "2025-04-09",
  },
  {
    id: "usr-7",
    name: "Hina Rauf",
    email: "hina.rauf@email.com",
    role: "patient",
    status: "suspended",
    joinedDate: "2024-12-01",
  },
  {
    id: "usr-8",
    doctorId: 8,
    name: "Dr. Kamran Ilyas",
    email: "kamran.ilyas@caresync.app",
    role: "doctor",
    status: "active",
    joinedDate: "2025-09-27",
  },
];
