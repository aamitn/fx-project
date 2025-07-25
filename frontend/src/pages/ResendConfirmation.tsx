import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AuthLayout from "@/components/auth/AuthLayout";
import { Link } from "react-router-dom";

const ResendConfirmation = () => {
    const [email, setEmail] = useState("");
    const { resendConfirmation } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const success = await resendConfirmation(email);
            if (success) {
                toast({
                    title: "Confirmation email resent",
                    description: "A new confirmation email has been sent to your email address.",
                });
                navigate("/auth");
            } else {
                toast({
                    title: "Error resending confirmation email",
                    description: "Failed to resend confirmation email. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error resending confirmation email:", error);
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
                    <CardTitle>Resend Confirmation Email</CardTitle>
                    <CardDescription>Enter your email address to resend the confirmation email.</CardDescription>
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
                            {isLoading ? "Sending..." : "Resend Confirmation Email"}
                        </Button>
                         <div className="text-center mt-4">
                            <Link to="/auth" className="text-blue-500 hover:underline">Go back to login</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
      </AuthLayout>
    );
};

export default ResendConfirmation;
