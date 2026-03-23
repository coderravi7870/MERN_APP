import axios from 'axios';

const api = axios.create({
  baseURL:         'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    // Just reject - let React Router handle redirects through your components
    return Promise.reject(err);
  }
);

export default api;