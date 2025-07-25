import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const { forgotPassword } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const success = await forgotPassword(email);
            if (success) {
                toast({
                    title: "Forgot password request sent",
                    description: "If an account with that email exists, you will receive an email with instructions to reset your password.",
                });
                navigate("/auth");
            } else {
                toast({
                    title: "Error requesting password reset",
                    description: "Failed to request password reset. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error requesting password reset:", error);
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
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>Enter your email address to reset your password.</CardDescription>
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
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Reset Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
