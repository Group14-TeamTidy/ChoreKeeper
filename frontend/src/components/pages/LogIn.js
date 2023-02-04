import React from "react";
import { useQuery } from "react-query";
import { Link } from "@tanstack/react-location";

const LogIn = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
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
            Username:
            <input type="text" name="username" />
          </label>
          <br />
          <label>
            Password:
            <input type="text" name="password" />
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
