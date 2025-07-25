import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import QRCode from 'react-qr-code';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const TwoFAManagement = () => {
    const { user, setupAuthenticator, logout, enableAuthenticator, disable2FA, sendEmailOtp, is2FAEnabled } = useAuth();
    const { toast } = useToast();
    const [setupData, setSetupData] = useState<any>(null);
    const [authenticatorCode, setAuthenticatorCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("2FA");
    const navigate = useNavigate();

     const handleTabChange = (tab: string) => {
        setActiveTab(tab);
         if (tab === "DASHBOARD") {
            navigate("/dashboard");
        } 
    };

    const handleLogout = () => {
        console.log("handleLogout function called in Dashboard");
        logout();
        navigate("/");
    };

    useEffect(() => {
        const fetchSetupData = async () => {
            setIsLoading(true);
            try {
                const data = await setupAuthenticator();
                setSetupData(data);
            } catch (error) {
                console.error("Error fetching setup data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load 2FA setup data.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSetupData();
    }, [setupAuthenticator, toast]);

    const handleEnableAuthenticator = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const success = await enableAuthenticator(authenticatorCode);
            if (success) {
                toast({
                    title: "2FA Enabled",
                    description: "Authenticator app enabled successfully.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to enable authenticator app. Invalid code.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error enabling authenticator:", error);
            toast({
                title: "Error",
                description: "Failed to enable authenticator app. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const success = await disable2FA(disablePassword);
            if (success) {
                toast({
                    title: "2FA Disabled",
                    description: "2FA has been disabled.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to disable 2FA. Invalid password.",
                });
            }
        } catch (error) {
            console.error("Error disabling 2FA:", error);
            toast({
                title: "Error",
                description: "Failed to disable 2FA. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendEmailOtp = async () => {
        setIsLoading(true);
        try {
            const success = await sendEmailOtp();
            if (success) {
                toast({
                    title: "Email OTP Sent",
                    description: "A one-time password has been sent to your email address.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to send OTP. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error sending email OTP:", error);
            toast({
                title: "Error",
                description: "Failed to send OTP. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
         <Header 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            tabs={["DASHBOARD"]} username={user?.fullName || "Guest"} 
            lastSaved="Apr 28, 2:15 PM"
            onLogout={handleLogout}
            />
        <div className="flex flex-col items-center justify-center h-screen">
            <Card className="w-96">
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Manage your 2FA settings here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {setupData ? (
                        <div className="space-y-2">
                            <p>Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy):</p>
                            <QRCode value={setupData.authenticatorUri} size={256} level="H" />
                            <p>Or, enter this key manually:</p>
                            <Input type="text" value={setupData.unformattedKey} readOnly />
                            <Input
                                type="text"
                                placeholder="Enter authenticator code"
                                value={authenticatorCode}
                                onChange={(e) => setAuthenticatorCode(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleEnableAuthenticator} disabled={isLoading || is2FAEnabled}>
                                {isLoading ? "Enabling..." : "Enable Authenticator"}
                            </Button>
                        </div>
                    ) : (
                        <p>Loading 2FA setup data...</p>
                    )}

                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter your password to disable 2FA"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleDisable2FA} disabled={isLoading || !is2FAEnabled}>
                            {isLoading ? "Disabling..." : "Disable 2FA"}
                        </Button>
                    </div>

                    <Button className="w-full" onClick={handleSendEmailOtp} disabled={isLoading}>
                        Send Email OTP
                    </Button>
                </CardContent>
            </Card>
        </div>
          <Footer />
        </>
    );
};

export default TwoFAManagement;
