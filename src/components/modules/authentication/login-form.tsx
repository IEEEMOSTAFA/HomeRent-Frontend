// src/components/auth/LoginForm.tsx
"use client";

import * as React from "react";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Field, FieldError, FieldGroup, FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const roleRedirectMap: Record<string, string> = {
  USER:  "/user/dashboard",
  OWNER: "/owner/dashboard",
  ADMIN: "/admin/dashboard",
};

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm(props: React.ComponentProps<typeof Card>) {
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: formSchema },

    onSubmit: async ({ value }) => {
      const toastId = toast.loading("Logging in...");

      try {
        // ✅ better-auth client দিয়ে sign in করো
        // এটা backend এ call করে এবং better-auth.session_token cookie set করে
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          fetchOptions: {
            credentials: "include", // ← cookie receive করার জন্য
          },
        });

        if (error) {
          toast.error(error.message || "Invalid email or password", { id: toastId });
          return;
        }

        // ✅ Role বের করো — data.user থেকে
        const user = data?.user as any;
        const role: string = user?.role || "USER";

        console.log("✅ Login success | role:", role);

        const redirectTo = roleRedirectMap[role] || "/user/dashboard";

        toast.success("Login successful! Redirecting...", { id: toastId });

        // ✅ Full page reload — middleware নতুন cookie দেখতে পাবে
        window.location.href = redirectTo;

      } catch (err) {
        console.error("Login error:", err);
        toast.error("Something went wrong. Please try again.", { id: toastId });
      }
    },
  });

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
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
            <form.Field name="email">
              {(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button form="login-form" type="submit" className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}















// // src/components/auth/LoginForm.tsx
// "use client";

// import * as React from "react";
// import * as z from "zod";
// import { useForm } from "@tanstack/react-form";
// import { toast } from "sonner";
// import { Eye, EyeOff } from "lucide-react";

// import { authClient } from "@/lib/auth-client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Field,
//   FieldError,
//   FieldGroup,
//   FieldLabel,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";

// // ✅ Backend URL — Express server (port 5000), NOT Next.js frontend
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// const formSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z.string().min(8, "Password must be at least 8 characters"),
// });

// // Role-based redirect map
// const roleRedirectMap: Record<string, string> = {
//   USER: "/user/dashboard",
//   OWNER: "/owner/dashboard",
//   ADMIN: "/admin/dashboard",
// };

// export function LoginForm(props: React.ComponentProps<typeof Card>) {
//   const [showPassword, setShowPassword] = React.useState(false);

//   const form = useForm({
//     defaultValues: { email: "", password: "" },
//     validators: { onSubmit: formSchema },

//     onSubmit: async ({ value }) => {
//       const toastId = toast.loading("Logging in...");

//       try {
//         const { error } = await authClient.signIn.email({
//           email: value.email,
//           password: value.password,
//         });

//         if (error) {
//           toast.error(error.message || "Invalid email or password", { id: toastId });
//           return;
//         }

//         // ✅ KEY FIX: Use full backend URL — relative URL goes to Next.js, not Express
//         const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
//           credentials: "include",
//         });

//         if (!res.ok) throw new Error("Failed to fetch session");

//         const sessionData = await res.json();
//         const role = sessionData?.user?.role as string;

//         const redirectTo = roleRedirectMap[role] || "/user/dashboard";

//         toast.success("Login successful! Redirecting...", { id: toastId });
//         window.location.href = redirectTo; // Full reload so middleware picks up the new session
//       } catch (err) {
//         toast.error("Something went wrong. Please try again.", { id: toastId });
//       }
//     },
//   });

//   const handleGoogleLogin = async () => {
//     try {
//       await authClient.signIn.social({ provider: "google" });
//       window.location.reload();
//     } catch {
//       toast.error("Google login failed. Please try again.");
//     }
//   };

//   return (
//     <Card {...props}>
//       <CardHeader>
//         <CardTitle>Login to your account</CardTitle>
//         <CardDescription>Enter your email and password to continue</CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form
//           id="login-form"
//           onSubmit={(e) => {
//             e.preventDefault();
//             form.handleSubmit();
//           }}
//         >
//           <FieldGroup>
//             {/* Email Field */}
//             <form.Field name="email">
//               {(field) => (
//                 <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
//                   <FieldLabel htmlFor={field.name}>Email</FieldLabel>
//                   <Input
//                     id={field.name}
//                     type="email"
//                     value={field.state.value}
//                     onChange={(e) => field.handleChange(e.target.value)}
//                     placeholder="you@example.com"
//                   />
//                   <FieldError errors={field.state.meta.errors} />
//                 </Field>
//               )}
//             </form.Field>

//             {/* Password Field */}
//             <form.Field name="password">
//               {(field) => (
//                 <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
//                   <FieldLabel htmlFor={field.name}>Password</FieldLabel>
//                   <div className="relative">
//                     <Input
//                       id={field.name}
//                       type={showPassword ? "text" : "password"}
//                       value={field.state.value}
//                       onChange={(e) => field.handleChange(e.target.value)}
//                       className="pr-10"
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                   <FieldError errors={field.state.meta.errors} />
//                 </Field>
//               )}
//             </form.Field>
//           </FieldGroup>
//         </form>
//       </CardContent>

//       <CardFooter className="flex flex-col gap-3">
//         <Button form="login-form" type="submit" className="w-full">
//           Login
//         </Button>

//         <Button
//           type="button"
//           variant="outline"
//           onClick={handleGoogleLogin}
//           className="w-full"
//         >
//           Continue with Google
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// }

