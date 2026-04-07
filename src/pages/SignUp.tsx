import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const perks = [
  "Trade 50+ crypto futures & options",
  "Earn up to 12.5% APY on staking",
  "Instant swaps with best rates",
  "Industry-lowest fees, no hidden costs",
  "24/7 customer support",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [agreed, setAgreed] = useState(false);
  const [passwordError, setPasswordError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (form.password !== form.confirmPassword) {
    setPasswordError("Passwords do not match");
    return;
  }

  setIsLoading(true);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          full_name: `${form.firstName} ${form.lastName}`,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;

    if (data.user) {
      // Check if email confirmation is required
      if (!data.user.confirmed_at) {
        toast.success("Verification email sent! Please check your inbox to confirm your account.");
        // Redirect to a "check your email" page or show a message
        navigate("/verify-email", { state: { email: form.email } });
      } else {
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    }
  } catch (error: any) {
    console.error("Sign up error:", error);
    toast.error(error.message || "Failed to create account. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign up error:", error);
      toast.error(error.message || "Failed to sign up with Google");
      setIsLoading(false);
    }
  };

  const passwordStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-red-400", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[48%] xl:w-[44%] relative bg-foreground flex-col justify-between p-12 overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-extrabold text-sm">A</span>
          </div>
          <span className="text-background font-bold text-lg tracking-tight">
            Anexmint<span className="text-primary font-medium text-sm ml-0.5">Mining</span>
          </span>
        </div>

        {/* Middle: Headline + perks */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 space-y-8"
        >
          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-bold text-background leading-[1.1] tracking-tight">
              Trade smarter.<br />
              <span className="text-primary">Earn more.</span>
            </h1>
            <p className="text-background/60 text-base leading-relaxed max-w-xs">
              Join over 2 million traders on the most advanced crypto platform.
            </p>
          </motion.div>

          <motion.ul variants={containerVariants} className="space-y-3.5">
            {perks.map((perk) => (
              <motion.li key={perk} variants={itemVariants} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-background/80 text-sm">{perk}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Bottom: Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="relative z-10"
        >
          <div className="bg-background/10 backdrop-blur border border-background/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: c }}>
                    {["J", "M", "S", "A"][i]}
                  </div>
                ))}
              </div>
              <div className="flex text-yellow-400 text-xs">★★★★★</div>
            </div>
            <p className="text-background/70 text-xs leading-relaxed">
              "Best trading platform I've used. The fees are unbeatable."
            </p>
            <p className="text-background/40 text-xs mt-1">— Sarah K., Pro Trader</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-xs">A</span>
            </div>
            <span className="font-bold text-base tracking-tight">AnexmintMining</span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Create your account</h2>
            <p className="text-muted-foreground text-sm mt-1">Start trading in under 60 seconds. No credit card needed.</p>
          </motion.div>

          {/* Google */}
          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors mb-6"
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or register with email</span>
            <div className="flex-1 h-px bg-border" />
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div variants={containerVariants} className="space-y-4">
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">First name</label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="h-11 rounded-xl border-border focus-visible:ring-primary/30"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Last name</label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="h-11 rounded-xl border-border focus-visible:ring-primary/30"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11 rounded-xl border-border focus-visible:ring-primary/30"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        if (form.confirmPassword && e.target.value !== form.confirmPassword) {
                          setPasswordError("Passwords do not match");
                        } else {
                          setPasswordError("");
                        }
                      }}
                      className="h-11 rounded-xl border-border focus-visible:ring-primary/30 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {form.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1"
                    >
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              passwordStrength >= level ? strengthColors[passwordStrength] : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strengthLabels[passwordStrength]} password</p>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirm password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm({ ...form, confirmPassword: e.target.value });
                        if (form.password && e.target.value !== form.password) {
                          setPasswordError("Passwords do not match");
                        } else {
                          setPasswordError("");
                        }
                      }}
                      className={`h-11 rounded-xl focus-visible:ring-primary/30 pr-10 ${passwordError ? 'border-red-400' : 'border-border'}`}
                      required
                      minLength={8}
                    />
                  </div>
                  {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-start gap-3 pt-1">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 cursor-pointer transition-colors flex items-center justify-center ${
                    agreed ? "bg-primary border-primary" : "border-border hover:border-primary"
                  }`}
                >
                  {agreed && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl font-semibold text-sm gap-2"
                    disabled={isLoading || !agreed || !!passwordError || form.password !== form.confirmPassword}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Create Account <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/", { state: { openSignIn: true } })}
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}