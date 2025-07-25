import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const ConfirmEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<string>('Verifying...');
    const { confirmEmail } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [seconds, setSeconds] = useState(5); // Timer starts at 5 seconds
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        const email = searchParams.get('email');
        let token = searchParams.get('token');

        if (token) {
            token = token.replace(/%2F/g, '/').replace(/%3D/g, '=');
        }

        if (email && token) {
            const confirm = async () => {
                 console.log("Confirming email with:", {email, token})
                try {
                    const success = await confirmEmail(email, token);
                    if (success) {
                        setStatus('Email confirmed!');
                        setIsConfirmed(true);
                        toast({
                            title: 'Email confirmed',
                            description: 'Your email has been successfully confirmed. You can now log in.',
                        });

                        // Start the timer only upon successful confirmation
                        intervalId = setInterval(() => {
                            setSeconds((prevSeconds) => prevSeconds - 1);
                        }, 1000);

                    } else {
                        setStatus('Email confirmation failed.');
                        toast({
                            title: 'Email confirmation failed',
                            description: 'There was an error confirming your email. Please try again or contact support.',
                            variant: 'destructive',
                        });
                    }
                } catch (error) {
                    console.error('Email confirmation error:', error);
                    setStatus('Email confirmation failed.');
                    toast({
                        title: 'Email confirmation error',
                        description: 'An unexpected error occurred. Please try again later.',
                        variant: 'destructive',
                    });
                }
            };
            confirm();
        } else {
            setStatus('Invalid confirmation link.');
            toast({
                title: 'Invalid confirmation link',
                description: 'The confirmation link is invalid. Please check the link or request a new one.',
                variant: 'destructive',
            });
        }

        // Clean-up function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [confirmEmail, navigate, searchParams, toast]);

    useEffect(() => {
        if (seconds === 0 && isConfirmed) {
            navigate('/auth');
        }
    }, [seconds, navigate, isConfirmed]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-semibold mb-4">{status}</h1>
            {isConfirmed && seconds > 0 ? (
                <p>Redirecting to login in {seconds} seconds...</p>
            ) : status === 'Invalid confirmation link.' && (
                <Button onClick={() => navigate('/register')}>Back to Register</Button>
            )}
        </div>
    );
};

export default ConfirmEmail;