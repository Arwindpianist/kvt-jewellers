"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Lock, User, Phone, MapPin, CheckCircle2, ArrowRight, ArrowLeft, Shield, CreditCard, Inbox } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  
  // Step 2: Security
  password: string;
  confirmPassword: string;
  
  // Step 3: Contact & Identity
  phone: string;
  country: string;
  idType: string;
  idNumber: string;
  
  // Step 4: Address (Optional)
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

const COUNTRIES = [
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
];

const MALAYSIAN_STATES = [
  "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca",
  "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Putrajaya",
  "Sabah", "Sarawak", "Selangor", "Terengganu"
];

export function RegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "MY",
    idType: "IC",
    idNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const validateStep = (step: number): boolean => {
    setError("");
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError("Full name is required");
          return false;
        }
        if (formData.name.trim().length < 2) {
          setError("Name must be at least 2 characters");
          return false;
        }
        if (!formData.email.trim()) {
          setError("Email is required");
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        return true;
        
      case 2:
        if (!formData.password) {
          setError("Password is required");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        // Check for at least one number and one letter
        const hasNumber = /\d/.test(formData.password);
        const hasLetter = /[a-zA-Z]/.test(formData.password);
        if (!hasNumber || !hasLetter) {
          setError("Password must contain at least one letter and one number");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;
        
      case 3:
        if (!formData.phone.trim()) {
          setError("Phone number is required for order notifications");
          return false;
        }
        // Basic phone validation (allows international format)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
          setError("Please enter a valid phone number");
          return false;
        }
        if (formData.phone.replace(/\D/g, "").length < 8) {
          setError("Phone number is too short");
          return false;
        }
        if (!formData.country) {
          setError("Please select your country");
          return false;
        }
        if (!formData.idType) {
          setError("Please select your ID type");
          return false;
        }
        if (!formData.idNumber.trim()) {
          setError(`${formData.idType === "IC" ? "IC number" : "Passport number"} is required`);
          return false;
        }
        // Validate IC format (Malaysian IC: YYMMDD-PB-G###G format or 12 digits)
        if (formData.idType === "IC" && formData.country === "MY") {
          const icNumber = formData.idNumber.replace(/[-\s]/g, "");
          if (!/^\d{12}$/.test(icNumber)) {
            setError("Malaysian IC must be 12 digits (format: YYMMDD-PB-G###G)");
            return false;
          }
        }
        // Basic validation for passport (alphanumeric, 6-12 characters)
        if (formData.idType === "Passport") {
          const passportNumber = formData.idNumber.replace(/[-\s]/g, "").toUpperCase();
          if (!/^[A-Z0-9]{6,12}$/.test(passportNumber)) {
            setError("Passport number must be 6-12 alphanumeric characters");
            return false;
          }
        }
        return true;
        
      case 4:
        // Address is optional, but if any field is filled, validate
        const hasAddress = formData.addressLine1 || formData.city || formData.postalCode;
        if (hasAddress) {
          if (!formData.addressLine1.trim()) {
            setError("Address line 1 is required if providing address");
            return false;
          }
          if (!formData.city.trim()) {
            setError("City is required if providing address");
            return false;
          }
        }
        return true;
        
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim(),
          country: formData.country,
          idType: formData.idType,
          idNumber: formData.idNumber.trim().toUpperCase(),
          addressLine1: formData.addressLine1.trim() || null,
          addressLine2: formData.addressLine2.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          postalCode: formData.postalCode.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show user-friendly error messages
        let errorMessage = data.error || "Registration failed";
        
        // Handle specific error cases
        if (errorMessage.includes("profile not found") || errorMessage.includes("profile setup failed")) {
          // This shouldn't happen anymore with our retry logic, but if it does, show a helpful message
          errorMessage = "Your account was created successfully! Please try logging in now.";
          // Auto-redirect to login after a delay
          setTimeout(() => {
            router.push("/login?registered=true");
          }, 3000);
        } else if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (errorMessage.includes("invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (errorMessage.includes("password")) {
          errorMessage = errorMessage; // Keep password-specific errors as-is
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Check if email verification is required
      if (data.requiresEmailConfirmation) {
        setRequiresEmailVerification(true);
        setRegisteredEmail(formData.email.trim().toLowerCase());
        setCurrentStep(5);
      } else {
        // No email verification needed - go directly to account
        router.push("/account");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/\d/.test(password)) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { strength: 33, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength: 66, label: "Medium", color: "bg-yellow-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-card-elevated">
          <CardHeader className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-3xl font-bold">Create Your Account</CardTitle>
                <CardDescription className="mt-2">
                  Join KVT Jewellers to shop premium gold and silver products
                </CardDescription>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
                <span className="font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {currentStep === 5 ? (
                // Email Verification Step
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Inbox className="h-20 w-20 text-brand-600 mx-auto mb-6" />
                  </motion.div>
                  <h2 className="font-serif text-3xl font-bold mb-2">Check Your Email</h2>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    We've sent a verification email to <strong className="text-foreground">{registeredEmail}</strong>
                  </p>
                  <p className="text-muted-foreground mb-8 max-w-md text-sm">
                    Please click the confirmation link in the email to verify your account. Once verified, you'll be able to sign in and start shopping.
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-md w-full">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong className="text-foreground">Didn't receive the email?</strong>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 text-left">
                      <li>• Check your spam/junk folder</li>
                      <li>• Make sure you entered the correct email address</li>
                      <li>• Wait a few minutes - emails can take up to 5 minutes</li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        router.push("/login");
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Go to Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("/");
                      }}
                      className="gold-gradient-button"
                      size="lg"
                    >
                      Back to Home
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentStep === totalSteps) {
                      handleSubmit();
                    } else {
                      handleNext();
                    }
                  }}
                  className="space-y-6"
                >
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                          <User className="h-5 w-5 text-brand-600" />
                          Basic Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Let's start with your basic details
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => updateFormData("name", e.target.value)}
                            required
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            required
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          We'll use this to send order confirmations and updates
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Security */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-brand-600" />
                          Create Secure Password
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Choose a strong password to protect your account
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="At least 8 characters"
                            value={formData.password}
                            onChange={(e) => updateFormData("password", e.target.value)}
                            required
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                        {formData.password && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Password strength</span>
                              <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <Progress value={passwordStrength.strength} className="h-1.5" />
                          </div>
                        )}
                        <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                          <li className={formData.password.length >= 8 ? "text-green-600" : ""}>
                            • At least 8 characters
                          </li>
                          <li className={/\d/.test(formData.password) && /[a-zA-Z]/.test(formData.password) ? "text-green-600" : ""}>
                            • Contains letters and numbers
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                            required
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Passwords match
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact & Identity Information */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                          <Phone className="h-5 w-5 text-brand-600" />
                          Contact & Identity Information
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          We need your contact details and identity verification for order processing
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => {
                            updateFormData("country", value);
                            // Auto-set ID type based on country
                            if (value === "MY") {
                              updateFormData("idType", "IC");
                            } else {
                              updateFormData("idType", "Passport");
                            }
                          }}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <span className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder={formData.country === "MY" ? "+60 12-345 6789" : "+[country code] [number]"}
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            required
                            className="pl-10"
                            disabled={loading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Include country code (e.g., +60 for Malaysia, +65 for Singapore)
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="idType">ID Type *</Label>
                          <Select
                            value={formData.idType}
                            onValueChange={(value) => updateFormData("idType", value)}
                            disabled={loading || formData.country === "MY"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IC">
                                <span className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span>IC (Identity Card)</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="Passport">
                                <span className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span>Passport</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="Other">
                                <span className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span>Other</span>
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {formData.country === "MY" && (
                            <p className="text-xs text-muted-foreground">
                              Malaysian residents must use IC
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="idNumber">
                            {formData.idType === "IC" ? "IC Number" : formData.idType === "Passport" ? "Passport Number" : "ID Number"} *
                          </Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="idNumber"
                              type="text"
                              placeholder={
                                formData.idType === "IC" 
                                  ? "YYMMDD-PB-G###G (e.g., 900101-01-1234)" 
                                  : formData.idType === "Passport"
                                  ? "Passport number"
                                  : "ID number"
                              }
                              value={formData.idNumber}
                              onChange={(e) => {
                                // Auto-format Malaysian IC
                                let value = e.target.value.toUpperCase();
                                if (formData.idType === "IC" && formData.country === "MY") {
                                  // Remove non-digits
                                  const digits = value.replace(/\D/g, "");
                                  // Format as YYMMDD-PB-G###G
                                  if (digits.length <= 6) {
                                    value = digits;
                                  } else if (digits.length <= 8) {
                                    value = `${digits.slice(0, 6)}-${digits.slice(6)}`;
                                  } else if (digits.length <= 10) {
                                    value = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
                                  } else {
                                    value = `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
                                  }
                                }
                                updateFormData("idNumber", value);
                              }}
                              required
                              className="pl-10"
                              disabled={loading}
                              maxLength={formData.idType === "IC" ? 14 : 20}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formData.idType === "IC" 
                              ? "Malaysian IC format: YYMMDD-PB-G###G (12 digits)"
                              : formData.idType === "Passport"
                              ? "Enter your passport number (6-12 alphanumeric characters)"
                              : "Enter your ID number"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Address (Optional) */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-brand-600" />
                          Delivery Address
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Optional - You can add this later for faster checkout
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine1">Address Line 1</Label>
                        <Input
                          id="addressLine1"
                          type="text"
                          placeholder="Street address, building name"
                          value={formData.addressLine1}
                          onChange={(e) => updateFormData("addressLine1", e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input
                          id="addressLine2"
                          type="text"
                          placeholder="Apartment, suite, unit (optional)"
                          value={formData.addressLine2}
                          onChange={(e) => updateFormData("addressLine2", e.target.value)}
                          className="pl-10"
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            type="text"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => updateFormData("city", e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          {formData.country === "MY" ? (
                            <Select
                              value={formData.state}
                              onValueChange={(value) => updateFormData("state", value)}
                              disabled={loading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {MALAYSIAN_STATES.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id="state"
                              type="text"
                              placeholder="State/Province"
                              value={formData.state}
                              onChange={(e) => updateFormData("state", e.target.value)}
                              disabled={loading}
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          type="text"
                          placeholder="Postal/ZIP code"
                          value={formData.postalCode}
                          onChange={(e) => updateFormData("postalCode", e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1 || loading}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        type="submit"
                        className="gold-gradient-button flex items-center gap-2"
                        disabled={loading}
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="gold-gradient-button"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                    Already have an account?{" "}
                    <Link href="/login" className="text-brand-600 hover:underline font-medium">
                      Sign in
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
