import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import DoctorsData from "@/dummyData/DoctorData.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx";

import {
  Star,
  MessageCircle,
  Stethoscope,
  CreditCard,
  Sun,
  Sunrise,
  Sunset,
  CalendarDays,
  User,
  DollarSign,
  Ban,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
  MapPin,
} from "lucide-react";

// ── Date helpers ──────────────────────────────────────────────────────────────
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
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

function getClinicTimings(dayOfWeek) {
  if (dayOfWeek === 0) return null;
  const schedule = {
    1: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" },
    2: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" },
    3: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" },
    4: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" },
    5: { morning: "9:00 AM – 12:00 PM", evening: "6:00 PM – 10:00 PM" },
    6: { morning: "9:00 AM – 12:00 PM", evening: null },
  };
  return schedule[dayOfWeek] ?? null;
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-card shadow-sm gap-1 ${accent}`}
    >
      {icon}
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  );
}

// ── Timing Row ────────────────────────────────────────────────────────────────
function TimingRow({ icon, label, time, available }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        available
          ? "bg-card border-border"
          : "bg-muted/40 border-transparent opacity-55"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-semibold leading-tight">{label}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
      {available ? (
        <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
          Available
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-xs">
          Closed
        </Badge>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const DoctorProfile = () => {
  const { doctorId } = useParams();
  const id = Number(doctorId) - 1;
  const doctor = DoctorsData[id];

  const weekDays = getCurrentWeekDays();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl font-semibold text-muted-foreground">
          Doctor not found.
        </p>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          Back to Doctor
        </Link>
      </div>
    );
  }

  const selectedDay = weekDays[selectedDayIdx];
  const timings = getClinicTimings(selectedDay.getDay());
  const canConfirm = Boolean(paymentMethod && timings);

  const handleDaySelect = (idx) => {
    setSelectedDayIdx(idx);
    setPaymentMethod(null);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setConfirmed(true);
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 mb-16">
      {/* ── Back ── */}
      <Link
        to="/doctors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition mb-3"
      >
        <ArrowLeft className="w-4 h-4 text-primary" />
        Back to Doctor
      </Link>

      {/* ── Hero Card ── */}
      <div className="relative rounded-2xl border bg-card shadow-md overflow-hidden mb-6">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <Avatar className="w-28 h-28 sm:w-32 sm:h-32 shadow-lg ring-4 ring-background">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?img=${doctor.id}`}
                  alt={doctor.fullName}
                />
                <AvatarFallback className="text-3xl font-bold">
                  {doctor.fullName[0]}
                </AvatarFallback>
              </Avatar>
              {doctor.isAvailableToday && (
                <span
                  className="absolute bottom-1 right-5 bg-green-500 w-4 h-4 rounded-full border-2 border-background shadow"
                  title="Available Today"
                />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {doctor.fullName}
                </h1>
                {doctor.verified && (
                  <Badge className="flex items-center bg-green-500 font-semibold text-xs">
                    <BadgeCheck className="text-white font-black" />
                    <p className="text-white font-bold">Verified</p>
                  </Badge>
                )}
              </div>
              <p className="text-primary font-semibold text-base mb-1">
                {doctor.specialization}
              </p>
              <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center sm:justify-start gap-1">
                <MapPin size={15} /> {doctor.city} &nbsp;·&nbsp; {doctor.gender}
              </p>
              <p className="text-sm text-foreground/80 max-w-lg leading-relaxed">
                {doctor.bioShort}
              </p>

              {doctor.isAvailableToday && (
                <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary bg-green-500 px-3 py-1 rounded-full border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-white font-semibold">Available Today</p>
                </div>
              )}
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center px-5 py-4 rounded-xl border bg-primary/5 border-primary/20 text-center shrink-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                Consultation Fee
              </p>
              <p className="text-2xl font-bold text-primary">
                Rs. {doctor.consultationFee.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 items-stretch">
        <StatCard
          icon={<Star size={22} />}
          label="Patient Rating"
          value={`${doctor.rating}/5`}
        />
        <StatCard
          icon={<MessageCircle size={22} />}
          label="Total Reviews"
          value={doctor.totalReviews}
        />
        <StatCard
          icon={<Stethoscope size={22} />}
          label="Experience"
          value={`${doctor.experienceYears} yrs`}
        />
        <StatCard
          icon={<CreditCard size={22} />}
          label="Consult Fee"
          value={`Rs. ${doctor.consultationFee.toLocaleString()}`}
        />
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        {/* ── Left: About + Reviews ── */}
        <div className="lg:col-span-2 space-y-5 h-full flex flex-col">
          <div className="rounded-xl border bg-card shadow-sm p-5 flex-1">
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <User size={18} /> About the Doctor
            </h2>
            <Separator className="mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {doctor.fullName} is a highly experienced {doctor.specialization}{" "}
              based in {doctor.city} with over {doctor.experienceYears} years of
              clinical practice. Specialising in {doctor.bioShort.toLowerCase()}{" "}
              {doctor.fullName} is committed to delivering compassionate,
              patient-centred care with evidence-based treatment plans.
            </p>
          </div>

          <div className="rounded-xl border bg-card shadow-sm p-5">
            <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <MessageCircle size={18} /> Patient Reviews
            </h2>
            <Separator className="mb-4" />
            <div className="space-y-4">
              {[
                {
                  name: "Ayesha K.",
                  text: "Very professional and caring doctor. Explained everything clearly.",
                  stars: 5,
                },
                {
                  name: "Usman T.",
                  text: "Quick diagnosis and effective treatment. Highly recommended!",
                  stars: 5,
                },
                {
                  name: "Sara M.",
                  text: "Good experience overall. Wait time was a bit long but worth it.",
                  stars: 4,
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-muted/50 border border-border/60"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <span className="flex items-center gap-0.5 text-yellow-500">
                      {Array.from({ length: r.stars }).map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          fill="currentColor"
                          strokeWidth={1.5}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.text}
                  </p>
                </div>
              ))}
              <p className="text-xs text-center text-muted-foreground pt-1">
                Based on {doctor.totalReviews} verified reviews
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Book Appointment ── */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-card shadow-sm p-5 sm:p-6 sticky top-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <CalendarDays size={18} /> Book Appointment
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Select a day and payment method to confirm your visit.
            </p>
            <Separator className="mb-5" />

            <div className="space-y-6">
              {/* Day picker */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Select Day
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {weekDays.map((day, idx) => {
                    const isSelected = idx === selectedDayIdx;
                    const isToday = idx === 0;
                    const closed = getClinicTimings(day.getDay()) === null;

                    return (
                      <button
                        key={idx}
                        onClick={() => !closed && handleDaySelect(idx)}
                        disabled={closed}
                        className={`flex flex-col items-center min-w-13.5 px-2 py-2.5 rounded-xl border text-sm transition-all shrink-0 ${
                          closed
                            ? "opacity-35 cursor-not-allowed bg-muted border-transparent"
                            : isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md cursor-pointer scale-105"
                              : "bg-secondary text-foreground border-transparent hover:border-primary hover:scale-105 cursor-pointer"
                        }`}
                      >
                        <span className="font-semibold text-[10px] uppercase tracking-wide">
                          {isToday ? "Today" : DAY_NAMES[day.getDay()]}
                        </span>
                        <span className="text-lg font-bold leading-snug">
                          {day.getDate()}
                        </span>
                        <span className="text-[10px] opacity-70">
                          {MONTH_NAMES[day.getMonth()]}
                        </span>
                        {closed && (
                          <span className="text-[8px] font-bold opacity-50 mt-0.5">
                            Off
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinic Timings */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Clinic Timings —{" "}
                  <span className="text-foreground normal-case">
                    {DAY_NAMES[selectedDay.getDay()]}, {selectedDay.getDate()}{" "}
                    {MONTH_NAMES[selectedDay.getMonth()]}
                  </span>
                </p>

                {!timings ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted text-muted-foreground text-sm">
                    <Ban size={18} /> Clinic is closed on this day.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <TimingRow
                      icon={<Sunrise size={20} />}
                      label="Morning"
                      time={timings.morning}
                      available
                    />
                    <TimingRow
                      icon={<Sun size={20} />}
                      label="Afternoon"
                      time="12:00 PM – 5:00 PM"
                      available={false}
                    />
                    <TimingRow
                      icon={<Sunset size={20} />}
                      label="Evening"
                      time={timings.evening ?? "6:00 PM – 10:00 PM"}
                      available={Boolean(timings.evening)}
                    />
                  </div>
                )}
              </div>

              {/* Payment */}
              {timings && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("Pay Online")}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        paymentMethod === "Pay Online"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-secondary border-transparent hover:border-primary hover:shadow-sm"
                      }`}
                    >
                      <CreditCard size={24} />
                      Pay Online
                    </button>

                    <button
                      onClick={() => setPaymentMethod("Pay at Clinic (Cash)")}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        paymentMethod === "Pay at Clinic (Cash)"
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                          : "bg-secondary border-transparent hover:border-primary hover:shadow-sm"
                      }`}
                    >
                      <DollarSign size={24} />
                      Pay at Clinic
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm */}
              {timings && (
                <div className="pt-2 space-y-3">
                  {/* Success Alert (shadcn tokens) */}
                  {confirmed && (
                    <Alert
                      className="
                        rounded-xl border bg-card text-card-foreground shadow-sm
                        dark:bg-card/60
                        [&>svg]:text-primary
                      "
                    >
                      <CheckCircle2 />

                      <AlertTitle className="font-semibold">
                        Appointment Confirmed!
                      </AlertTitle>

                      <AlertDescription className="text-muted-foreground">
                        <p>
                          Your appointment with{" "}
                          <span className="font-semibold text-foreground">
                            {doctor.fullName}
                          </span>{" "}
                          for{" "}
                          <span className="font-semibold text-foreground">
                            {DAY_NAMES[selectedDay.getDay()]},{" "}
                            {selectedDay.getDate()}{" "}
                            {MONTH_NAMES[selectedDay.getMonth()]}
                          </span>{" "}
                          has been confirmed. Payment method:{" "}
                          <span className="font-semibold text-foreground">
                            {paymentMethod}
                          </span>
                          .
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {!confirmed && (
                    <>
                      {paymentMethod && (
                        <p className="text-xs text-muted-foreground text-center">
                          Booking for{" "}
                          <span className="font-semibold text-foreground">
                            {DAY_NAMES[selectedDay.getDay()]},{" "}
                            {selectedDay.getDate()}{" "}
                            {MONTH_NAMES[selectedDay.getMonth()]}
                          </span>{" "}
                          ·{" "}
                          <span className="font-semibold text-foreground">
                            {paymentMethod}
                          </span>
                        </p>
                      )}

                      <Button
                        className="w-full rounded-xl font-semibold text-sm py-5"
                        disabled={!canConfirm}
                        onClick={handleConfirm}
                      >
                        Confirm Appointment
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
