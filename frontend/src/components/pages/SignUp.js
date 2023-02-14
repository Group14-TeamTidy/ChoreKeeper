import { React, useRef } from "react";
import { Navigate, useNavigate, Link } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";
import { useFormik } from "formik";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";

const SignUp = () => {
  const navigate = useNavigate();
  const serverErrorsToast = useRef(null);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      password_confirmation: "",
    },
    validate: (values) => {
      const errors = {};
      if (values.email === "") {
        errors.email = "Required";
      }

      if (values.password === "") {
        errors.password = "Required";
      }

      if (values.password_confirmation !== values.password) {
        errors.password_confirmation = "Passwords do not match";
      }

      return errors;
    },
    onSubmit: (values) => {
      AuthService.register(values.email, values.password)
        .then(() => {
          navigate({ to: "/", replace: true });
        })
        .catch((error) => {
          showServerErrorsToast(error.response.data.message);
        });
    },
    validateOnChange: false,
    validateOnBlur: false,
  });

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
            <h3>Sign Up</h3>
            <form onSubmit={formik.handleSubmit}>
              <InputText
                className={classNames({
                  "user-form-text-input": true,
                  "p-invalid": formik.errors.email,
                })}
                type="email"
                name="email"
                placeholder="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              {formik.errors.email && (
                <small className="p-error field-validation-note">
                  {formik.errors.email}
                </small>
              )}
              <br />
              <InputText
                className={classNames({
                  "user-form-text-input": true,
                  "p-invalid": formik.errors.password,
                })}
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              {formik.errors.password && (
                <small className="p-error field-validation-note">
                  {formik.errors.password}
                </small>
              )}
              <br />
              <InputText
                className={classNames({
                  "user-form-text-input": true,
                  "p-invalid": formik.errors.password_confirmation,
                })}
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={formik.values.password_confirmation}
                onChange={formik.handleChange}
              />
              {formik.errors.password_confirmation && (
                <small className="p-error field-validation-note">
                  {formik.errors.password_confirmation}
                </small>
              )}
              <br />
              <Button type="submit" value="Sign Up!">
                Sign Up
              </Button>
              <p className="small-caption-text">
                Already have an account?{" "}
                <Link className="inline-link" to="/login">
                  Log In!
                </Link>{" "}
              </p>
            </form>
          </div>
        </div>
      </>
    );
  }
};

export default SignUp;
