import axios from "axios";

const ChoreService = {
  createChore: (choreName, freqQuantity, freqTimePeriod, location, duration, preference) => {
    return axios
    .post(`${process.env.REACT_APP_API_BASE_URL}/chore/create`, {
        name: choreName,
        frequency: {
            quantity: freqQuantity,
            interval: freqTimePeriod
        },
        location: location,
        duration: duration,
        preference: preference
    })
    .then((res) => {
        console.log(res.status);
    });
  },

  getChores: () => {
    return Promise.resolve(axios.get(`${process.env.REACT_APP_API_BASE_URL}/chore/`));
  }
};



export default ChoreService;
