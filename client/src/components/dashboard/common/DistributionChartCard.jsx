import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BAR_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const DistributionChartCard = ({ title, description, data = [] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="space-y-4">
            {data.map((item, index) => {
              const percentage = total ? Math.round((item.value / total) * 100) : 0;

              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value} ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`${BAR_COLORS[index % BAR_COLORS.length]} h-full rounded-full`}
                      style={{ width: `${percentage}%` }}
                      aria-label={`${item.label}: ${percentage}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No chart data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DistributionChartCard;
