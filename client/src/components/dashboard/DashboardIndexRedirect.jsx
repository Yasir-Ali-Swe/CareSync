import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboardHomeRoute } from "../../lib/DashboardRoutes";

const DashboardIndexRedirect = () => {
  const role = useSelector((state) => state.auth.role);
  return <Navigate to={getDashboardHomeRoute(role)} replace />;
};

export default DashboardIndexRedirect;
