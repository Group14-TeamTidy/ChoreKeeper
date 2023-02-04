import React from "react";
import { Link } from "@tanstack/react-location";
import axios from "axios";

const LogIn = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    axios.post(`${process.env.REACT_APP_API_BASE_URL}/login`, {
      email: email,
      password: password,
    });
  };

  console.log("Re-rendered login");

  return (
    <>
      <div>
        <h1>Log In</h1>
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
          <label>
            <input type="submit" value="Submit" />
          </label>
        </form>
      </div>
      <div>
        <p>
          Don't have an account? <Link to="/signup">Sign Up!</Link>
        </p>
      </div>
    </>
  );
};

export default LogIn;
