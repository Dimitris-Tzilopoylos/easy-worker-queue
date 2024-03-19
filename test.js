const axios = require("axios");

module.exports = function ({ id }) {
  return axios
    .get(`https://jsonplaceholder.typicode.com/todos/${id}`)
    .then((res) => res.data)
    .catch((error) => console.log(error));
};
