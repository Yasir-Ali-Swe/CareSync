import { Outlet } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const DashboardLayout = () => {
  return (
    <>
      <DashboardNavbar />
      <Outlet />
    </>
  );
};

export default DashboardLayout;
