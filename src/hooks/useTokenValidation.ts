"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/lib/api/routes";

export function useTokenValidation(token: string) {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError("Token no válido");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(apiRoutes.sessionGet(token));
        
        if (!response.ok) {
          throw new Error("Token inválido");
        }

        const sessionData = await response.json();
        
        if (sessionData.session) {
          setIsValid(true);
        } else {
          throw new Error("Sesión no encontrada");
        }
      } catch (err) {
        setError("Token no válido o sesión no encontrada");
        setIsValid(false);
        
        // Redirigir a la página de login después de un breve delay
        setTimeout(() => {
          router.push("/survey");
        }, 2000);
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token, router]);

  return { isValidating, isValid, error };
}
