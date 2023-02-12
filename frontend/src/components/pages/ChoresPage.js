import { React, useState, useMemo } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { useTable } from "react-table";
import { Button } from "primereact/button";
// import { useQuery } from "react-query";
import AuthService from "../../services/AuthService";
// import axios from "axios";

const ChoresPage = () => {
  const navigate = useNavigate();
  // Saved for future reference
  // const { isLoading, error, data } = useQuery("repoData", () =>
  //   axios.get(`${process.env.REACT_APP_API_BASE_URL}`).then((res) => res.data)
  // );

  // Dropdown menu
  const [open, setOpen] = useState(false);
  const DropdownMenuItem = (props) => {
    return (
      <li>
        <button className="dropdownItem" onClick={props.handler}>
          {props.text}
        </button>
      </li>
    );
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate({ to: "/login", replace: true });
  };

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Frequency",
        accessor: "freq",
      },
      {
        Header: "Location",
        accessor: "loc",
      },
      {
        Header: "Duration",
        accessor: "dur",
      },
      {
        Header: "Preference",
        accessor: "pref",
      },
    ],
    []
  );

  const data = useMemo(
    () => [
      {
        name: "Sweep",
        freq: "Every 1 week",
        loc: "Kitchen",
        dur: "30 minutes",
        pref: "High",
      },
      {
        name: "Take Out Trash",
        freq: "Every 1 week",
        loc: "Kitchen",
        dur: "5 minutes",
        pref: "Low",
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className="App">
        <div class="header">
          <div id="dropdownMenuContainer">
            <button onClick={() => setOpen(!open)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-list"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                ></path>
              </svg>
            </button>
            <ul id="dropdownMenu" className={open ? "" : "hidden"}>
              <li>{currentUser.email}</li>
              <DropdownMenuItem text={"Manage Account"} />
              <DropdownMenuItem text={"Log Out"} handler={handleLogout} />
            </ul>
          </div>

          <h1>Chore Keeper</h1>
        </div>

        <div className="content">
          <button>New Chore</button>

          <table id="choresList" className="center" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
};

export default ChoresPage;
