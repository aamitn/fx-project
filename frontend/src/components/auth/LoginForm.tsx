import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import OtpModal from "./OtpModal";
import { FcGoogle } from "react-icons/fc";

interface LoginFormProps {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm = ({ isLoading, setIsLoading }: LoginFormProps) => {
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const { login, loginWithGoogle, loginWithOtp, is2FARequired, verify2FA, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [otp, setOtp] = useState("");
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await login(loginForm.email, loginForm.password);
            if (success) {
                toast({
                    title: "Login successful",
                    description: "Welcome to FurnXpert!",
                });
                navigate("/dashboard");
            } else if (is2FARequired) {
                toast({
                    title: "2FA Required",
                    description: "Please enter the verification code sent to your email.",
                });
                // Optionally, navigate to a 2FA verification page
            } else {
                toast({
                    title: "Login failed",
                    description: "Invalid credentials. Please check your email and password.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Login error",
                description: "An error occurred during login.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginWithOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await loginWithOtp(loginForm.email);
            console.log("Response from loginWithOtp:", response);
            if (response?.userId && typeof response.userId === 'string' && response.userId.trim() !== '') {
                setUserId(response.userId);
                setIsOtpModalOpen(true);
                toast({
                    title: "OTP Sent",
                    description: "A one-time password has been sent to your email address.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Invalid Email : Failed to retrieve user ID. Please enter a valid email and try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!user) {
                toast({
                    title: "Error",
                    description: "User information is missing. Please login again.",
                    variant: "destructive",
                });
                return;
            }

            const success = await verify2FA(user.id, otp);
            if (success) {
                toast({
                    title: "Login successful",
                    description: "Welcome to FurnXpert!",
                });
                navigate("/dashboard");
            } else {
                toast({
                    title: "2FA Verification Failed",
                    description: "Invalid verification code.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "2FA Verification Error",
                description: "An error occurred during 2FA verification.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const closeOtpModal = () => {
        setIsOtpModalOpen(false);
        setOtp(""); // Clear OTP when modal closes
        setUserId(null); // Clear userId when modal closes
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    return (
        <>
            <form onSubmit={is2FARequired ? handleVerify2FA : handleLogin}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="login-email">
                            Email
                        </label>
                        <Input
                            id="login-email"
                            required
                            type="email"
                            placeholder="Enter your email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="login-password">
                            Password
                        </label>
                        <Input
                            id="login-password"
                            required
                            type="password"
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                    </div>
                    {is2FARequired && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="otp">
                                Verification Code
                            </label>
                            <Input
                                id="otp"
                                required
                                type="text"
                                placeholder="Enter verification code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-app-blue hover:bg-app-blue-dark"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? is2FARequired
                                ? "Verifying..."
                                : "Logging in..."
                            : is2FARequired
                                ? "Verify"
                                : "Login"}
                    </Button>
                </CardFooter>
                {!is2FARequired && (
                    <>
                        <CardFooter>
                            <Button
                                className="w-full bg-app-blue hover:bg-app-blue-dark"
                                type="button"
                                disabled={isLoading}
                                onClick={handleLoginWithOtp}
                            >
                                {isLoading ? "Sending OTP..." : "Login with OTP"}
                            </Button>
                        </CardFooter>
                        <CardFooter>
                            {/* Updated Google Login Button */}
                            <Button
                                className="w-full flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition-colors duration-200"
                                type="button"
                                disabled={isLoading}
                                onClick={handleGoogleLogin}
                            >
                                <FcGoogle className="h-5 w-5" /> {/* Google Icon */}
                                <span>Continue with Google</span>
                            </Button>
                        </CardFooter>
                    </>
                )}
            </form>

            {isOtpModalOpen ? (
                <OtpModal
                    email={loginForm.email}
                    userId={userId || ""}
                    onClose={closeOtpModal}
                    toast={toast}
                />
            ) : null}
        </>
    );
};

export default LoginForm;
