import React, { useRef } from "react";
import { Link, Navigate } from "@tanstack/react-location";
import { useNavigate } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

const LogIn = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};
      if (values.email === "") {
        errors.email = "Required";
      }

      if (values.password === "") {
        errors.password = "Required";
      }
      return errors;
    },
    onSubmit: (values) => {
      AuthService.login(values.email, values.password)
        .then(() => {
          navigate({ to: "/", replace: true });
        })
        .catch((error) => {
          showServerErrorsToast(error.response.data.message);
        });
    },
  });

  const serverErrorsToast = useRef(null);

  const showServerErrorsToast = (message) => {
    serverErrorsToast.current.show({
      severity: "error",
      summary: "Server Error",
      detail: message,
      life: 3000,
    });
  };

  if (AuthService.getCurrentUser() && AuthService.getToken()) {
    return <Navigate to="/" />;
  } else {
    return (
      <>
        <Toast ref={serverErrorsToast} />
        <div className="grid">
          <div className="centered-block">
            <h1>Chore Keeper</h1>
            <h3>Log In</h3>
            <form onSubmit={formik.handleSubmit}>
              <InputText
                className={classNames("user-form-text-input", {
                  "p-invalid": formik.errors.email,
                })}
                type="email"
                name="email"
                placeholder="Email"
                value={formik.values.email}
                onChange={(e) => formik.setFieldValue("email", e.target.value)}
              />
              <br />
              <InputText
                className={classNames("user-form-text-input", {
                  "p-invalid": formik.errors.password,
                })}
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={(e) =>
                  formik.setFieldValue("password", e.target.value)
                }
              />
              <br />
              <Button type="submit">Log In</Button>
            </form>
            <div>
              <p className="small-caption-text">
                Don't have an account?{" "}
                <Link className="inline-link" to="/signup">
                  Sign Up!
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default LogIn;
