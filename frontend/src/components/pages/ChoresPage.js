import { React } from "react";
import { Navigate } from "@tanstack/react-location";
import { useQuery } from "react-query";
import axios from "axios";

const ChoresPage = () => {
  const { isLoading, error, data } = useQuery("repoData", () =>
    axios.get(`${process.env.REACT_APP_API_BASE_URL}`).then((res) => res.data)
  );

  // This is where we check authentication
  if (false) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className="App">
        <p>Chores Page</p>
        <p>Hi</p>
        <p>
          {isLoading
            ? "Loading..."
            : error
            ? `Error: ${error}`
            : `Data: ${data}`}
        </p>
      </div>
    );
  }
};

export default ChoresPage;
