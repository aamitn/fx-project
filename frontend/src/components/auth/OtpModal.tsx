import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface OtpModalProps {
  userId: string | null;
  onClose: () => void;
  email: string;
  toast: any; // Assuming 'toast' is the object returned by useToast()
}

const OtpModalComponent: React.FC<OtpModalProps> = ({ userId, onClose, email, toast }) => {
  const [otp1, setOtp1] = useState("");
  const [otp2, setOtp2] = useState("");
  const [otp3, setOtp3] = useState("");
  const [otp4, setOtp4] = useState("");
  const [otp5, setOtp5] = useState("");
  const [otp6, setOtp6] = useState("");
  const [error, setError] = useState<string | null>(null); // Explicitly type error state
  const { verify2FA, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const input4Ref = useRef<HTMLInputElement>(null);
  const input5Ref = useRef<HTMLInputElement>(null);
  const input6Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      input1Ref.current?.focus();
      // Clear OTP fields and error when modal opens/userId changes
      setOtp1("");
      setOtp2("");
      setOtp3("");
      setOtp4("");
      setOtp5("");
      setOtp6("");
      setError(null);
    }
  }, [userId]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

    // Basic validation: Ensure all digits are entered
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      setError('Please enter a complete 6-digit OTP.');
      return;
    }

    try {
      // Clear previous error before attempting verification
      setError(null);
      const success = await verify2FA(userId || '', otpValue);
      if (success) {
        onClose();
        navigate("/dashboard");
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
      } else {
        // If verify2FA returns false, it means the OTP was invalid
        setError('Invalid OTP. Please try again.');
        toast({
          title: "Verification Failed",
          description: "The OTP you entered is incorrect.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // Handle network errors or other exceptions from verify2FA
      setError(err.message || 'An unexpected error occurred during verification.');
      toast({
        title: "Error",
        description: err.message || "An error occurred during verification.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, setOtp: (value: string) => void, nextRef: React.RefObject<HTMLInputElement> | null, prevRef: React.RefObject<HTMLInputElement> | null) => {
    const value = e.target.value;
    const isValidInput = /^\d*$/.test(value); // Allow only digits

    if (!isValidInput) {
      return;
    }

    // Ensure only one character is processed
    const singleChar = value.slice(0, 1);
    setOtp(singleChar); // Update the state for the current input

    // Move focus to the next input if a character was entered and it's not the last field
    if (singleChar && nextRef && nextRef.current) {
      nextRef.current.focus();
    } else if (!singleChar && prevRef && prevRef.current) {
      // Move focus to the previous input if the current input was cleared by backspace
      prevRef.current.focus();
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, prevRef: React.RefObject<HTMLInputElement> | null) => {
    // If backspace is pressed and the current input is empty, move focus to the previous input
    if (e.key === 'Backspace' && e.target instanceof HTMLInputElement && !e.target.value && prevRef && prevRef.current) {
      e.preventDefault(); // Prevent default backspace behavior (e.g., navigating back in browser history)
      prevRef.current.focus();
    }
  }, []);

  const handleResendOtp = async () => {
    try {
      // Clear any previous errors before resending
      setError(null);
      // Call loginWithOtp and capture the response
      const response = await loginWithOtp(email);

      // Assuming the backend's login-email-otp returns { message: "..." }
      const message = response?.message || "A one-time password has been sent to your email address.";

      toast({
        title: "OTP Resent",
        description: message, // Use the message from the API response
      });
      // Optionally, clear the OTP fields after resending
      setOtp1("");
      setOtp2("");
      setOtp3("");
      setOtp4("");
      setOtp5("");
      setOtp6("");
      input1Ref.current?.focus(); // Focus the first input again
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent default paste behavior
  
    const pastedData = e.clipboardData.getData('Text');
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6); // Extract first 6 digits
  
    if (digitsOnly.length > 0) {
      if (digitsOnly[0]) setOtp1(digitsOnly[0]);
      if (digitsOnly[1]) setOtp2(digitsOnly[1]);
      if (digitsOnly[2]) setOtp3(digitsOnly[2]);
      if (digitsOnly[3]) setOtp4(digitsOnly[3]);
      if (digitsOnly[4]) setOtp5(digitsOnly[4]);
      if (digitsOnly[5]) setOtp6(digitsOnly[5]);
  
      // Move focus to next empty or last input
      const refs = [input1Ref, input2Ref, input3Ref, input4Ref, input5Ref, input6Ref];
      for (let i = 0; i < digitsOnly.length; i++) {
        if (i === digitsOnly.length - 1) {
          refs[i].current?.focus();
          break;
        }
      }
    }
  }, []);
  
  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>Enter OTP</DialogHeader>
        <form onSubmit={handleVerifyOtp}>
          <div className="flex justify-center gap-2 mb-4">
            <input
              type="text"
              maxLength={1}
              value={otp1}
              onChange={(e) => handleInputChange(e, setOtp1, input2Ref, null)}
              onKeyDown={(e) => handleKeyDown(e, null)}
              onPaste={handlePaste}
              ref={input1Ref}
              className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-label="OTP digit 1"
            />
            <input
              type="text"
              maxLength={1}
              value={otp2}
              onChange={(e) => handleInputChange(e, setOtp2, input3Ref, input1Ref)}
              onKeyDown={(e) => handleKeyDown(e, input1Ref)}
              onPaste={handlePaste}
              ref={input2Ref}
              className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-label="OTP digit 2"
            />
            <input
              type="text"
              maxLength={1}
              value={otp3}
              onChange={(e) => handleInputChange(e, setOtp3, input4Ref, input2Ref)}
              onKeyDown={(e) => handleKeyDown(e, input2Ref)}
              onPaste={handlePaste}
              ref={input3Ref}
              className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-label="OTP digit 3"
            />
            <input
              type="text"
              maxLength={1}
              value={otp4}
              onChange={(e) => handleInputChange(e, setOtp4, input5Ref, input3Ref)}
              onKeyDown={(e) => handleKeyDown(e, input3Ref)}
              onPaste={handlePaste}
              ref={input4Ref}
              className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-label="OTP digit 4"
            />
            <input
              type="text"
              maxLength={1}
              value={otp5}
              onChange={(e) => handleInputChange(e, setOtp5, input6Ref, input4Ref)}
              onKeyDown={(e) => handleKeyDown(e, input4Ref)}
              onPaste={handlePaste}
              ref={input5Ref}
              className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-label="OTP digit 5"
            />
            <input
              type="text"
              maxLength={1}
              value={otp6}
              onChange={(e) => handleInputChange(e, setOtp6, null, input5Ref)}
              onKeyDown={(e) => handleKeyDown(e, input5Ref)}
              onPaste={handlePaste}
              ref={input6Ref}
              className="w-12 h-12 border border-gray-300 rounded text-center text-xl font-bold focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
              aria-label="OTP digit 6"
            />
          </div>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Verify OTP
            </Button>
            <Button
              type='button'
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleResendOtp}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Resend OTP
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OtpModalComponent;
