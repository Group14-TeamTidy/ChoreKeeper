import axios from "axios";
import AuthService from "./AuthService";

const setConfig = (token) => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  };
};

const ChoreService = {
  createChore: (
    choreName,
    freqQuantity,
    freqTimePeriod,
    location,
    duration,
    preference
  ) => {
    let config = setConfig(AuthService.getToken());
    return axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/chores/`,
      {
        name: choreName,
        frequency: {
          quantity: freqQuantity,
          interval: freqTimePeriod,
        },
        location: location,
        duration: duration,
        preference: preference,
      },
      config
    );
  },

  getChores: () => {
    let config = setConfig(AuthService.getToken());
    return axios.get(`${process.env.REACT_APP_API_BASE_URL}/chores/`, config);
  },

  updateChore: (
    id,
    choreName,
    freqQuantity,
    freqTimePeriod,
    location,
    duration,
    preference
  ) => {
    let config = setConfig(AuthService.getToken());

    return axios.put(
      `${process.env.REACT_APP_API_BASE_URL}/chores/${id}/`,
      {
        name: choreName,
        frequency: {
          quantity: freqQuantity,
          interval: freqTimePeriod,
        },
        location: location,
        duration: duration,
        preference: preference,
      },
      config
    );
  },

  deleteChore: (id) => {
    let config = setConfig(AuthService.getToken());
    return axios
      .delete(`${process.env.REACT_APP_API_BASE_URL}/chores/${id}/`, config)
      .then((res) => {
        console.log(res.data.message);
      });
  },

  checkChore: (id) => {
    let config = setConfig(AuthService.getToken());
    return axios.put(
      `${process.env.REACT_APP_API_BASE_URL}/chores/${id}/checked/`,
      {},
      config
    );
  },
};

export default ChoreService;
