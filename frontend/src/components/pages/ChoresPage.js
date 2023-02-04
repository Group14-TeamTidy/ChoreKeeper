import { React } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";

const ChoresPage = () => {
  // This is where we check authentication
  if (false) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className="App">
        <p>Chores Page</p>
        <p>Hi</p>
      </div>
    );
  }
};

export default ChoresPage;
