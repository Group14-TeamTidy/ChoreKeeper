import React from "react";
import { Link, Navigate } from "@tanstack/react-location";
import { useNavigate } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const LogIn = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Clear the form
    e.target.email.value = "";
    e.target.password.value = "";

    AuthService.login(email, password).then(() => {
      navigate({ to: "/", replace: true });
    });
  };

  console.log("Re-rendered login");

  if (AuthService.getCurrentUser() && AuthService.getToken()) {
    return <Navigate to="/" />;
  } else {
    return (
      <>
        <div>
          <h1>Log In</h1>
        </div>
        <div>
          <form onSubmit={(e) => handleSubmit(e)}>
            <InputText type="email" name="email" placeholder="Email" />
            <br />
            <InputText
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
            />
            <br />
            <Button type="submit" value="Submit">
              Submit
            </Button>
          </form>
        </div>
        <div>
          <p>
            Don't have an account? <Link to="/signup">Sign Up!</Link>
          </p>
        </div>
      </>
    );
  }
};

export default LogIn;
