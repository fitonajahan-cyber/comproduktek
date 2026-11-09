import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // kirim cookie httpOnly (token JWT)
});

export default api;
