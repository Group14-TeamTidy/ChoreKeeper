import { React, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import ChoreService from "../services/ChoreService";
import { useMutation } from "react-query";
import { queryClient } from "../App";

const ChoreCreateModal = ({ show, onHide, onSave, currChore }) => {
  const serverErrorsToast = useRef(null);

  const updateChoreMutation = useMutation(
    (variables) =>
      ChoreService.updateChore(
        variables.id,
        variables.name,
        variables.freqQuantity,
        variables.freqTimePeriod,
        variables.location,
        variables.duration,
        variables.preference
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("chores");
        onSave();
        handleClose();
      },
      onError: (error) => {
        showServerErrorsToast(error.response.data.message);
      },
    }
  );

  const createChoreMutation = useMutation(
    (variables) =>
      ChoreService.createChore(
        variables.name,
        variables.freqQuantity,
        variables.freqTimePeriod,
        variables.location,
        variables.duration,
        variables.preference
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("chores");
        onSave();
        handleClose();
      },
      onError: (error) => {
        showServerErrorsToast(error.response.data.message);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      choreName: "",
      frequencyQuantity: null,
      frequencyTimePeriod: "",
      location: "",
      durationQuantity: null,
      durationTimePeriod: "",
      preference: "",
    },
    validate: (values) => {
      const errors = {};
      if (values.choreName === "") {
        errors.choreName = "Chore name is required.";
      }

      if (
        values.frequencyQuantity === null ||
        values.frequencyTimePeriod === ""
      ) {
        errors.frequencyQuantity = "Chore frequency is required.";
        errors.frequencyTimePeriod = "Chore frequency is required.";
      } else if (values.frequencyQuantity === 0) {
        errors.frequencyQuantity = "Chore frequency cannot be 0.";
      }

      if (
        values.durationQuantity === null ||
        values.durationTimePeriod === ""
      ) {
        errors.durationQuantity = "Chore duration is required.";
        errors.durationTimePeriod = "Chore duration is required.";
      } else if (values.durationQuantity === 0) {
        errors.durationQuantity = "Chore duration cannot be 0.";
      }

      if (values.preference === "") {
        errors.preference = "Chore preference is required.";
      }

      return errors;
    },
    onSubmit: (values) => {
      const choreName = values.choreName;
      const freqQuantity = values.frequencyQuantity;
      const freqTimePeriod = values.frequencyTimePeriod;
      const location = values.location;
      const durQuantity = values.durationQuantity;
      const durTimePeriod = values.durationTimePeriod;
      const preference = values.preference;

      const MIN_TO_SEC = 60;
      const HOUR_TO_SEC = 3600;
      var dur;
      if (durTimePeriod === durations[0]) {
        dur = durQuantity * MIN_TO_SEC;
      } else if (durTimePeriod === durations[1]) {
        dur = durQuantity * HOUR_TO_SEC;
      }
      const duration = dur;

      if (currChore != null && currChore._id !== -1) {
        updateChoreMutation.mutate({
          id: currChore._id,
          name: choreName,
          freqQuantity,
          freqTimePeriod,
          location,
          duration,
          preference,
        });
      } else {
        createChoreMutation.mutate({
          name: choreName,
          freqQuantity,
          freqTimePeriod,
          location,
          duration,
          preference,
        });
      }
    },
    validateOnBlur: true,
    validateOnChange: true,
  });

  const showServerErrorsToast = (message) => {
    serverErrorsToast.current.show({
      severity: "error",
      summary: "Server Error",
      detail: message,
      life: 3000,
    });
  };

  const handleClose = () => {
    formik.resetForm();
    onHide();
  };

  const frequencies = [
    { name: "Days", val: "days" },
    { name: "Weeks", val: "weeks" },
    { name: "Months", val: "months" },
    { name: "Years", val: "years" },
  ];

  const durations = ["Minutes", "Hours"];

  const preferences = [
    { name: "Low", val: "low" },
    { name: "Medium", val: "medium" },
    { name: "High", val: "high" },
  ];

  const handlePopulation = () => {
    const MIN_TO_SEC = 60;
    const HOUR_TO_SEC = 3600;

    if (currChore != null && currChore._id !== -1) {
      let durQuantity =
        currChore.duration < HOUR_TO_SEC
          ? currChore.duration / MIN_TO_SEC
          : currChore.duration / HOUR_TO_SEC;
      let durInterval = currChore.duration < HOUR_TO_SEC ? "Minutes" : "Hours";

      formik.setFieldValue("choreName", currChore.name, false);
      formik.setFieldValue(
        "frequencyQuantity",
        currChore.frequency.quantity,
        false
      );
      formik.setFieldValue(
        "frequencyTimePeriod",
        currChore.frequency.interval,
        false
      );
      formik.setFieldValue("location", currChore.location, false);
      formik.setFieldValue("durationQuantity", durQuantity, false);
      formik.setFieldValue("durationTimePeriod", durInterval, false);
      formik.setFieldValue("preference", currChore.preference, false);
    }
  };

  const footerContent = (
    <>
      <Button type="button" id="cancelButton" onClick={() => handleClose()}>
        Cancel
      </Button>
      <Button onClick={formik.handleSubmit}>Save</Button>
    </>
  );

  return (
    <div>
      <Toast ref={serverErrorsToast} />
      <Dialog
        visible={show}
        header={
          currChore == null || currChore._id === -1
            ? "Create Chore"
            : "Edit Chore"
        }
        style={{ width: "50vw" }}
        onShow={handlePopulation}
        onHide={handleClose}
        footer={footerContent}
        maximizable
      >
        <form>
          <div>
            <label htmlFor="choreName">Name</label>
            <InputText
              type="text"
              id="choreName"
              name="choreName"
              className={classNames({
                "user-form-text-input": true,
                "p-invalid": formik.errors.choreName,
              })}
              value={formik.values.choreName}
              onChange={formik.handleChange}
            />

            {formik.errors.choreName && (
              <small className="p-error field-validation-note">
                {formik.errors.choreName}
              </small>
            )}
          </div>

          <fieldset>
            <legend>Frequency</legend>

            <InputNumber
              id="frequencyQuantity"
              name="frequencyQuantity"
              useGrouping={false}
              className={classNames({
                "user-form-text-input": true,
                "p-invalid": formik.errors.frequencyQuantity,
              })}
              value={formik.values.frequencyQuantity}
              onValueChange={(e) => {
                formik.setFieldValue("frequencyQuantity", e.value);
              }}
            />

            <Dropdown
              name="frequencyTimePeriod"
              options={frequencies}
              optionLabel="name"
              optionValue="val"
              placeholder="Select"
              className={classNames({
                "user-form-text-input": true,
                "p-invalid": formik.errors.frequencyTimePeriod,
              })}
              value={formik.values.frequencyTimePeriod}
              onChange={(e) => {
                formik.setFieldValue("frequencyTimePeriod", e.value);
              }}
            />

            {formik.errors.frequencyQuantity && (
              <small className="p-error field-validation-note">
                {formik.errors.frequencyQuantity}
              </small>
            )}
          </fieldset>

          <div>
            <label htmlFor="location">Location</label>
            <InputText
              type="text"
              id="location"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
            />
          </div>

          <fieldset>
            <legend>Duration</legend>

            <InputNumber
              id="durationQuantity"
              name="durationQuantity"
              useGrouping={false}
              minFractionDigits={0}
              maxFractionDigits={2}
              className={classNames({
                "user-form-text-input": true,
                "p-invalid": formik.errors.durationQuantity,
              })}
              value={formik.values.durationQuantity}
              onValueChange={(e) => {
                formik.setFieldValue("durationQuantity", e.value);
              }}
            />

            <Dropdown
              name="durationTimePeriod"
              options={durations}
              placeholder="Select"
              className={classNames({
                "user-form-text-input": true,
                "p-invalid": formik.errors.durationTimePeriod,
              })}
              value={formik.values.durationTimePeriod}
              onChange={(e) => {
                formik.setFieldValue("durationTimePeriod", e.value);
              }}
            />

            {formik.errors.durationQuantity && (
              <small className="p-error field-validation-note">
                {formik.errors.durationQuantity}
              </small>
            )}
          </fieldset>

          <div>
            <label htmlFor="preference">Preference</label>
            <Dropdown
              id="preference"
              name="preference"
              options={preferences}
              optionLabel="name"
              optionValue="val"
              placeholder="Select"
              className={classNames({
                "user-form-text-input": true,
                "p-invalid": formik.errors.preference,
              })}
              value={formik.values.preference}
              onChange={(e) => {
                formik.setFieldValue("preference", e.value);
              }}
            />

            {formik.errors.preference && (
              <small className="p-error field-validation-note">
                {formik.errors.preference}
              </small>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default ChoreCreateModal;
