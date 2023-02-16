import { React, useState, useEffect, useMemo, useRef } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import { useTable, usePagination } from "react-table";
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "primereact/button";
import { Menu } from 'primereact/menu';
// import { useQuery } from "react-query";
import CreateChore from "../CreateChore";
import AuthService from "../../services/AuthService";
import ChoreService from "../../services/ChoreService";

const ChoresPage = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const token = AuthService.getToken();

  // Saved for future reference
  // const { isLoading, error, data } = useQuery("repoData", () =>
  //   axios.get(`${process.env.REACT_APP_API_BASE_URL}`).then((res) => res.data)
  // );

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
        /*{
          label: "Manage Account",
          icon: 'pi pi-fw pi-user'
        }*/
      ]
    },
    { separator: true},
    {
      label: 'Log Out',
      icon: 'pi pi-sign-out',
      command: () => {handleLogout()},
    }
  ];

  // Modal for creating/editing chores
  const [modalShow, setModalShow] = useState(false);
  const handleClose = () => setModalShow(false);
  const handleShow = () => setModalShow(true);

  // Modal for deleting chores
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const handleDeleteModalClose = () => setDeleteModalShow(false);
  const handleDeleteModalShow = () => setDeleteModalShow(true);

  // List of user's chores
  const [chores, setChores] = useState(() => {
    let chore = [
      {
        _id: -1,
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
    ChoreService.getChores().then(
      (res) => { chore = res.data; },
      (error) => { console.log(error.message )}
    );
    return chore;
  });

  // Get the user's chores
  const handleChores = () => {
    ChoreService.getChores().then(
      (res) => { setChores(res.data); },
      (error) => { console.log(error.message )}
    );
  }

  // Current chore being updated
  const [currChore, setCurrChore] = useState(null);

  // Fill the table initially
  useEffect(() => {
    handleChores();
  }, []);

  const PAGE_SIZE = 8; //Number of rows displayed in each page of the table, not including the header

  // Format the information for each chore in order to display in the table
  const getChoreData = (chores) => {
    const MIN_TO_SEC = 60;
    const HOUR_TO_SEC = 3600;
    let choreData = [];

    chores.forEach((val) => {
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
          id: val._id,
          name: val.name,
          freq: frequency,
          loc: val.location,
          dur: duration,
          pref: preference,
        }
      );
    });

    // Pad table with empty data to keep consistent table size
    const NUM_CHORES = choreData.length;
    for(let i = NUM_CHORES % PAGE_SIZE; i > 0 && i < PAGE_SIZE; i++) {
      let chore = {
        id: -1,
        name: "",
        freq: "",
        loc: "",
        dur: "",
        pref: ""
      };

      choreData.push(chore);
    }

    return choreData;
  }

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
      {
        id: "edit",
        accessor: data => data.id,
        Cell: ({value}) => {
          if(value !== -1) {
            return (
              <button className="editButton" onClick={() => {
                let chore = chores.find((val) => {return value === val._id});
                setCurrChore(chore);
                handleShow();
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                </svg>
              </button>
            )
          } else {
            return "";
          }
        },
      },
      {
        id: "delete",
        accessor: data => data.id,
        Cell: ({value}) => {
          if(value !== -1) {
            return (
              <button className="deleteButton" onClick={() => {
                let chore = chores.find((val) => {return value === val._id});
                setCurrChore(chore);
                handleDeleteModalShow();
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
                </svg>
              </button>
            )
          } else {
            return "";
          }
        },
      }
    ],
    [chores]
  );

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

  if (!currentUser || !token) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className="App">
        <div className="header">
          <div id="dropdownMenuContainer">
            <Menu model={items} popup ref={menu} />
            <Button icon="pi pi-bars" onClick={(e) => menu.current.toggle(e)} />
          </div>

          <h1>Chore Keeper</h1>
        </div>

        <div className="content">
          <CreateChore show={modalShow} onHide={handleClose} onSave={handleChores} currChore={currChore}/>
          <Modal show={deleteModalShow} onHide={handleDeleteModalClose} centered>
            <Modal.Body>
              {currChore != null && <p>Are you sure you want to delete chore {currChore.name}?</p>}
              <p>This action cannot be undone.</p>
            </Modal.Body>

            <Modal.Footer>
              <Button id="declineButton" onClick={handleDeleteModalClose}>No</Button>
              <Button onClick={() => {
                ChoreService.deleteChore(currChore._id).then(
                  () => {
                    handleChores();
                    handleDeleteModalClose();
                  },
                  (error) => { console.log(error.message )}
                )
              }}>Yes</Button>
            </Modal.Footer>
          </Modal>

          <div id="main-content">
            <div id="choreListManipulation">
              <Button id="newChore"
                onClick={() => {
                  setCurrChore(null);
                  handleShow();
                }}
              >New Chore</Button>
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
              {canPreviousPage && <Button onClick={() => previousPage()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="0.75em" height="1.5em" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                </svg>
              </Button>}
              {pageCount > 1 && pageCount >= setPageButton(1, pageIndex) && <Button className={setPageButton(1, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(1, pageIndex) - 1)}}>{setPageButton(1, pageIndex)}</Button>}
              {pageCount > 1 && pageCount >= setPageButton(2, pageIndex) && <Button className={setPageButton(2, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(2, pageIndex) - 1)}}>{setPageButton(2, pageIndex)}</Button>}
              {pageCount >= setPageButton(3, pageIndex) && <Button className={setPageButton(3, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(3, pageIndex) - 1)}}>{setPageButton(3, pageIndex)}</Button>}
              {pageCount >= setPageButton(4, pageIndex) && <Button className={setPageButton(4, pageIndex) === pageIndex + 1 ? "currentPage" : ""} onClick={() => {gotoPage(setPageButton(4, pageIndex) - 1)}}>{setPageButton(4, pageIndex)}</Button>}
              {canNextPage && <Button onClick={() => nextPage()} disabled={!canNextPage}>
                <svg xmlns="http://www.w3.org/2000/svg" width="0.75em" height="1.5em" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </Button>}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ChoresPage;
