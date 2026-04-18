import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BAR_COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const BarChartCard = ({ title, description, data = [] }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="space-y-3">
            <div className="h-48 flex items-end gap-3">
              {data.map((item, index) => {
                const height = Math.max((item.value / maxValue) * 100, 8);

                return (
                  <div key={item.label} className="flex-1 min-w-0">
                    <div className="h-40 flex items-end justify-center">
                      <div
                        className={`${BAR_COLORS[index % BAR_COLORS.length]} w-full rounded-t-md transition-all`}
                        style={{ height: `${height}%` }}
                        aria-label={`${item.label}: ${item.value}`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground truncate text-center">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-center">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No chart data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BarChartCard;
