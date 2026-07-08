import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, KeyRound, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const showLinkError = (message: string) => {
      if (!isMounted) return;
      setError(message);
      setLinkError(true);
      setIsRecovery(false);
    };

    const allowPasswordReset = () => {
      if (!isMounted) return;
      setError("");
      setLinkError(false);
      setIsRecovery(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        allowPasswordReset();
      }

      // Code-based recovery links can establish a session before PASSWORD_RECOVERY fires.
      if (event === "SIGNED_IN" && session && window.location.pathname === "/reset-password") {
        allowPasswordReset();
      }
    });

    const verifyResetLink = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryParams = new URLSearchParams(window.location.search);
      const errorCode = hashParams.get("error_code") || queryParams.get("error_code") || hashParams.get("error") || queryParams.get("error");

      if (errorCode) {
      if (errorCode === "otp_expired") {
          showLinkError("রিসেট লিংক এক্সপায়ার হয়ে গেছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      } else {
          showLinkError("রিসেট লিংক অবৈধ। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
        return;
      }

      const isRecoveryLink = hashParams.get("type") === "recovery" || queryParams.get("type") === "recovery";
      const hasTokens = hashParams.has("access_token") || hashParams.has("refresh_token");
      const hasCode = queryParams.has("code");

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          showLinkError("রিসেট লিংক অবৈধ বা এক্সপায়ার হয়ে গেছে।");
          return;
        }

        window.history.replaceState({}, document.title, "/reset-password");
        allowPasswordReset();
        return;
      }

      if (isRecoveryLink || hasTokens) {
        allowPasswordReset();
        return;
      }

      // Check if already authenticated after the link was processed before the listener registered.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        allowPasswordReset();
        return;
      }
    };

    verifyResetLink();

    // Timeout fallback: if no recovery detected after 5s, show error
    const timeout = setTimeout(() => {
      setIsRecovery((prev) => {
        if (!prev) {
          showLinkError("রিসেট লিংক অবৈধ বা এক্সপায়ার হয়ে গেছে।");
        }
        return prev;
      });
    }, 5000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate("/admin/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          {linkError ? (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">লিংক এক্সপায়ার্ড</h1>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => navigate("/admin/login")}
                className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground"
              >
                লগইনে ফিরে যান
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Verifying reset link...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Password Reset!</h1>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
