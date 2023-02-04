import { React } from "react";
import axios from "axios";

const SignUp = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/signup`, {
      email: email,
      password: password,
    });
  };

  return (
    <>
      <div>
        <h1>Sign Up</h1>
      </div>
      <p>Node env: {process.env.NODE_ENV}</p>
      <p>API_BASE_URL: {process.env.API_BASE_URL}</p>
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
              autoComplete="current-password"
            />
          </label>
          <br />
          <input type="submit" value="Sign Up!" />
        </form>
      </div>
    </>
  );
};

export default SignUp;
