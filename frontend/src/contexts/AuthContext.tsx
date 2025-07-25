// src/contexts/AuthContext.tsx

import { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from "react"; // Add useCallback
import * as api from "@/utils/api";
import { UpdateUserDto, UserProfileDto } from "@/utils/api";

interface User {
    id: string;
    email: string;
    fullName?: string;
    organization?: string;
    jobTitle?: string;
    country?: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    is2FAEnabled: boolean;
    is2FARequired: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: () => void;
    handleGoogleCallback: () => Promise<boolean>;
    loginWithOtp: (email: string) => Promise<any>;
    verify2FA: (userId: string, code: string) => Promise<boolean>;

    confirmEmail: (email: string, token: string) => Promise<boolean>;
    resendConfirmation: (email: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<boolean>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<boolean>;
    setupAuthenticator: () => Promise<any>;
    enableAuthenticator: (code: string) => Promise<boolean>;
    disable2FA: (password: string) => Promise<boolean>;
    sendEmailOtp: () => Promise<boolean>;
    getProfile: () => Promise<UserProfileDto | null>;
    updateProfile: (profileData: UpdateUserDto) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    isAuthenticated: false,
    is2FAEnabled: false,
    is2FARequired: false,
    login: async () => false,
    loginWithGoogle: () => {},
    handleGoogleCallback: async () => false,
    loginWithOtp: async (email: string) => Promise.resolve(undefined),
    verify2FA: async () => false,
    confirmEmail: async () => false,
    resendConfirmation: async () => false,
    forgotPassword: async () => false,
    resetPassword: async () => false,
    setupAuthenticator: async () => Promise.resolve(undefined),
    enableAuthenticator: async () => false,
    disable2FA: async () => false,
    sendEmailOtp: async () => false,
    getProfile: async () => Promise.resolve(null),
    updateProfile: async () => false,
    logout: () => {},
});


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token") || null);
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            return null;
        }
        return null;
    });
    const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
    const [is2FARequired, setIs2FARequired] = useState<boolean>(false);

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
        console.log("Token in local storage:", localStorage.getItem("token"));
    }, [token]);

    // ✅ Wrap getProfile with useCallback
    const getProfile = useCallback(async () => {
        try {
            const profileData = await api.getProfile();
            setUser(profileData);
            return profileData;
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setUser(null);
            return null;
        }
    }, []); // Empty dependency array means it only gets created once

    useEffect(() => {
        if (token) {
            getProfile();
        }
    }, [token, getProfile]); // Add getProfile to dependencies here as well

    const isAuthenticated = !!token;

    // ✅ Wrap updateProfile with useCallback
    const updateProfile = useCallback(async (profileData: UpdateUserDto) => {
        try {
            const success = await api.updateProfile(profileData);
            if (success) {
                // Refresh the user data in the context after a successful update
                const newProfile = await getProfile();
                if (newProfile) {
                    setUser(newProfile);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Update profile failed:", error);
            return false;
        }
    }, [getProfile]); // updateProfile depends on getProfile

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password);
            const data = await response.json();

            if (data.status === "2FA_REQUIRED") {
                setIs2FARequired(true);
                return false;
            }

            setToken(data.token);
            await getProfile();
            setIs2FARequired(false);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const loginWithGoogle = () => {
        api.loginWithGoogle();
    };

    const handleGoogleCallback = async () => {
        try {
            const response = await api.handleGoogleCallback();
            const data = await response.json();
            
            if (data.token && data.token.result) {
                setToken(data.token.result);
                // Set user data from Google response
                setUser({
                    id: data.token.result, // You might need to decode JWT to get actual ID
                    email: data.email,
                    fullName: data.name,
                });
                setIs2FARequired(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Google login callback failed:", error);
            return false;
        }
    };

    const loginWithOtp = async (email: string): Promise<any> => {
      try {
          const response = await api.loginEmailOtp(email);
          const data = await response.json();
          return data;
      } catch (error) {
          console.error("Requesting OTP failed:", error);
          return undefined;
      }
    };

    const verify2FA = async (userId: string, code: string) => {
        try {
            const response = await api.verify2FA(userId, code);
            const data = await response.json();
            setToken(data.token);
            await getProfile();
            setIs2FARequired(false);
            return true;
        } catch (error) {
            console.error("2FA Verification failed:", error);
            return false;
        }
    };

    const confirmEmail = async (email: string, token: string) => {
        try {
            await api.confirmEmail(email, token);
            return true;
        } catch (error) {
            console.error("Email confirmation failed:", error);
            return false;
        }
    };

    const resendConfirmation = async (email: string) => {
        try {
            await api.resendConfirmationEmail(email);
            return true;
        } catch (error) {
            console.error("Resend confirmation failed:", error);
            return false;
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            await api.forgotPassword(email);
            return true;
        } catch (error) {
            console.error("Forgot password failed:", error);
            return false;
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string) => {
        try {
            await api.resetPassword(email, token, newPassword);
            return true;
        } catch (error) {
            console.error("Reset password failed:", error);
            return false;
        }
    };

    const setupAuthenticator = async () => {
        try {
            const response = await api.setupAuthenticator();
            return await response.json();
        } catch (error) {
            console.error("Setup authenticator failed:", error);
            return null;
        }
    };

    const enableAuthenticator = async (code: string) => {
        try {
            await api.enableAuthenticator(code);
            setIs2FAEnabled(true);
            return true;
        } catch (error) {
            console.error("Enable authenticator failed:", error);
            return false;
        }
    };

    const disable2FA = async (password: string) => {
        try {
            await api.disable2FA(password);
            setIs2FAEnabled(false);
            return true;
        } catch (error) {
            console.error("Disable 2FA failed:", error);
            return false;
        }
    };

    const sendEmailOtp = async () => {
        try {
            await api.sendEmailOtp();
            return true;
        } catch (error) {
            console.error("Send email OTP failed:", error);
            return false;
        }
    };

    const logout = useCallback(() => { // Wrap logout with useCallback too
        console.log("logout function called in AuthContext");
        setToken(null);
        setUser(null);
        setIs2FAEnabled(false);
        localStorage.removeItem("token");
    }, []); // No dependencies for logout

    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated,
        is2FAEnabled,
        is2FARequired,
        login,
        loginWithGoogle,
        handleGoogleCallback,
        loginWithOtp,
        verify2FA,
        confirmEmail,
        resendConfirmation,
        forgotPassword,
        resetPassword,
        setupAuthenticator,
        enableAuthenticator,
        disable2FA,
        sendEmailOtp,
        getProfile,
        updateProfile,
        logout,
    }), [token, user, isAuthenticated, is2FAEnabled, is2FARequired, login, loginWithGoogle, handleGoogleCallback, loginWithOtp, verify2FA, confirmEmail, resendConfirmation, forgotPassword, resetPassword, setupAuthenticator, enableAuthenticator, disable2FA, sendEmailOtp, getProfile, updateProfile, logout]);

    return (
        <AuthContext.Provider
            value={contextValue}
        >
            {children}
        </AuthContext.Provider>
    );
};