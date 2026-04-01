





// tested:




"use client";

import * as React from "react";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// ================= VALIDATION =================
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Minimum length is 8"),
});

// ================= ROLE → REDIRECT MAP =================
// role দেখে সঠিক dashboard এ পাঠাবো
const roleRedirectMap: Record<string, string> = {
  STUDENT: "/student/dashboard",
  TUTOR: "/tutor/dashboard",
  ADMIN: "/admin/dashboard",
};

export function LoginForm(props: React.ComponentProps<typeof Card>) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch {
      toast.error("Google login failed");
    }
  };

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: formSchema },
   
   
    onSubmit: async ({ value }) => {
  const toastId = toast.loading("Logging in...");
  try {
    const { data, error } = await authClient.signIn.email(value);

    if (error) {
      toast.error(error.message, { id: toastId });
      return;
    }

    // ✅ signIn এর পর session থেকে role নিন
    const meRes = await fetch("/api/auth/get-session", {
      credentials: "include",
    });
    const meData = await meRes.json();
    
    const role = (meData?.user?.role as string) ?? "STUDENT";
    const redirectTo = roleRedirectMap[role] ?? "/student/dashboard";
    
    toast.success("Logged in successfully!", { id: toastId });
    window.location.href = redirectTo;

  } catch {
    toast.error("Something went wrong, please try again.", { id: toastId });
  }
},
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email and password to login
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {/* Email */}
            <form.Field name="email">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            {/* ✅ Password with Eye Icon */}
            <form.Field name="password">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button form="login-form" type="submit" className="w-full">
          Login
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full"
        >
          Continue with Google
        </Button>
      </CardFooter>
    </Card>
  );
}