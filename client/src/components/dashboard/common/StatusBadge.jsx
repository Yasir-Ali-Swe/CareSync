import React from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  pending: "secondary",
  upcoming: "secondary",
  completed: "default",
  cancelled: "destructive",
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
};

const STATUS_LABELS = {
  pending: "Pending",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status || "").toLowerCase();
  const variant = STATUS_VARIANTS[normalizedStatus] || "outline";
  const label = STATUS_LABELS[normalizedStatus] || status;

  return <Badge variant={variant}>{label}</Badge>;
};

export default StatusBadge;
