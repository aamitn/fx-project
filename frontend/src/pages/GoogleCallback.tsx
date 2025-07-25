import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GoogleCallback = () => {
    const { handleGoogleCallback } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const processGoogleCallback = async () => {
            try {
                const success = await handleGoogleCallback();
                if (success) {
                    toast({
                        title: "Login successful",
                        description: "Welcome to FurnXpert!",
                    });
                  
                    navigate("/dashboard");
                } else {
                    toast({
                        title: "Login failed",
                        description: "Google authentication failed. Please try again.",
                        variant: "destructive",
                    });
                    navigate("/auth");
                }
            } catch (error) {
                toast({
                    title: "Login error",
                    description: "An error occurred during Google authentication.",
                    variant: "destructive",
                });
                navigate("/auth");
            }
        };

        processGoogleCallback();
    }, [handleGoogleCallback, navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing Google sign-in...</p>
            </div>
        </div>
    );
};

export default GoogleCallback;