import axios from 'axios';

const REACT_APP_API_URL = import.meta.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: REACT_APP_API_URL || 'http://localhost:8080/graphql',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default API;
