"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppFooter } from "@/components/app-footer";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo continuar.");
        return;
      }

      if (data.firstLogin) {
        router.push("/set-password");
        return;
      }

      setStep("password");
      requestAnimationFrame(() => passwordInputRef.current?.focus());
    } catch {
      setError("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.push("/proyectos");
    } catch {
      setError("Ocurrió un error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleChangeEmail() {
    setStep("email");
    setPassword("");
    setError(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Ingreso de jurados</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div layout transition={{ duration: 0.25, ease: "easeInOut" }}>
              <form
                onSubmit={step === "email" ? handleEmailSubmit : handlePasswordSubmit}
                className="flex flex-col gap-4"
              >
                <motion.div layout className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={step === "password"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </motion.div>

                <AnimatePresence initial={false}>
                  {step === "password" && (
                    <motion.div
                      key="password-field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                          ref={passwordInputRef}
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <motion.div layout className="flex items-center gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading
                      ? "Cargando..."
                      : step === "email"
                        ? "Continuar"
                        : "Ingresar"}
                  </Button>
                  {step === "password" && (
                    <Button type="button" variant="ghost" onClick={handleChangeEmail}>
                      Cambiar correo
                    </Button>
                  )}
                </motion.div>
              </form>
            </motion.div>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
