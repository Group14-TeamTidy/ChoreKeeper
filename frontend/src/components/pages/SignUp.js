import { React } from "react";

const SignUp = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
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
          <input type="submit">Sign Up!</input>
        </form>
      </div>
    </>
  );
};

export default SignUp;
