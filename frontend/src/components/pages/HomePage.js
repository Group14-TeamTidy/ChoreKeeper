import { React, useRef } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import AuthService from "../../services/AuthService";
import { Outlet, ReactLocation, Router } from "@tanstack/react-location";
import { QueryClientProvider, QueryClient } from "react-query";
import ChoresPage from "./ChoresPage.js";
import SchedulePage from "./SchedulePage.js";
import ChoreService from "../../services/ChoreService";

const HomePage = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  const queryClient = new QueryClient();
  const location = new ReactLocation();

  // Logs out the user
  const handleLogout = () => {
    AuthService.logout();
    navigate({ to: "/login", replace: true });
  };

  // Dropdown menu
  const userEmail = currentUser !== null ? currentUser.email : "";
  const menu = useRef(null);
  const items = [
    {
      label: "Account",
      items: [
        {
          label: userEmail,
        },
      ],
    },
    { separator: true },
    {
      label: "Log Out",
      icon: "pi pi-sign-out",
      command: () => {
        handleLogout();
      },
    },
  ];

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <>
      <div className="header">
          <div id="dropdownMenuContainer">
            <Menu model={items} popup ref={menu} />
            <Button icon="pi pi-bars" onClick={(e) => menu.current.toggle(e)} />
          </div>

          <h1>Chore Keeper</h1>
        </div>

        <QueryClientProvider client={queryClient}>
          <Router
            location={location}
            routes={[
              { path: "/", element: <SchedulePage /> },
              {
                path: "chores",
                element: <ChoresPage />,
                loader: () =>
                  queryClient.getQueryData("chores") ??
                  queryClient
                    .fetchQuery("chores", ChoreService.getChores)
                    .then(() => ({})),
              },
              { path: "schedule", element: <SchedulePage /> },
            ]}
          >
            <Outlet />
          </Router>
        </QueryClientProvider>
      </>
    )
  }

};

export default HomePage;