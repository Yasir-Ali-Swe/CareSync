import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <h1 className="text-3xl text-primary font-bold">Welcome to CareSync</h1>
      <p className="text-xl font-semibold">
        Contact us at contact@caresync.com
      </p>
    </div>
  );
};

export default Home;
