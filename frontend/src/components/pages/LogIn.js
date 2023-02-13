import React, { useRef } from "react";
import { Link, Navigate } from "@tanstack/react-location";
import { useNavigate } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

const LogIn = () => {
  const navigate = useNavigate();

  const serverErrorsToast = useRef(null);

  const showServerErrorsToast = (message) => {
    serverErrorsToast.current.show({
      severity: "error",
      summary: "Server Error",
      detail: message,
      life: 3000,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    e.target.email.value = "";
    e.target.password.value = "";

    AuthService.login(email, password)
      .then(() => {
        navigate({ to: "/", replace: true });
      })
      .catch((error) => {
        showServerErrorsToast(error.response.data.message);
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
            <form onSubmit={(e) => handleSubmit(e)}>
              <InputText
                className="user-form-text-input"
                type="email"
                name="email"
                placeholder="Email"
              />
              <br />
              <InputText
                className="user-form-text-input"
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
              />
              <br />
              <Button type="submit" value="Submit">
                Log In
              </Button>
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
