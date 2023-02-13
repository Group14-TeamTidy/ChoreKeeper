import { React, useState } from "react";
import { Button } from "primereact/button";
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.min.css";
import { InputText } from "primereact/inputtext";
import { Dropdown } from 'primereact/dropdown';
import axios from "axios";

const CreateChore = (props) => {
    const handleSave = (e) => {
        e.preventDefault();

        const choreName = e.target.choreName.value;
        const freqQuantity = e.target.frequencyQuantity.value;
        const freqTimePeriod = e.target.frequencyTimePeriod.value;
        const location = e.target.location.value;
        const durQuantity = e.target.durationQuantity.value;
        const durTimePeriod = e.target.durationTimePeriod.value;
        const preference = e.target.preference.value;

        const minToSec = 60;
        const hourToSec = 3600;
        var dur;
        if(durTimePeriod === durations[0]) {
            dur = durQuantity * minToSec;
        } else if(durTimePeriod === durations[1]) {
            dur = durQuantity * hourToSec;
        }
        const duration = dur;

        axios.post(`${process.env.REACT_APP_API_BASE_URL}/chores`, {
            name: choreName,
            frequency: {
                quantity: freqQuantity,
                interval: freqTimePeriod
            },
            location: location,
            duration: duration,
            preference: preference
        });

        props.onHide();
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

    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" scrollable>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">New Chore</Modal.Title>
            </Modal.Header>
      
            <form onSubmit={(e) => handleSave(e)}>
                <Modal.Body>
                        <label htmlFor="choreName">Name</label>
                        <InputText type="text" id="choreName" name="choreName" />

                        <fieldset>
                            <legend>Frequency</legend>
                            <InputText type="number" id="frequencyQuantity" name="frequencyQuantity" min="0" />
                            <Dropdown name="frequencyTimePeriod" value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.value)} options={frequencies} optionLabel="name" optionValue="val" placeholder="Select" className="w-full md:w-14rem"/>
                        </fieldset>

                        <label htmlFor="location">Location</label>
                        <InputText type="text" id="location" name="location" />

                        <fieldset>
                            <legend>Duration</legend>
                            <InputText type="number" id="durationQuantity" name="durationQuantity" min="0" />
                            <Dropdown name="durationTimePeriod" value={selectedDuration} onChange={(e) => setSelectedDuration(e.value)} options={durations} placeholder="Select" className="w-full md:w-14rem"/>
                        </fieldset>

                        <label htmlFor="preference">Preference</label>
                        <Dropdown id="preference" name="preference" value={selectedPreference} onChange={(e) => setSelectedPreference(e.value)} options={preferences} placeholder="Select" optionLabel="name" optionValue="val" className="w-full md:w-14rem"/>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={props.onHide}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

export default CreateChore;