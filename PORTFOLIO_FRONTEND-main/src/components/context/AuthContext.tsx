import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from 'react';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import api from '../api';
import type {
  AuthAction,
  AuthContextType,
  AuthState,
  ApiErrorResponse,
  LoginFormData,
  RegisterFormData,
  User,
} from '../../types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/**
 * Internal context — use the `useAuth()` hook instead of consuming this directly.
 * Using `undefined` as default ensures consumers inside a missing provider get
 * a clear runtime error rather than a silent bug.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  loginLoading: false,
  registerLoading: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'USER_LOADED':
      return { ...state, isAuthenticated: true, loading: false, user: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        loginLoading: false,
        user: action.payload,
      };
    case 'LOGIN_REQUEST':
      return { ...state, loginLoading: true };
    case 'REGISTER_REQUEST':
      return { ...state, registerLoading: true };
    case 'REGISTER_SUCCESS':
      return { ...state, registerLoading: false };
    case 'LOGOUT':
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        user: null,
        loginLoading: false,
        registerLoading: false,
      };
    default:
      return state;
  }
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Keep dispatch in a ref so the axios interceptor (set up once) always
   * has access to the latest dispatch without needing to be re-registered.
   */
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // Axios response interceptor — silently refresh the access token on 401,
  // then replay the original request.
  useEffect(() => {
    const interceptorId = api.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const original = error.config;
        if (
          error.response?.status === 401 &&
          original &&
          !(original as typeof original & { _retry?: boolean })._retry &&
          !original.url?.includes('/api/auth/refresh') &&
          !original.url?.includes('/api/auth/login')
        ) {
          (original as typeof original & { _retry?: boolean })._retry = true;
          try {
            await api.post('/api/auth/refresh');
            return await api(original);
          } catch {
            dispatchRef.current({ type: 'AUTH_ERROR' });
            localStorage.removeItem('isAuthenticated');
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  const loadUser = useCallback(async (): Promise<void> => {
    const hasAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (!hasAuth) {
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }
    try {
      const res = await api.get<User>('/api/auth/user');
      dispatch({ type: 'USER_LOADED', payload: res.data });
      localStorage.setItem('isAuthenticated', 'true');
    } catch {
      dispatch({ type: 'AUTH_ERROR' });
      localStorage.removeItem('isAuthenticated');
    }
  }, []);

  const register = async (formData: RegisterFormData): Promise<void> => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      await api.post('/api/auth/register', formData);
      dispatch({ type: 'REGISTER_SUCCESS' });
      toast.success('Registration successful! Please login.', { containerId: 'global' });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        typeof axiosError.response?.data?.message === 'string'
          ? axiosError.response.data.message
          : 'Registration failed!';
      toast.error(message, { containerId: 'global' });
    }
  };

  const login = async (formData: LoginFormData): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const res = await api.post<{ user: User }>('/api/auth/login', formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data.user });
      localStorage.setItem('isAuthenticated', 'true');
      toast.success('Login successful!', { containerId: 'global' });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
      localStorage.removeItem('isAuthenticated');
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        typeof axiosError.response?.data?.message === 'string'
          ? axiosError.response.data.message
          : 'Login failed!';
      toast.error(message, { containerId: 'global' });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      dispatch({ type: 'LOGOUT' });
      localStorage.removeItem('isAuthenticated');
    }
  };

  const updateUsername = async (username: string): Promise<void> => {
    try {
      const res = await api.patch<User>('/api/auth/username', { username });
      dispatch({ type: 'USER_LOADED', payload: res.data });
      toast.success('Username updated successfully!', { containerId: 'global' });
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        typeof axiosError.response?.data?.message === 'string'
          ? axiosError.response.data.message
          : typeof axiosError.response?.data?.message === 'object' && Array.isArray(axiosError.response?.data?.message)
          ? axiosError.response.data.message.join(', ')
          : 'Failed to update username';
      toast.error(message, { containerId: 'global' });
      throw err;
    }
  };

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const contextValue: AuthContextType = {
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    loginLoading: state.loginLoading,
    registerLoading: state.registerLoading,
    user: state.user,
    register,
    login,
    logout,
    loadUser,
    updateUsername,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ---------------------------------------------------------------------------
// Custom hook — preferred way to consume auth state
// ---------------------------------------------------------------------------

/**
 * Returns the current auth context value.
 * Must be used inside an `<AuthProvider>` — throws if used outside.
 */
const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};

export { AuthContext, AuthProvider, useAuth };
