import { Navigate } from "react-router-dom";
import { getDashboardHomeRoute } from "../../lib/DasboardRotes";

const DashboardIndexRedirect = ({ role }) => {
  return <Navigate to={getDashboardHomeRoute(role)} replace />;
};

export default DashboardIndexRedirect;
