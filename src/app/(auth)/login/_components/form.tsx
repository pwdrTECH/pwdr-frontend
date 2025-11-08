"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordField, TextField } from "@/components/form"
import { SubmitButton } from "@/components/ui/submit-button"

// --- Validation schema (Zod) ---
const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
})

type LoginValues = z.infer<typeof LoginSchema>

type Props = {
  defaultEmail?: string
  onSubmitSuccess?: (values: LoginValues) => void
}

export function LoginForm() {
  const router = useRouter()
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [showPw, setShowPw] = React.useState(false)

  async function onSubmit(values: LoginValues) {
    await new Promise((r) => setTimeout(r, 600))
    router.push("/dashboard")
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="w-full grid grid-cols-1 gap-[26.92px]"
      >
        <TextField
          control={form.control}
          name="email"
          label="Email"
          placeholder="you@company.com"
          inputMode="email"
          autoComplete="email"
        />

        <PasswordField
          control={form.control}
          name="password"
          label="Password"
        />
        <SubmitButton fullWidth loadingText="Signing in…">
          Continue
        </SubmitButton>

        <p className="text-[15px] leading-[22.43px] text-[#475467] text-center tracking-normal">
          By continuing, you agree to this{" "}
          <Link href="#" className="underline underline-offset-4">
            Terms &amp; Usage Policy
          </Link>
          , and acknowledge this{" "}
          <Link href="#" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </Form>
  )
}
