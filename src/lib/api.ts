import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY, UNAUTHORIZED_EVENT } from '../config';
import type {
  AuthResponse,
  CreateTripPayload,
  LoginPayload,
  RateTripPayload,
  RegisterPayload,
  Trip,
  User
} from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const response = await promise;
  return response.data;
}

export function login(payload: LoginPayload) {
  return unwrap<AuthResponse>(api.post('/auth/login', payload));
}

export function register(payload: RegisterPayload) {
  return unwrap<AuthResponse>(api.post('/auth/register', payload));
}

export function getMyProfile() {
  return unwrap<User>(api.get('/users/me'));
}

export function getAvailableDrivers() {
  return unwrap<User[]>(api.get('/drivers/available'));
}

export function getPassengerTrips() {
  return unwrap<Trip[]>(api.get('/trips'));
}

export function createTrip(payload: CreateTripPayload) {
  return unwrap<Trip>(api.post('/trips', payload));
}

export function getDriverTrips() {
  return unwrap<Trip[]>(api.get('/trips/my'));
}

export function getPendingTrips() {
  return unwrap<Trip[]>(api.get('/trips/pending'));
}

export function getTripById(id: number) {
  return unwrap<Trip>(api.get(`/trips/${id}`));
}

export function acceptTrip(id: number) {
  return unwrap<Trip>(api.patch(`/trips/${id}/accept`));
}

export function completeTrip(id: number) {
  return unwrap<Trip>(api.patch(`/trips/${id}/complete`));
}

export function rateTrip(id: number, payload: RateTripPayload) {
  return unwrap<Trip>(api.post(`/trips/${id}/rate`, payload));
}
