import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState} from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldPassword: string;
  setOldPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
   updateProfile: (data: any) => Promise<boolean>;
   setModalOpen:  (open: boolean) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onOpenChange,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  updateProfile,
  setModalOpen
}) => {
    const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();
  const handleSubmit = async () => {
      setIsLoading(true);
    // Handle password change logic here
      if (newPassword && newPassword !== confirmPassword) {
          toast({
              title: "Error",
              description: "New passwords do not match.",
              variant: "destructive",
          });
           setIsLoading(false);
          return;
      }

      try {
          const updateData: any = {};
          if (newPassword && oldPassword) {
              updateData.oldPassword = oldPassword;
              updateData.newPassword = newPassword;
          }
          const success = await updateProfile(updateData);
          if (success) {
              toast({
                  title: "Success",
                  description: "Password updated successfully!",
              });
              onOpenChange(false);
          } else {
              toast({
                  title: "Error",
                  description: "Failed to update password.",
                  variant: "destructive",
              });
          }
      } catch (error) {
          console.error("Error updating password:", error);
          toast({
              title: "Error",
              description: "An error occurred while updating password.",
              variant: "destructive",
          });
      } finally {
          setIsLoading(false);
          setOldPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setModalOpen(false)

      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your old password and new password to update your password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="oldPassword" className="text-right">Old Password</label>
            <Input id="oldPassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="col-span-3" type="password" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="newPassword" className="text-right">New Password</label>
            <Input id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" type="password" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="confirmPassword" className="text-right">Confirm New Password</label>
            <Input id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="col-span-3" type="password" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Updating..." : "Change Password"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
