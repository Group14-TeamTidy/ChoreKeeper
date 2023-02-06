import { React } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
// import { useQuery } from "react-query";
import AuthService from "../../services/AuthService";
// import axios from "axios";

const ChoresPage = () => {
  const navigate = useNavigate();
  // Saved for future reference
  // const { isLoading, error, data } = useQuery("repoData", () =>
  //   axios.get(`${process.env.REACT_APP_API_BASE_URL}`).then((res) => res.data)
  // );

  const handleLogout = () => {
    AuthService.logout();
    navigate({ to: "/login", replace: true });
  };

  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className="App">
        <p>Chores Page</p>
        <p>Hello, {currentUser.email}</p>
        <p>Your token is: {JSON.stringify(token)}</p>
        <p>
          <button onClick={handleLogout}>Log Out</button>
        </p>
      </div>
    );
  }
};

export default ChoresPage;
