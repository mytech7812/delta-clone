import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Check if already verified
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.confirmed_at) {
        navigate('/dashboard');
      }
    };
    checkVerification();
  }, [navigate]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      toast.success('Verification email resent! Check your inbox.');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) clearInterval(timer);
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="w-full max-w-sm"
      >
        <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400" />

          <div className="p-6">
            {/* Logo */}
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary via-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">Check your email</h2>
              <p className="text-xs text-muted-foreground mt-1">
                We sent a verification link to {email || 'your email'}
              </p>
            </div>

            {/* Resend Button */}
            {countdown > 0 ? (
              <Button
                disabled
                className="w-full h-10 rounded-xl font-semibold text-sm"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Resend in {countdown}s
              </Button>
            ) : (
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full h-10 rounded-xl font-semibold text-sm gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Resend email
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Back to Sign In */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              <button
                onClick={() => navigate("/")}
                className="text-primary font-semibold hover:underline"
              >
                ← Back to Sign In
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}