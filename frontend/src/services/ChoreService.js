import axios from "axios";
import AuthService from "./AuthService";

const setConfig = (token) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    }
  }
};

const ChoreService = {
  createChore: async (choreName, freqQuantity, freqTimePeriod, location, duration, preference) => {
    let config = setConfig(AuthService.getToken());
    return await axios
    .post(`${process.env.REACT_APP_API_BASE_URL}/chores/`, {
        name: choreName,
        frequency: {
            quantity: freqQuantity,
            interval: freqTimePeriod
        },
        location: location,
        duration: duration,
        preference: preference
    }, config)
  },

  getChores: async () => {
    let config = setConfig(AuthService.getToken());
    return await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chores/`, config);
  },

  updateChore: async (id, choreName, freqQuantity, freqTimePeriod, location, duration, preference) => {
    let config = setConfig(AuthService.getToken());
    return await axios
    .put(`${process.env.REACT_APP_API_BASE_URL}/chores/${id}`, {
      name: choreName,
      frequency: {
        quantity: freqQuantity,
        interval: freqTimePeriod
      },
      location: location,
      duration: duration,
      preference: preference
    }, config)
  },

  deleteChore: async (id) => {
    let config = setConfig(AuthService.getToken());
    return await axios
    .delete(`${process.env.REACT_APP_API_BASE_URL}/chores/${id}`, config)
    .then((res) => {
      console.log(res.data.message);
    });
  },
};

export default ChoreService;
