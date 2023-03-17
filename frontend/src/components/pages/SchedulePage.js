import { React } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import ScheduleList from "../ScheduleList";

const SchedulePage = ({ isChoresLoading, choresData }) => {
  return (
    <>
      <div className="content">
        {isChoresLoading ? (
          <ProgressSpinner />
        ) : (
          <ScheduleList chores={choresData.data} />
        )}
      </div>
    </>
  );
};

export default SchedulePage;
