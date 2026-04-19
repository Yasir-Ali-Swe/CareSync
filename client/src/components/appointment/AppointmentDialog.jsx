import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sunrise, SunMedium, Sunset } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { appointmentApi } from "@/services/appointment.api";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getCurrentWeekDays() {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function getClinicTimings(dayOfWeek) {
  if (dayOfWeek === 0) return null;

  const schedule = {
    1: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" }, // Mon
    2: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" }, // Tue
    3: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" }, // Wed
    4: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" }, // Thu
    5: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" }, // Fri
    6: { morning: "9:00 AM – 12:00 PM", evening: null }, // Sat (morning only)
  };

  return schedule[dayOfWeek] ?? null;
}

function BookAppointmentDialog({ doc, children }) {
  const weekDays = getCurrentWeekDays();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const selectedDay = weekDays[selectedDayIdx];
  const timings = getClinicTimings(selectedDay.getDay());

  const handleDaySelect = (idx) => {
    setSelectedDayIdx(idx);
    setPaymentMethod(null);
  };

  const bookingMutation = useMutation({
    mutationFn: appointmentApi.book,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["appointments", "patient"] });

      const previousAppointments = queryClient.getQueriesData({
        queryKey: ["appointments", "patient"],
      });

      const optimisticAppointment = {
        _id: `temp-${Date.now()}`,
        doctor: { _id: payload.doctorId, fullName: doc?.fullName || "Doctor" },
        doctorProfile: { specialization: doc?.specialization || "-" },
        dateTime: payload.dateTime,
        status: "upcoming",
        paymentStatus: payload.paymentMethod === "online" ? "paid" : "unpaid",
        appointmentType: "in-person",
        conversation: null,
      };

      queryClient.setQueriesData({ queryKey: ["appointments", "patient"] }, (old) => {
        const appointments = old?.data?.appointments || [];

        return {
          ...(old || {}),
          data: {
            ...(old?.data || {}),
            appointments: [optimisticAppointment, ...appointments],
          },
        };
      });

      return { previousAppointments };
    },
    onError: (error, _payload, context) => {
      (context?.previousAppointments || []).forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });

      const errorMessage = error?.response?.data?.message || "Failed to book appointment.";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully.");
      setOpen(false);
      setPaymentMethod(null);
      setSelectedDayIdx(0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["patient-stats"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const handleConfirm = () => {
    if (!paymentMethod || !timings || bookingMutation.isPending) return;

    const appointmentDateTime = new Date(selectedDay);
    appointmentDateTime.setHours(9, 0, 0, 0);

    bookingMutation.mutate({
      doctorId: doc?.id,
      dateTime: appointmentDateTime.toISOString(),
      appointmentType: "in-person",
      paymentMethod: paymentMethod === "Pay Online" ? "online" : "cash",
      notes: "",
    });
  };

  const canConfirm = paymentMethod && timings;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm w-full lg:max-w-lg max-h-[95vh] overflow-y-auto">
        {/* ── Header ── */}
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-xl font-bold text-primary">
            Book Appointment
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="w-12 h-12 shadow">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?img=${doc.id}`}
                  alt={doc.fullName}
                />
                <AvatarFallback>{doc.fullName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-base leading-tight">
                  {doc.fullName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {doc.specialization} · {doc.city}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Select Day
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 pb-1">
            {weekDays.map((day, idx) => {
              const isSelected = idx === selectedDayIdx;
              const isToday = idx === 0;
              const closed = getClinicTimings(day.getDay()) === null;
              return (
                <button
                  key={idx}
                  onClick={() => !closed && handleDaySelect(idx)}
                  disabled={closed}
                  className={`flex flex-col items-center min-w-14 px-2 py-2 rounded-md border text-sm transition-all
                    ${
                      closed
                        ? "opacity-40 cursor-not-allowed bg-muted border-transparent"
                        : isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow cursor-pointer"
                          : "bg-secondary text-foreground border-transparent hover:border-primary cursor-pointer"
                    }`}
                >
                  <span className="font-semibold text-xs uppercase">
                    {isToday ? "Today" : DAY_NAMES[day.getDay()]}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {day.getDate()}
                  </span>
                  <span className="text-xs opacity-70">
                    {MONTH_NAMES[day.getMonth()]}
                  </span>
                  {closed && (
                    <span className="text-[9px] font-semibold mt-0.5 opacity-60">
                      Closed
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Clinic Timings for selected day ── */}
        <div className="mt-5">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Clinic Timings —{" "}
            <span className="text-foreground normal-case font-bold">
              {DAY_NAMES[selectedDay.getDay()]}, {selectedDay.getDate()}{" "}
              {MONTH_NAMES[selectedDay.getMonth()]}
            </span>
          </p>

          {!timings ? (
            <div className="flex items-center gap-2 p-4 rounded-md bg-muted text-muted-foreground text-sm">
              <span className="text-lg">🚫</span>
              Clinic is closed on this day.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Morning */}
              <div className="flex items-center justify-between p-3 rounded-md border bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900">
                <div className="flex items-center gap-3">
                  <Sunrise className="text-2xl" />
                  <div>
                    <p className="text-sm font-semibold">Morning</p>
                    <p className="text-xs text-muted-foreground">
                      {timings.morning}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 font-semibold text-xs">
                  Available
                </Badge>
              </div>

              {/* Afternoon — always closed */}
              <div className="flex items-center justify-between p-3 rounded-md border bg-muted border-transparent opacity-50">
                <div className="flex items-center gap-3">
                  <SunMedium className="text-2xl" />
                  <div>
                    <p className="text-sm font-semibold">Afternoon</p>
                    <p className="text-xs text-muted-foreground italic">
                      12:00 PM – 5:00 PM
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Not Available
                </Badge>
              </div>

              {/* Evening */}
              {timings.evening ? (
                <div className="flex items-center justify-between p-3 rounded-md border bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                  <div className="flex items-center gap-3">
                    <Sunset className="text-2xl" />
                    <div>
                      <p className="text-sm font-semibold">Evening</p>
                      <p className="text-xs text-muted-foreground">
                        {timings.evening}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 font-semibold text-xs">
                    Available
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted border-transparent opacity-50">
                  <div className="flex items-center gap-3">
                    <Sunset className="text-2xl" />
                    <div>
                      <p className="text-sm font-semibold">Evening</p>
                      <p className="text-xs text-muted-foreground italic">
                        6:00 PM – 10:00 PM
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Not Available
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Payment Method ── */}
        {timings && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("Pay Online")}
                className={`flex flex-col items-center gap-1 p-3 rounded-md border text-sm font-medium transition-all cursor-pointer
                  ${
                    paymentMethod === "Pay Online"
                      ? "bg-primary text-primary-foreground border-primary shadow"
                      : "bg-secondary border-transparent hover:border-primary"
                  }`}
              >
                <span className="text-xl">💳</span>
                Pay Online
              </button>
              <button
                onClick={() => setPaymentMethod("Pay at Clinic (Cash)")}
                className={`flex flex-col items-center gap-1 p-3 rounded-md border text-sm font-medium transition-all cursor-pointer
                  ${
                    paymentMethod === "Pay at Clinic (Cash)"
                      ? "bg-primary text-primary-foreground border-primary shadow"
                      : "bg-secondary border-transparent hover:border-primary"
                  }`}
              >
                <span className="text-xl">💵</span>
                Pay at Clinic
              </button>
            </div>
          </div>
        )}

        {/* ── Confirm Button ── */}
        {timings && (
          <div className="mt-5 pt-4 border-t">
            {paymentMethod && (
              <p className="text-xs text-muted-foreground text-center mb-3">
                Booking for{" "}
                <span className="font-semibold text-foreground">
                  {DAY_NAMES[selectedDay.getDay()]}, {selectedDay.getDate()}{" "}
                  {MONTH_NAMES[selectedDay.getMonth()]}
                </span>{" "}
                ·{" "}
                <span className="font-semibold text-foreground">
                  {paymentMethod}
                </span>
              </p>
            )}
            <Button
              className="w-full rounded-sm"
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              {bookingMutation.isPending ? "Booking..." : "Confirm Appointment"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookAppointmentDialog;
