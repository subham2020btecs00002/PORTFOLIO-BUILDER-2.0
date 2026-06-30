import React, { createContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

// Context
const AuthContext = createContext();

// Initial State
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  loginLoading: false,
  registerLoading: false,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return { ...state, isAuthenticated: true, loading: false, user: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true, loading: false, loginLoading: false, user: action.payload };
    case 'LOGIN_REQUEST':
      return { ...state, loginLoading: true };
    case 'REGISTER_REQUEST':
      return { ...state, registerLoading: true };
    case 'REGISTER_SUCCESS':
      return { ...state, registerLoading: false };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      return { ...state, isAuthenticated: false, loading: false, user: null, loginLoading: false, registerLoading: false };
    default:
      return state;
  }
};

// Provider Component
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // Axios interceptor: silently refresh access token on 401, then retry the original request
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        if (
          error.response?.status === 401 &&
          !original._retry &&
          !original.url?.includes('/api/auth/refresh') &&
          !original.url?.includes('/api/auth/login')
        ) {
          original._retry = true;
          try {
            await api.post('/api/auth/refresh');
            return api(original);
          } catch {
            dispatchRef.current({ type: 'AUTH_ERROR' });
          }
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptorId);
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/user');
      dispatch({ type: 'USER_LOADED', payload: res.data });
    } catch {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  const register = async (formData) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      await api.post('/api/auth/register', formData);
      dispatch({ type: 'REGISTER_SUCCESS' });
      toast.success('Registration successful! Please login.', { containerId: 'global' });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = err.response?.data?.message || 'Registration failed!';
      toast.error(message, { containerId: 'global' });
    }
  };

  const login = async (formData) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const res = await api.post('/api/auth/login', formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.user });
      toast.success('Login successful!', { containerId: 'global' });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const message = err.response?.data?.message || 'Login failed!';
      toast.error(message, { containerId: 'global' });
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        loginLoading: state.loginLoading,
        registerLoading: state.registerLoading,
        user: state.user,
        register,
        login,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
