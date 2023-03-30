import { Card } from "primereact/card";
import { useMemo } from "react";
import { Button } from "primereact/button";
import { useMutation } from "react-query";
import ChoreService from "../services/ChoreService";
import { queryClient } from "../App";
import { motion } from "framer-motion";

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
      {choresList.map((chore, index) => (
        <motion.div
          key={chore._id}
          className="schedule-item"
          initial={{ opacity: 0, translateX: -50 }}
          animate={{
            opacity: 1,
            translateX: 0,
            transition: { duration: 0.5, delay: index * 0.25 },
          }}
          whileHover={{ scale: 1.05 }}
        >
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
        </motion.div>
      ))}
    </div>
  );
};

export default ScheduleList;
