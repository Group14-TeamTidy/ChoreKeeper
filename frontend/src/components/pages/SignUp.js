import { React } from "react";
import { Navigate, useNavigate } from "@tanstack/react-location";
import AuthService from "../../services/AuthService";

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
            <label>
              Email:
              <input type="email" name="email" />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                name="password"
                autoComplete="new-password"
              />
            </label>
            <br />
            <input type="submit" value="Sign Up!" />
          </form>
        </div>
      </>
    );
  }
};

export default SignUp;
