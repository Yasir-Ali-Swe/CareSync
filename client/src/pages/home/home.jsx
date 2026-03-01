import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl text-primary font-bold">Welcome to CareSync</h1>
      <Button asChild>
        <Link to="/auth/login">Login</Link>
      </Button>
    </div>
  );
};

export default Home;
