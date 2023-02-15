import { React, useState, useEffect, useMemo } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { useTable, usePagination } from "react-table";
import { Button } from "primereact/button";
// import { useQuery } from "react-query";
import CreateChore from "../CreateChore";
import AuthService from "../../services/AuthService";
import ChoreService from "../../services/ChoreService";

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

  // Logs out the user
  const handleLogout = () => {
    AuthService.logout();
    navigate({ to: "/login", replace: true });
  };

  //Chore table header
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

  // Chores
  const [chores, setChores] = useState(() => {
    let chore = [
      {
        name: "",
        frequency: {
          quantity: "",
          interval: ""
        },
        location: "",
        duration: "",
        preference: ""
      },
    ];
    ChoreService.getChores().then((res) => { chore = res.data; });
    return chore;
  });

  const handleChores = () => {
    ChoreService.getChores().then((res) => { setChores(res.data); });
  }

  // Fill the table initially
  useEffect(() => {
    handleChores();
  }, []);

  const PAGE_SIZE = 7; //Number of rows displayed in each page of the table, not including the header

  // Format the information for each chore in order to display in the table
  const getChoreData = (chores) => {
    const MIN_TO_SEC = 60;
    const HOUR_TO_SEC = 3600;
    let choreData = [];

    chores.forEach((val, i, array) => {
      let freqInterval = val.frequency.interval.charAt(0).toUpperCase() + val.frequency.interval.substring(1);
      freqInterval = (val.frequency.quantity === 1) ? freqInterval.substring(0, freqInterval.length - 1) : freqInterval;
      let frequency = (val.frequency.quantity && freqInterval) ? "Every " + val.frequency.quantity + " " + freqInterval : "";

      let durQuantity = (val.duration < HOUR_TO_SEC) ? val.duration / MIN_TO_SEC : val.duration / HOUR_TO_SEC;
      let durInterval = (val.duration < HOUR_TO_SEC) ? "minutes" : "hours";
      durInterval = (durQuantity === 1) ? durInterval.substring(0, durInterval.length - 1) : durInterval;
      let duration = (durQuantity && durInterval) ? durQuantity + " " + durInterval : "";

      let preference = (val.preference) ? val.preference.charAt(0).toUpperCase() + val.preference.substring(1) : "";

      choreData.push(
        {
          name: val.name,
          freq: frequency,
          loc: val.location,
          dur: duration,
          pref: preference,
        }
      );
    });

    const NUM_CHORES = choreData.length;
    for(let i = NUM_CHORES % PAGE_SIZE; i > 0 && i < PAGE_SIZE; i++) {
      let chore = {
        name: "\u00A0",
        freq: "\u00A0",
        loc: "\u00A0",
        dur: "\u00A0",
        pref: "\u00A0"
      };

      choreData.push(chore);
    }

    return choreData;
  }

  // Chore data and table setup
  const data = useMemo(() => getChoreData(chores), [chores]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: PAGE_SIZE },
    },
    usePagination
  );

  const setPageButton = (buttonNum, pageIndex) => {
    const BUTTON_ROTATION = 3;
    return buttonNum + (pageIndex - (pageIndex % BUTTON_ROTATION));
  }

  // Modal for creating/editing chores
  const [modalShow, setModalShow] = useState(false);
  const handleClose = () => setModalShow(false);
  const handleShow = () => setModalShow(true);

  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className="App">
        <div className="header">
          <div id="dropdownMenuContainer">
            <button onClick={() => setOpen(!open)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-list"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
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
          <CreateChore show={modalShow} onHide={handleClose} onSave={handleChores}/>

          <div id="main-content">
            <div id="choreListManipulation">
              <Button id="newChore" onClick={handleShow}>New Chore</Button>
            </div>
            <table id="choresList" {...getTableProps()}>
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
                {page.map((row, i) => {
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

            <div id="paginationButtons">
              {canPreviousPage && <Button onClick={() => previousPage()}>{'<'}</Button>}
              {pageCount > 1 && pageCount >= setPageButton(1, pageIndex) && <Button className={setPageButton(1, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(1, pageIndex) - 1)}}>{setPageButton(1, pageIndex)}</Button>}
              {pageCount > 1 && pageCount >= setPageButton(2, pageIndex) && <Button className={setPageButton(2, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(2, pageIndex) - 1)}}>{setPageButton(2, pageIndex)}</Button>}
              {pageCount >= setPageButton(3, pageIndex) && <Button className={setPageButton(3, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(3, pageIndex) - 1)}}>{setPageButton(3, pageIndex)}</Button>}
              {pageCount >= setPageButton(4, pageIndex) && <Button className={setPageButton(4, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(4, pageIndex) - 1)}}>{setPageButton(4, pageIndex)}</Button>}
              {canNextPage && <Button onClick={() => nextPage()} disabled={!canNextPage}>{'>'}</Button>}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ChoresPage;
