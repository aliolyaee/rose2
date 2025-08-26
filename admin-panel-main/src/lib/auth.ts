import type { User, LoginResponse } from '@/types';
import axios from 'axios'; // Use raw axios for login if axiosInstance is not yet configured or login is public
import axiosInstance from './axiosInstance'; // For fetching user details after login

const AUTH_USER_KEY = 'reservistaAuthUser';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const login = async (email?: string, password?: string): Promise<User> => {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // const formData = new FormData();
  // formData.append('username', email); // API expects 'username'
  // formData.append('password', password);

  const data = {
    username: email,
    password: password,
  };

  try {
    // const response = await axios.post<LoginResponse>(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });

    const response = await axios.post<LoginResponse>(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    const { accessToken, refreshToken, user: userInfoFromLogin } = response.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    }

    // If user info is directly available from login response
    if (userInfoFromLogin && userInfoFromLogin.id) {
      const userToStore: User = {
        id: userInfoFromLogin.id,
        fullName: userInfoFromLogin.fullName,
        username: userInfoFromLogin.username,
        role: userInfoFromLogin.role,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToStore));
      }
      return userToStore;
    } else {
      // Fallback: If login doesn't return user, try to fetch it using the username (assuming it's unique)
      // This is a workaround if a dedicated /me endpoint isn't available.
      // A better approach would be a /me endpoint or JWT decoding for user ID.
      try {
        // This assumes username is the email and it's unique and can be used to fetch the user.
        // The /admin/users endpoint might require admin privileges not yet established.
        // This part is highly dependent on actual API behavior and capabilities.
        // For now, we'll construct a minimal user object or throw if no user info.
        // This is a placeholder for a proper /me call or JWT decoding.
        // console.warn("Login response did not include user details. A /me endpoint or JWT decoding is recommended.");

        // Let's try to fetch the user by username from the /admin/users list.
        // This is inefficient and might fail due to permissions or if username isn't filterable.
        // A dedicated /users/me or /profile endpoint that uses the token is standard.
        const usersResponse = await axiosInstance.get<User[]>('/admin/users');
        const loggedInUser = usersResponse.data.find(u => u.username === email);

        if (loggedInUser) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loggedInUser));
          }
          return loggedInUser;
        } else {
          // If user details cannot be fetched, store a minimal user object based on login input
          // This is not ideal as role and id would be missing or incorrect.
          const placeholderUser: User = {
            id: 'unknown_after_login', // This should be fixed with a proper /me endpoint
            fullName: email.split('@')[0], // Guess
            username: email,
            role: 'staff', // Default guess
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(placeholderUser));
          }
          console.warn("Could not fetch user details post-login. Using placeholder. Implement a /me endpoint.");
          return placeholderUser;
        }

      } catch (fetchError) {
        console.error("Failed to fetch user details after login:", fetchError);
        // Even if fetching details fails, login itself was successful if tokens were received.
        // Store a placeholder or clear tokens and reject. For now, let's allow login with minimal info.
        const placeholderUser: User = {
          id: 'fetch_failed',
          fullName: email.split('@')[0],
          username: email,
          role: 'staff',
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(placeholderUser));
        }
        return placeholderUser; // Or throw new Error('Login succeeded, but failed to retrieve user details.');
      }
    }

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed. Please check your credentials.');
    }
    throw new Error('Login failed due to a network or server issue.');
  }
};

export const logout = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    // Optionally, call a backend logout endpoint
    // axiosInstance.post('/user/logout').catch(err => console.error("Logout API call failed", err));
    resolve();
  });
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!token) return null; // If no token, definitely not logged in.

  try {
    return userStr ? JSON.parse(userStr) as User : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.removeItem(AUTH_USER_KEY); // Clean up corrupted data
    return null;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Placeholder for signup - implement if needed
export const signup = async (/* userData */) => {
  // const { fullname, username, password, confirm_password } = userData;
  // const formData = new FormData();
  // formData.append('fullname', fullname);
  // formData.append('username', username);
  // formData.append('password', password);
  // formData.append('confirm_password', confirm_password);
  // return axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, formData);
  console.warn("Signup function not fully implemented with API.");
  return Promise.reject("Signup not implemented.");
};

// Placeholder for setAdmin - implement if needed
export const setUserAdmin = async (userId: string) => {
  // return axiosInstance.post(`/user/set-admin/${userId}`);
  console.warn("setUserAdmin function not fully implemented with API.");
  return Promise.reject("setUserAdmin not implemented.");
};
