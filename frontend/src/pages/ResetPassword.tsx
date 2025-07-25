import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";


const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const { resetPassword } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const success = await resetPassword(email, token, newPassword);
            if (success) {
                toast({
                    title: "Password reset successful",
                    description: "Your password has been successfully reset. You can now log in.",
                });
                navigate("/auth");
            } else {
                toast({
                    title: "Error resetting password",
                    description: "Failed to reset password. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            toast({
                title: "Error",
                description: "An error occurred while processing your request. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="flex flex-col items-center justify-center h-screen">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                        <CardDescription>Enter your new password.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium" htmlFor="email">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium" htmlFor="newPassword">New Password</label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
                {/* ✅ Added a link to the login page */}
                <div className="mt-4 text-center">
                    <Button
                        onClick={() => navigate('/auth')}
                        variant="link"
                        className="text-sm text-app-blue hover:text-app-blue-dark"
                    >
                        Go back to Login
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
