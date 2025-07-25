import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import * as api from "@/utils/api";
import { FcGoogle } from "react-icons/fc";

interface SignupFormProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SignupForm = ({ isLoading, setIsLoading }: SignupFormProps) => {
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [emailStatus, setEmailStatus] = useState<"idle" | "invalid" | "checking" | "exists" | "available">("idle");
    const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const email = signupForm.email.trim();
      if (!email) return setEmailStatus("idle");
      if (!isValidEmail(email)) return setEmailStatus("invalid");

      // Check from backend
      setEmailStatus("checking");
      fetch(`http://localhost:5227/api/Auth/check-email-exists?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          setEmailStatus(data.exists ? "exists" : "available");
        })
        .catch(() => {
          setEmailStatus("idle");
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [signupForm.email]);

  const handleGoogleLogin = () => {
    loginWithGoogle();
};


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Signup failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (signupForm.password.length < 6) {
      toast({
        title: "Signup failed",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (emailStatus !== "available") {
      toast({
        title: "Signup failed",
        description: emailStatus === "exists"
          ? "Email already registered."
          : "Please enter a valid email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.register(signupForm.fullName, signupForm.email, signupForm.password);

      toast({
        title: "Registration Successful",
        description: "Please check your email. Page will refresh in 5 seconds.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: (error as Error).message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-fullName">Full Name</label>
          <Input
            id="signup-fullName"
            required
            type="text"
            placeholder="Enter your full name"
            value={signupForm.fullName}
            onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-email">Email</label>
          <Input
            id="signup-email"
            required
            type="email"
            placeholder="Enter your email"
            value={signupForm.email}
            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
          />
          {emailStatus === "invalid" && <p className="text-xs text-red-500">❌ Invalid email format</p>}
          {emailStatus === "checking" && <p className="text-xs text-gray-500">⏳ Checking email...</p>}
          {emailStatus === "exists" && <p className="text-xs text-red-500">❌ Email already exists</p>}
          {emailStatus === "available" && <p className="text-xs text-green-600">✅ Email is available</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-password">Password</label>
          <Input
            id="signup-password"
            required
            type="password"
            placeholder="Choose a password"
            value={signupForm.password}
            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
          />
          <p className="text-xs text-gray-500">Must be at least 6 characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="signup-confirm">Confirm Password</label>
          <Input
            id="signup-confirm"
            required
            type="password"
            placeholder="Confirm your password"
            value={signupForm.confirmPassword}
            onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
          />
        </div>
      </CardContent>

      <CardFooter>
      <Button
        className="w-full bg-app-blue hover:bg-app-blue-dark"
        type="submit"
        disabled={isLoading || emailStatus !== "available"}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
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
    </form>
  );
};

export default SignupForm;
