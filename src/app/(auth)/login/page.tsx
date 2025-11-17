import { Suspense } from "react";
import LoginForm from "./_components/form";
import { RightHeroSlider } from "./_components/slider";

export default function LoginPage() {
  return (
    <main className="min-h-dvh w-full bg-white text-foreground">
      <div className="w-full grid min-h-dvh grid-cols-1 md:grid-cols-[1fr_1.05fr]">
        <Suspense fallback={<div>Loading form...</div>}>
          <LoginForm />
        </Suspense>
        <RightHeroSlider />
      </div>
    </main>
  );
}
