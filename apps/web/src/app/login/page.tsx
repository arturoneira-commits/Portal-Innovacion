"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMensaje("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
        return;
      }

      router.replace("/panel");
      router.refresh();
    } catch {
      setMensaje("No se pudo conectar. Comprueba la configuración de Supabase.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <section className="w-full max-w-md border border-navy/15 bg-white p-7 sm:p-9">
        <Link href="/" className="font-serif text-xl text-navy">
          Portal de Innovación
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-gold">
          Acceso institucional
        </p>
        <h1 className="mt-2 font-serif text-3xl text-navy">
          Iniciar sesión
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          Ingresa con tu cuenta para acceder al panel de gestión.
        </p>

        <form onSubmit={iniciarSesion} className="mt-7 space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-navy"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-navy"
            />
          </div>

          {mensaje && (
            <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-navy px-5 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate">
          <Link href="/" className="underline hover:text-navy">
            Volver al portal público
          </Link>
        </p>
      </section>
    </main>
  );
}
