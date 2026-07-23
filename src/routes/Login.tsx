import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Github, ArrowRight, AlertCircle } from "lucide-react";
import { BrandPanel } from "@/components/marketing/BrandPanel";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { auth } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

type FormValues = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      await auth.login(values.email, values.password);
      navigate({ to: "/dashboard" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível entrar");
    }
  }

  function onGithub() {
    setErro("Login com GitHub estará disponível em breve — use e-mail e senha.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />

      <div className="relative flex items-center justify-center bg-canvas px-6 py-10">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[380px] animate-rise">
          <div className="mb-8 lg:hidden">
            <Logo variant="light" size="md" />
          </div>

          <div className="mb-7">
            <h1 className="font-display text-[26px] font-bold tracking-tight text-ink">Entre na sua conta</h1>
            <p className="mt-1.5 text-[14px] text-ink-soft">
              Bem-vindo de volta — vamos analisar seu próximo release.
            </p>
          </div>

          <Button variant="outline" size="lg" block onClick={onGithub}>
            <Github className="size-[18px]" />
            Entrar com GitHub
          </Button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] font-medium text-ink-mute">ou com e-mail</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {erro && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-risk-high/30 bg-risk-high-soft px-3.5 py-2.5 text-[13px] font-medium text-risk-high">
              <AlertCircle className="size-4 shrink-0" />
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <TextField
              label="E-mail"
              type="email"
              placeholder="voce@empresa.com"
              icon={<Mail className="size-[18px]" />}
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <div>
              <TextField
                label="Senha"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="size-[18px]" />}
                autoComplete="current-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-line text-ink accent-ink"
                    defaultChecked
                  />
                  Lembrar de mim
                </label>
                <button type="button" className="text-[13px] font-semibold text-ink transition-colors hover:text-brand-deep">
                  Esqueci a senha
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" block loading={isSubmitting} className="mt-2">
              Entrar
              {!isSubmitting && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13.5px] text-ink-soft">
            Ainda não tem conta?{" "}
            <button type="button" className="font-semibold text-ink underline-offset-4 hover:underline">
              Criar conta
            </button>
          </p>

          <p className="mt-8 text-center font-mono text-[11px] text-ink-mute">
            Conectado ao backend · autenticação JWT
          </p>
        </div>
      </div>
    </div>
  );
}
