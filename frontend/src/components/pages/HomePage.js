import { React, useRef ,useState } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { queryClient } from "../../App";
import AuthService from "../../services/AuthService";
import ChoresPage from "./ChoresPage.js";
import SchedulePage from "./SchedulePage.js";
import ChoreCreateModal from "../ChoreCreateModal";

const HomePage = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  let displayChoresPage = window.location.pathname == "/chores";

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
        <div id="header">
          <h1>Chore Keeper</h1>

          <div id="navButtons">
            <Button
              id="toSchedulePage"
              className={ displayChoresPage ? "" : "currPage" }
              onClick={() => {
                navigate({ to: "/schedule", replace: true });
              }}
            >
              Schedule
            </Button>

            <Button
              id="toChoresPage"
              className={ displayChoresPage ? "currPage" : "" }
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
              <Button icon="pi pi-bars" onClick={(e) => menu.current.toggle(e)} />
            </div>
          </div>
        </div>

        <ChoreCreateModal
          show={modalShow}
          onHide={handleClose}
          onSave={handleChores}
          currChore={null}
        />

        {displayChoresPage ? <ChoresPage/> : <SchedulePage />}
      </>
    )
  }

};

export default HomePage;