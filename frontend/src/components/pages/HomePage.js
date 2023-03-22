import { React, useRef, useState } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { queryClient } from "../../App";
import { useQuery, useMutation } from "react-query";
import AuthService from "../../services/AuthService";
import ChoresPage from "./ChoresPage.js";
import ChoreService from "../../services/ChoreService";
import SchedulePage from "./SchedulePage.js";
import ChoreCreateModal from "../ChoreCreateModal";
import { Toast } from "primereact/toast";
import { ReactQueryDevtools } from "react-query/devtools";

const HomePage = () => {
  const serverErrorsToast = useRef(null);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  let displayChoresPage = window.location.pathname === "/chores";

  // Logs out the user
  const handleLogout = () => {
    AuthService.logout();
    navigate({ to: "/login", replace: true });
  };

  const { isLoading: isChoresLoading, data: choresData } = useQuery(
    "chores",
    () => ChoreService.getChores(),
    {
      onError: (error) => {
        showServerErrorsToast(error.response.data.message);
      },
    }
  );

  const { isLoading: isUserLoading, data: userData } = useQuery(
    "user",
    () => AuthService.getUser(),
    {
      onError: (error) => {
        showServerErrorsToast(error.response.data.message);
      },
    }
  );

  const updateUserNotifsMutation = useMutation(
    (receiveNotifs) => AuthService.setUserNotifications(receiveNotifs),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user");
      },
      onError: (error) => {
        showServerErrorsToast(error.response.data.message);
      },
    }
  );

  const showServerErrorsToast = (message) => {
    serverErrorsToast.current.show({
      severity: "error",
      summary: "Server Error",
      detail: message,
      life: 3000,
    });
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

  // Modal for creating/editing chores
  const [modalShow, setModalShow] = useState(false);
  const handleClose = () => setModalShow(false);
  const handleShow = () => setModalShow(true);

  // Get the user's chores
  const handleChores = () => {
    queryClient.invalidateQueries("chores");
  };

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <>
        {
          // If dev environment, show React Query Dev Tools
          process.env.NODE_ENV === "development" && <ReactQueryDevtools />
        }
        <Toast ref={serverErrorsToast} />
        <div id="header">
          <h1>Chore Keeper</h1>

          <div id="navButtons">
            <Button
              id="toSchedulePage"
              className={displayChoresPage ? "" : "currPage"}
              onClick={() => {
                navigate({ to: "/schedule", replace: true });
              }}
            >
              Schedule
            </Button>

            <Button
              id="toChoresPage"
              className={displayChoresPage ? "currPage" : ""}
              onClick={() => {
                navigate({ to: "/chores", replace: true });
              }}
            >
              Chores
            </Button>
          </div>

          <div>
            <Button
              id="newChore"
              onClick={() => {
                handleShow();
              }}
            >
              <span className="pi pi-plus"></span>&nbsp;Chore
            </Button>

            <Button
              id="toggleNotifs"
              onClick={() => {
                if (!isUserLoading) {
                  updateUserNotifsMutation.mutate(
                    !userData.data.user.receiveNotifs
                  );
                }
              }}
            >
              {!isUserLoading && userData.data.user.receiveNotifs ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  fill="currentColor"
                  className="bi bi-bell-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  fill="currentColor"
                  className="bi bi-bell-slash-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.164 14H15c-1.5-1-2-5.902-2-7 0-.264-.02-.523-.06-.776L5.164 14zm6.288-10.617A4.988 4.988 0 0 0 8.995 2.1a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 7c0 .898-.335 4.342-1.278 6.113l9.73-9.73zM10 15a2 2 0 1 1-4 0h4zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75L.625 15.625z" />
                </svg>
              )}
            </Button>

            <div id="dropdownMenuContainer">
              <Menu model={items} popup ref={menu} />
              <Button
                icon="pi pi-bars"
                onClick={(e) => menu.current.toggle(e)}
              />
            </div>
          </div>
        </div>

        <ChoreCreateModal
          show={modalShow}
          onHide={handleClose}
          onSave={handleChores}
          currChore={null}
        />

        {displayChoresPage ? (
          <ChoresPage isChoresLoading={false} choresData={choresData} />
        ) : (
          <SchedulePage
            isChoresLoading={isChoresLoading}
            choresData={choresData}
          />
        )}
      </>
    );
  }
};

export default HomePage;
