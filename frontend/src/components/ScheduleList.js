import { Card } from "primereact/card";
import { useMemo } from "react";
import { Button } from "primereact/button";
import { useMutation } from "react-query";
import ChoreService from "../services/ChoreService";
import { queryClient } from "../App";

const ScheduleList = ({ chores }) => {
  const checkChoreMutation = useMutation(
    (choreId) => ChoreService.checkChore(choreId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("chores");
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const sortChoresByNextOccurrence = (chores) => {
    return chores.sort((a, b) => {
      return new Date(a.nextOccurrence) - new Date(b.nextOccurrence);
    });
  };

  const choresList = useMemo(
    () => sortChoresByNextOccurrence(chores),
    [chores]
  );

  return (
    <div className="schedule-list">
      {choresList.map((chore) => (
        <div key={chore._id} className="schedule-item">
          <Card className="schedule-item-card">
            <Button
              className="schedule-item-button p-button-icon-only p-button-outlined p-button-rounded p-button-success"
              icon="pi pi-check"
              onClick={() => checkChoreMutation.mutate(chore._id)}
            />
            <div className="schedule-chore-details">
              <p className="schedule-chore-name">
                <strong>{chore.name}</strong>
                {chore.location && <em>, {chore.location}</em>}
              </p>
              {chore.frequency && (
                <p
                  className={
                    "schedule-chore-next " +
                    (chore.nextOccurrence < Date.now()
                      ? "overdue-chore-text"
                      : "")
                  }
                >
                  Next Due:{" "}
                  {new Date(chore.nextOccurrence).toLocaleDateString()}
                </p>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;
