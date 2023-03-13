import { React, useRef ,useState } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { queryClient } from "../../App";
import { useQuery } from "react-query";
import AuthService from "../../services/AuthService";
import ChoresPage from "./ChoresPage.js";
import ChoreService from "../../services/ChoreService";
import SchedulePage from "./SchedulePage.js";
import ChoreCreateModal from "../ChoreCreateModal";
import { Toast } from "primereact/toast";

const HomePage = () => {
  const serverErrorsToast = useRef(null);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  let displayChoresPage = window.location.pathname == "/chores";

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