import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import InitialAvatar from "@/components/InitialAvatar";

import Select from "react-select";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

// Register English locale
countries.registerLocale(enLocale);

const ProfileDetails = () => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("PROFILE");
  const navigate = useNavigate();
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [country, setCountry] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const countryOptions = Object.entries(
    countries.getNames("en", { select: "official" })
  ).map(([code, name]) => ({ value: code, label: name }));

  useEffect(() => {
    if (user) {
      setOrganization(user.organization || "");
      setJobTitle(user.jobTitle || "");
      setCountry(user.country || "");
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "DASHBOARD") {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData: any = {
        organization,
        jobTitle,
        country,
      };

      if (user?.fullName) {
        updateData.fullName = user.fullName;
      }

      const success = await updateProfile(updateData);

      toast({
        title: success ? "Profile updated" : "Error updating profile",
        description: success
          ? "Your profile has been successfully updated."
          : "Failed to update your profile. Please try again.",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while processing your request. Please try again later.",
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
        tabs={["DASHBOARD"]}
        username={user?.fullName || "Guest"}
        onLogout={handleLogout}
      />

      <div className="flex flex-col items-center justify-center space-y-4 py-6">
        <InitialAvatar name={user?.fullName || "Guest"} size={80} />
        <p className="text-lg font-medium text-gray-100">
          {user?.fullName}
        </p>

        <Card className="w-96">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile details and change your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="id">ID</label>
              <Input id="id" type="text" value={user?.id} disabled />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" value={user?.email} disabled />
            </div>

            <div className="flex items-center space-x-2">
              <Button asChild>
                <Link to="/2fa-management" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage 2FA
                </Link>
              </Button>
              <Button type="button" onClick={() => setModalOpen(true)}>
                Change Password
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium" htmlFor="fullName">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={user?.fullName || ""}
                  onChange={(e) => {
                    if (user) {
                      updateProfile({ ...user, fullName: e.target.value });
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="organization">
                  Organization
                </label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Enter your organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="jobTitle">
                  Job Title
                </label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="Enter your job title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="country">
                  Country
                </label>
                <Select
                  inputId="country"
                  options={countryOptions}
                  value={countryOptions.find((opt) => opt.value === country)}
                  onChange={(option) => setCountry(option?.value || "")}
                  placeholder="Select your country"
                  isClearable
                />
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <ChangePasswordModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          oldPassword={oldPassword}
          setOldPassword={setOldPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          updateProfile={updateProfile}
          setModalOpen={setModalOpen}
        />
      </div>

      <Footer />
    </>
  );
};

export default ProfileDetails;
