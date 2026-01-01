"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Crown } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

type UserType = "admin" | "user" | null;

const USER_OPTIONS = {
  admin: {
    email: "admin@kvtjewellers.com",
    name: "Admin User",
    icon: Crown,
    color: "from-gold-500 to-gold-600",
    borderColor: "border-gold-300",
    bgColor: "bg-gold-50/50",
  },
  user: {
    email: "staff@kvtjewellers.com",
    name: "Staff User",
    icon: User,
    color: "from-brand-500 to-brand-600",
    borderColor: "border-brand-300",
    bgColor: "bg-brand-50/50",
  },
};

export default function StaffLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<UserType>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUserSelect = async (userType: UserType) => {
    if (!userType) return;
    
    setSelectedUser(userType);
    setError("");
    setLoading(true);

    const email = USER_OPTIONS[userType].email;
    const password = "password"; // Demo password

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect to dashboard or the page they were trying to access
      const from = searchParams.get("from") || "/staff/dashboard";
      router.push(from);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-background dark:bg-background dark:from-background dark:via-background dark:to-background px-4 py-12">
      <Meteors number={20} />
      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-4xl font-bold text-brand-700"
            >
              Staff Portal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-muted-foreground"
            >
              Select an account to continue
            </motion.p>
          </div>

          {/* User Selection Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {(Object.keys(USER_OPTIONS) as Array<keyof typeof USER_OPTIONS>).map((userType, index) => {
              const user = USER_OPTIONS[userType];
              const Icon = user.icon;
              const isSelected = selectedUser === userType;
              const isLoggingIn = loading && selectedUser === userType;

              return (
                <motion.div
                  key={userType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  <Card
                    className={`cursor-pointer border-2 transition-all ${
                      isSelected
                        ? `${user.borderColor} shadow-xl ${user.bgColor}`
                        : loading
                        ? "border-brand-200/50 opacity-50 cursor-not-allowed"
                        : "border-brand-200/50 hover:border-brand-300 hover:shadow-lg"
                    }`}
                    onClick={() => !loading && handleUserSelect(userType)}
                  >
                    <CardHeader className="text-center">
                      <motion.div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${user.color} ${
                          isSelected ? "ring-4 ring-offset-2 ring-offset-white" : ""
                        }`}
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isLoggingIn ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Shield className="h-8 w-8 text-white" />
                          </motion.div>
                        ) : (
                          <Icon className="h-8 w-8 text-white" />
                        )}
                      </motion.div>
                      <CardTitle className="font-serif text-2xl font-bold text-brand-700">
                        {user.name}
                      </CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
                      {isLoggingIn && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3"
                        >
                          <Badge className="bg-brand-500 text-white">Logging in...</Badge>
                        </motion.div>
                      )}
                      {isSelected && !isLoggingIn && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3"
                        >
                          <Badge className="bg-gold-500 text-white">Selected</Badge>
                        </motion.div>
                      )}
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Demo Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border border-brand-200/50 bg-brand-50/50 p-4 text-xs text-center text-muted-foreground"
          >
            <strong className="text-brand-700">Demo Mode:</strong> Click any card to automatically log in
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

