import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmptyStateCard = ({ title, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
