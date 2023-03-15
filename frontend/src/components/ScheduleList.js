import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { useMemo, useState } from "react";

const ScheduleList = ({ chores }) => {
  const [checkedChores, setCheckedChores] = useState([]);

  const setChecked = (e, choreId) => {
    if (e.checked) {
      setCheckedChores([...checkedChores, choreId]);
    } else {
      setCheckedChores(checkedChores.filter((id) => id !== choreId));
    }
  };

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
            <Checkbox
              className="schedule-item-checkbox"
              onChange={(e) => setChecked(e, chore._id)}
              checked={checkedChores.includes(chore._id)}
            />
            <div className="schedule-chore-details">
              <p className="schedule-chore-name">
                <strong>{chore.name}</strong>
                {chore.location && <em>, {chore.location}</em>}
              </p>
              {chore.frequency && (
                <p className="schedule-chore-next">
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
