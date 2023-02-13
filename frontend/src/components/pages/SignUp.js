import { React, useRef } from "react";
import { Navigate, useNavigate, Link } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";

const SignUp = () => {
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
    const passwordConfirmation = e.target.password_confirmation.value;

    if (password !== passwordConfirmation) {
      showServerErrorsToast("Passwords do not match");
      return;
    }

    AuthService.register(email, password)
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
            <h3>Sign Up</h3>
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
                autoComplete="new-password"
              />
              <br />
              <InputText
                className="user-form-text-input"
                type="password"
                name="password_confirmation"
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
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
