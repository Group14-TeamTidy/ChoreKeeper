import { React } from "react";
import { useMutation } from "react-query";
import axios from "axios";

const SignUp = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    axios.post("http://localhost:4000/api/signup", {
      username: username,
      password: password,
    });
  };

  return (
    <>
      <div>
        <h1>Sign Up</h1>
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
          <input type="submit" value="Sign Up!" />
        </form>
      </div>
    </>
  );
};

export default SignUp;
