"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getPublicReturnPath } from "@/lib/utils/login-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = getPublicReturnPath(searchParams.get("redirect"));

  const handleBack = useCallback(() => {
    router.push(redirect);
  }, [router, redirect]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Copy .env.local.example to .env.local");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen texture-wood flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-black/30 pointer-events-none" />

      <button
        type="button"
        onClick={handleBack}
        className="absolute top-6 left-4 sm:left-6 z-10 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm text-cream-paper/80 transition-colors hover:bg-black/20 hover:text-cream-paper"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Continue browsing
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md texture-paper rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Heart className="h-8 w-8 text-antique-gold mx-auto mb-3" />
          <h1 className="font-heading text-3xl text-warm-brown">Our Story Board</h1>
          <p className="font-accent text-lg text-muted-green mt-2">
            Sign in to add memories
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-sm text-charcoal/60 mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="font-body text-sm text-charcoal/60 mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-warm-brown/20 bg-cream-paper px-3 py-2.5 font-body focus:outline-none focus:ring-2 focus:ring-antique-gold/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-body">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-center mt-6 font-body text-sm text-charcoal/50">
          <button
            type="button"
            onClick={handleBack}
            className="text-warm-brown hover:underline"
          >
            Back to reading
          </button>
        </p>

        <p className="text-center mt-4 font-body text-xs text-charcoal/40">
          Anyone can read the books. Only Jo and Ru can sign in to post.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
