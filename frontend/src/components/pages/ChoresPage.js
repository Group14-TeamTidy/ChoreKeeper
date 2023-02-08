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

  const DropdownMenuItem = (props) => {
    return (
      <button className="dropdownItem" onClick={props.handler}>
        {props.text}
      </button>
    );
  };

  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div>
        <div className="App">
          <p>Chores Page</p>
          <p>Hello, {currentUser.email}</p>
          <p>Your token is: {JSON.stringify(token)}</p>
        </div>

        {/*TODO: Make the dropdown menu toggleable */}
        <div id="menuContainer">
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"></path>
            </svg>
          </button>
          <div id="dropdownMenu">
            <div>
              <p>Account</p>
              <p>{currentUser.email}</p>
            </div>
            <DropdownMenuItem text={"Manage Account"}/>
            <DropdownMenuItem text={"Log Out"} handler={handleLogout}/>
          </div>
        </div>

        <br/><br/> {/* TODO: remove these when I do the CSS */}
        <button>
          New Chore
        </button>

        <div id="choresList"></div>
      </div>
    );
  }
};

export default ChoresPage;
