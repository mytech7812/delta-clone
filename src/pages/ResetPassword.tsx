import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success("Password updated successfully! Please sign in.");
      navigate("/");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
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
          {/* Header accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-extrabold text-sm">A</span>
              </div>
              <span className="font-bold text-lg tracking-tight">AnexmintMining</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Reset password</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your new password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">New password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl border-border focus-visible:ring-primary/30 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm new password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 rounded-xl border-border focus-visible:ring-primary/30 pr-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold text-sm gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Update Password <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              <button
                onClick={() => navigate("/")}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}