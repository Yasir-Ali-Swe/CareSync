import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
