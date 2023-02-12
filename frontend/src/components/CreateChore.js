import { React, useState } from "react";
import { Button } from "primereact/button";
import Modal from 'react-bootstrap/Modal';
import "bootstrap/dist/css/bootstrap.min.css";

const CreateChore = (props) => {
    return (
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" scrollable>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">New Chore</Modal.Title>
            </Modal.Header>
      
            <Modal.Body>
                <h4>Centered Modal</h4>
                <p>
                    Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
                    dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
                    consectetur ac, vestibulum at eros.
                </p>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={props.onHide}>Cancel</Button>
                <Button onClick={props.onHide}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CreateChore;