import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const DashboardPageSkeleton = ({ cardCount = 4 }) => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-md bg-muted" />
        <div className="h-4 w-72 rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="h-5 w-44 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-md bg-muted" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-5 w-44 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-56 rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPageSkeleton;
