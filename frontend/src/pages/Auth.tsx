import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, KeyRound } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">Fx Account</CardTitle>
          <CardDescription className="text-center">
            Log in or sign up to access the dashboard
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm isLoading={isLoading} setIsLoading={setIsLoading} />
          </TabsContent>
        </Tabs>

        {/* ✅ Updated to flex-row and space-x-4 for side-by-side display */}
        <div className="flex flex-row items-center justify-center space-x-4 mb-4 text-sm text-gray-500">
          <Link to="/resend-confirmation" className="hover:underline flex items-center gap-1">
            <Mail className="h-4 w-4" /> Resend confirmation email
          </Link>
          <Link to="/forgot-password" className="hover:underline flex items-center gap-1">
            <KeyRound className="h-4 w-4" /> Forgot Password
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
};

export default Auth;