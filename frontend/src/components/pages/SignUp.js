import { React } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

const SignUp = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    AuthService.register(email, password).then(() => {
      navigate({ to: "/", replace: true });
    });
  };

  if (AuthService.getCurrentUser() && AuthService.getToken()) {
    return <Navigate to="/" />;
  } else {
    return (
      <>
        <div>
          <h1>Sign Up</h1>
        </div>
        <div>
          <form onSubmit={(e) => handleSubmit(e)}>
            <InputText type="email" name="email" placeholder="Email" />
            <br />
            <InputText
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
            />
            <br />
            <Button type="submit" value="Sign Up!">
              Sign Up!
            </Button>
          </form>
        </div>
      </>
    );
  }
};

export default SignUp;
