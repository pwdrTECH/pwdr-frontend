"use client";

import { SubmitButton } from "@/components/form/button";
import MailIcon from "@/components/svgs";
import { AppLogo } from "@/components/svgs/logo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/auth/hooks";
import { consumeReturnTo } from "@/lib/auth/session";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

// --------------------
//  SCHEMA + TYPES
// --------------------
const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(4, "Password required"),
});

type LoginValues = z.infer<typeof loginSchema>;

// --------------------
//  COMPONENT
// --------------------
export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get("next") || "/user";
  const { mutateAsync: login, isPending, error } = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await login(values);
      if (res) {
        router.replace(consumeReturnTo(nextUrl));
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="w-full h-full relative order-2 px-4 py-10 sm:px-8 md:order-1 md:flex md:flex-col md:justify-center">
      <div className="h-full max-w-[403.82px] mx-auto w-full flex flex-col justify-between items-center">
        <div className="mb-14 mt-2 md:mb-16">
          <Link
            href="/"
            aria-label="Powder home"
            className="flex items-center gap-2"
          >
            <AppLogo className="text-black" />
          </Link>
        </div>

        <div className="w-full sm:w-[440px] flex flex-col gap-[35.9px]">
          <h1 className="mt-2 text-[15px] text-[#6b6e7d] text-center">
            Access and manage your claims
          </h1>

          <div className="w-full flex flex-col gap-[26.6px] pt-[19.49px] pb-[24.49px] px-[19.49px] rounded-[13.46px] border border-[#0000000D] bg-[#F8F8F8]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@domain.com"
                          {...field}
                          type="email"
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          {...field}
                          type="password"
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <p className="text-sm text-red-500 text-center">
                    {(error as Error).message || "Login failed"}
                  </p>
                )}

                <SubmitButton disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign in"}
                </SubmitButton>
              </form>
            </Form>
          </div>
        </div>

        <div className="w-full mt-10 flex flex-wrap items-center justify-end gap-3 text-[12px] text-right text-[#8c90a3]">
          <Link
            href="mailto:help@powder.health"
            className="hover:text-[#0f1222] flex items-center gap-[7.37px]"
          >
            help@powder.health <MailIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
