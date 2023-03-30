import { React } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import ScheduleList from "../components/ScheduleList";

// Renders the schedule page
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
