import axios from 'axios';

const API = axios.create({
  baseURL: 'https://jnanasthan-production.up.railway.app', // your backend base URL
});

export default API;
