import { React, useState } from "react";
import { Button } from "primereact/button";
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.min.css";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import ChoreService from "../services/ChoreService";

const CreateChore = ({show, onHide, onSave, currChore}) => {
    const handleSave = (e) => {
        e.preventDefault();

        const choreName = e.target.choreName.value;
        const freqQuantity = e.target.frequencyQuantity.value;
        const freqTimePeriod = e.target.frequencyTimePeriod.value;
        const location = e.target.location.value;
        const durQuantity = e.target.durationQuantity.value;
        const durTimePeriod = e.target.durationTimePeriod.value;
        const preference = e.target.preference.value;

        const MIN_TO_SEC = 60;
        const HOUR_TO_SEC = 3600;
        var dur;
        if(durTimePeriod === durations[0]) {
            dur = durQuantity * MIN_TO_SEC;
        } else if(durTimePeriod === durations[1]) {
            dur = durQuantity * HOUR_TO_SEC;
        }
        const duration = dur;

        if(currChore != null && currChore._id !== -1) {
            ChoreService.updateChore(currChore._id, choreName, freqQuantity, freqTimePeriod, location, duration, preference).then(() => {onSave()});
        } else {
            ChoreService.createChore(choreName, freqQuantity, freqTimePeriod, location, duration, preference).then(() => {onSave()});
        }

        handleClose();
    }

    const handleClose = () => {
        setSelectedFrequency(null);
        setSelectedDuration(null);
        setSelectedPreference(null);
        onHide();
    }

    const [selectedFrequency, setSelectedFrequency] = useState(null);
    const frequencies = [
        { name: "Days", val: "days" },
        { name: "Weeks", val: "weeks" },
        { name: "Months", val: "months" },
        { name: "Years", val: "years" }
    ];

    const [selectedDuration, setSelectedDuration] = useState(null);
    const durations = ["Minutes", "Hours"];

    const [selectedPreference, setSelectedPreference] = useState(null);
    const preferences = [
        { name: "Low", val: "low"},
        { name: "Medium", val: "medium"},
        { name: "High", val: "high"}
    ];

    const handlePopulation = () => {
        const MIN_TO_SEC = 60;
        const HOUR_TO_SEC = 3600;

        if(currChore != null && currChore._id !== -1) {
            let durQuantity = (currChore.duration < HOUR_TO_SEC) ? currChore.duration / MIN_TO_SEC : currChore.duration / HOUR_TO_SEC;
            let durInterval = (currChore.duration < HOUR_TO_SEC) ? "Minutes" : "Hours";

            document.getElementById("choreName").value = currChore.name;
            document.getElementById("frequencyQuantity").value = currChore.frequency.quantity;
            setSelectedFrequency(currChore.frequency.interval);
            document.getElementById("location").value = currChore.location;
            document.getElementById("durationQuantity").value = durQuantity;
            setSelectedDuration(durInterval);
            setSelectedPreference(currChore.preference);

            document.getElementById('contained-modal-title-vcenter').innerHTML = "Edit Chore";
        }
    }

    return (
        <Modal show={show} onHide={() => handleClose()} onShow={() => handlePopulation()} size="lg">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">New Chore</Modal.Title>
            </Modal.Header>
      
            <form onSubmit={(e) => handleSave(e)}>
                <Modal.Body scrollable="true">
                        <div>
                            <label htmlFor="choreName">Name</label>
                            <InputText type="text" id="choreName" name="choreName" />
                        </div>

                        <fieldset>
                            <legend>Frequency</legend>
                            <InputText type="number" id="frequencyQuantity" name="frequencyQuantity" min="0" step="0.01" />
                            <Dropdown name="frequencyTimePeriod" value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.value)} 
                                options={frequencies} optionLabel="name" optionValue="val" placeholder="Select"/>
                        </fieldset>

                        <div>
                            <label htmlFor="location">Location</label>
                            <InputText type="text" id="location" name="location" />
                        </div>

                        <fieldset>
                            <legend>Duration</legend>
                            <InputText type="number" id="durationQuantity" name="durationQuantity" min="0" step="0.01" />
                            <Dropdown name="durationTimePeriod" value={selectedDuration} onChange={(e) => setSelectedDuration(e.value)} 
                                options={durations} placeholder="Select"/>
                        </fieldset>

                        <div>
                            <label htmlFor="preference">Preference</label>
                            <Dropdown id="preference" name="preference" value={selectedPreference} onChange={(e) => setSelectedPreference(e.value)} 
                                options={preferences} placeholder="Select" optionLabel="name" optionValue="val"/>
                        </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" id="cancelButton" onClick={() => handleClose()}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

export default CreateChore;