/**
 * Centralized TypeScript type definitions for the Portfolio Builder frontend.
 * All shared interfaces and types are defined here to ensure consistency
 * across the entire application.
 */

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Represents a logged-in user returned from the API. */
export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  username?: string;
}

/** Shape of the auth reducer state. */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
}

/** Discriminated union of every action the auth reducer can handle. */
export type AuthAction =
  | { type: 'USER_LOADED'; payload: User }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_REQUEST' }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_ERROR' };

/** Value exposed via AuthContext to the rest of the app. */
export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
  user: User | null;
  register: (formData: RegisterFormData) => Promise<void>;
  login: (formData: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Form data
// ---------------------------------------------------------------------------

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Portfolio domain models
// ---------------------------------------------------------------------------

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
  category: string;
}

export interface Project {
  title: string;
  description: string;
  link?: string;
}

export interface Education {
  collegeName: string;
  degree: string;
  branch: string;
  cgpaOrPercentage: string;
  yearOfJoining: string;
  yearOfPassing: string;
}

export interface ProfessionalHistory {
  companyName: string;
  position: string;
  responsibility: string;
  yearOfJoining: string;
  yearOfLeaving?: string;
  isCurrentEmployee: boolean;
}

export interface PortfolioLinks {
  github: string;
  leetcode: string;
  gfg: string;
  linkedin: string;
}

export interface AnalyticsData {
  views: number;
  contactCount: number;
  lastVisited: string | null;
}

/** Full portfolio document as returned from the API. */
export interface Portfolio {
  _id: string;
  user: User;
  title: string;
  description: string;
  projects: Project[];
  education: Education[];
  professionalHistory: ProfessionalHistory[];
  portfolioLinks: PortfolioLinks;
  skills: Skill[];
  templateId: string;
  analytics?: AnalyticsData;
  pdf?: { contentType: string } | null;
}

// ---------------------------------------------------------------------------
// Portfolio form
// ---------------------------------------------------------------------------

/** Shape of the local form state used in Create / Edit portfolio forms. */
export interface PortfolioFormData {
  title: string;
  description: string;
  projects: Project[];
  education: Education[];
  professionalHistory: ProfessionalHistory[];
  portfolioLinks: PortfolioLinks;
  skills: Skill[];
  templateId: string;
  /** File selected for resume upload; null when no file chosen. */
  pdf: File | null;
}

// ---------------------------------------------------------------------------
// API response helpers
// ---------------------------------------------------------------------------

/** Generic API error body shape (NestJS default). */
export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}
