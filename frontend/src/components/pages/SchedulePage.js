import { React, useState, useMemo, useRef } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useMutation, useQuery } from "react-query";
import { queryClient } from "../../App";
import { ReactQueryDevtools } from "react-query/devtools";
import ChoreService from "../../services/ChoreService";

const SchedulePage = () => {
  return (
    <>
    <div className="content">
      <h2>Schedule Page</h2>
    </div>
    </>
  )
};

export default SchedulePage;