import { React, useState } from "react";
import { Button } from "primereact/button";
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.min.css";
import { InputText } from "primereact/inputtext";

const CreateChore = (props) => {
    const handleSave = (e) => {
        e.preventDefault();

        props.onHide();
    }

    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" scrollable>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">New Chore</Modal.Title>
            </Modal.Header>
      
            <form onSubmit={(e) => handleSave(e)}>
                <Modal.Body>
                        <label htmlFor="choreName">Name</label>
                        <input type="text" id="choreName" name="choreName"></input>

                        <fieldset>
                            <legend>Frequency</legend>
                            <input type="number" id="frequencyQuantity" name="frequencyQuantity"></input>
                            <select id="frequencyTimePeriod" name="frequencyTimePeriod">
                                <option defaultValue disabled value="">Select</option>
                                <option value="Days">Days</option>
                                <option value="Weeks">Weeks</option>
                                <option value="Months">Months</option>
                                <option value="Years">Years</option>
                            </select>
                        </fieldset>

                        <label htmlFor="location">Location</label>
                        <input type="text" id="location" name="location"></input>

                        <fieldset>
                            <legend>Duration</legend>
                            <input type="number" id="durationQuantity" name="durationQuantity"></input>
                            <select id="durationTimePeriod" name="durationTimePeriod">
                                <option defaultValue value="">Select</option>
                                <option value="Minutes">Minutes</option>
                                <option value="Hours">Hours</option>
                            </select>
                        </fieldset>

                        <label htmlFor="preference">Preference</label>
                        <select id="preference" name="preference">
                            <option defaultValue disabled value="">Select</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
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