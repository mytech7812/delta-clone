import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ShieldX, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Suspended() {
  const navigate = useNavigate();

  useEffect(() => {
    // If user somehow navigates here but isn't suspended, redirect
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('status')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.status !== 'suspended') {
        navigate('/dashboard');
      }
    };
    
    checkStatus();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="w-full max-w-md"
      >
        <div className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header accent bar - Red */}
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <ShieldX className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Account Suspended
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Your account has been suspended. Please contact support for more information.
            </p>

            {/* Contact Support Box */}
            <div className="bg-secondary/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>Contact support:</span>
                <a 
                  href="mailto:annexmintmining@gmail.com" 
                  className="text-primary font-medium hover:underline"
                >
                  anexmintmining@gmail.com
                </a>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              className="w-full h-11 rounded-xl font-semibold"
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}