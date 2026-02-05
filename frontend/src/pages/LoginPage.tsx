import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Loader2, Package } from "lucide-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl mx-auto w-full rounded-2xl p-8 border border-white/10 shadow-2xl shadow-blue-500/10">
          {/* Logo and Title */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg shadow-blue-500/50">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white">
            Transport Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to manage your Transport operations
          </p>

          <form className="mt-8" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <LabelInputContainer>
                <Label htmlFor="email" className="text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  placeholder="manager@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </LabelInputContainer>
            </div>

            <button
              className="group/btn relative mt-6 block h-10 w-full rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 font-medium text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span>Sign in →</span>
              )}
              <BottomGradient />
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-xs font-semibold text-blue-400 mb-3">
                Demo Credentials:
              </p>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                  <span className="font-medium text-gray-200">Manager:</span>
                  <span className="text-gray-400">manager@example.com</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                  <span className="font-medium text-gray-200">
                    Stock Manager:
                  </span>
                  <span className="text-gray-400">stockmanager@example.com</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                  <span className="font-medium text-gray-200">Production:</span>
                  <span className="text-gray-400">
                    production@example.com
                  </span>
                </div>
                <p className="text-center mt-2 text-gray-400">
                  Passwords:{" "}
                  <span className="font-mono font-semibold text-gray-200">
                    securePassword123
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
