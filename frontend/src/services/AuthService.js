import axios from "axios";

const AuthService = {
  login: (email, password) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        email: email,
        password: password,
      })
      .then((res) => {
        // Get the JWT token from the response
        const token = res.data.token;
        const user = res.data.user;
        // Store the token in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  register: (email, password) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE_URL}/signup`, {
        email: email,
        password: password,
      })
      .then((res) => {
        // Get the JWT token from the response
        const token = res.data.token;
        const user = res.data.user;
        // Store the token in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      });
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  getAuthHeader: () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token) {
      return { "x-access-token": `${token}`, "x-user-id": user.id };
    } else {
      return {};
    }
  },

  getUser: () => {
    return axios
    .get(`${process.env.REACT_APP_API_BASE_URL}/user/email`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem("token"),
      }
    });
  },

  setUserNotifications: (receiveNotifs) => {
    return axios
    .put(`${process.env.REACT_APP_API_BASE_URL}/user/notifs`,
      {
        receiveNotifs: receiveNotifs,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem("token"),
        }
      }
    );
  }
};

export default AuthService;
