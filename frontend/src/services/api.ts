import axios from 'axios';

// Types
interface PersonData {
  firstName: string;
  lastName: string;
  middleName?: string;
  maidenName?: string;
  gender?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  isDeceased?: boolean;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  occupation?: string;
  biologicalFatherId?: string;
  biologicalMotherId?: string;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Could redirect to login page here
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: async (data: { email: string; password: string; role?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  linkPerson: async (data: { personId: string }) => {
    const response = await api.post('/auth/link-person', data);
    return response.data;
  },

  updateUserRole: async (userId: string, data: { role: string }) => {
    const response = await api.put(`/auth/users/${userId}/role`, data);
    return response.data;
  },
};

// Persons API functions
export const personsAPI = {
  getPersons: async () => {
    const response = await api.get('/persons');
    return response.data;
  },

  getPerson: async (id: string) => {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  },

  createPerson: async (data: PersonData) => {
    const response = await api.post('/persons', data);
    return response.data;
  },

  updatePerson: async (id: string, data: Partial<PersonData>) => {
    const response = await api.put(`/persons/${id}`, data);
    return response.data;
  },

  deletePerson: async (id: string) => {
    const response = await api.delete(`/persons/${id}`);
    return response.data;
  },

  createMarriage: async (data: {
    spouse1Id: string;
    spouse2Id: string;
    marriageDate?: string;
    marriagePlace?: string;
    status?: string;
  }) => {
    const response = await api.post('/persons/marriages', data);
    return response.data;
  },
};

// Families API
export const familiesAPI = {
  list: async () => {
    const response = await api.get('/families');
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/families/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string }) => {
    const response = await api.post('/families', data);
    return response.data;
  },

  requestJoin: async (familyId: string) => {
    const response = await api.post(`/families/${familyId}/join`, {});
    return response.data;
  },

  getRequests: async (familyId: string) => {
    const response = await api.get(`/families/${familyId}/requests`);
    return response.data;
  },

  processRequest: async (familyId: string, requestId: string, action: 'accept' | 'reject') => {
    const response = await api.put(`/families/${familyId}/requests/${requestId}`, { action });
    return response.data;
  },

  getTree: async (familyId: string) => {
    const response = await api.get(`/families/${familyId}/tree`);
    return response.data;
  },

  removeMember: async (familyId: string, memberId: string) => {
    const response = await api.delete(`/families/${familyId}/members/${memberId}`);
    return response.data;
  },
};

export default api;
