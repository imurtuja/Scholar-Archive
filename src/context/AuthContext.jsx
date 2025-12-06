import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Logout function
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('studyAppUser');
        // Redirect to login
        window.location.href = '/login';
    }, []);

    // Authenticated fetch - automatically handles 401 errors
    const authenticatedFetch = useCallback(async (url, options = {}) => {
        const token = localStorage.getItem('token');

        if (!token) {
            logout();
            throw new Error('No authentication token');
        }

        const headers = {
            ...options.headers,
            'x-auth-token': token,
        };

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...options, headers });

        // If 401, token is invalid/expired - logout
        if (response.status === 401) {
            console.warn('Token expired or invalid, logging out...');
            logout();
            throw new Error('Session expired. Please log in again.');
        }

        return response;
    }, [logout]);

    useEffect(() => {
        // Check for token in localStorage and verify with backend
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token by fetching user profile
                    const res = await fetch('/api/auth/profile', {
                        headers: { 'x-auth-token': token }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                        localStorage.setItem('studyAppUser', JSON.stringify(data));
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('studyAppUser');
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Use cached user data if backend unreachable
                    const savedUser = localStorage.getItem('studyAppUser');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                    }
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('studyAppUser', JSON.stringify(data.user));
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const signup = async (name, email, password, institution, course, year, courseType, durationYears, totalSemesters) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, institution, course, year, courseType, durationYears, totalSemesters })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('studyAppUser', JSON.stringify(data.user));
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const setAuth = (token, userData) => {
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('studyAppUser', JSON.stringify(userData));
    };

    // Update user data (e.g., after profile update)
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('studyAppUser', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            setAuth,
            loading,
            authenticatedFetch,
            updateUser
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
