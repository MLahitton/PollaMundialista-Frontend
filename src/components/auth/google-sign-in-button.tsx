"use client";

import { useEffect, useRef, useState } from "react";
import { requireGoogleClientId } from "@/lib/config/env";

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => Promise<void> | void;
  disabled?: boolean;
};

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  onCredential,
  disabled = false,
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initializeGoogleButton() {
      try {
        const clientId = requireGoogleClientId();
        await loadGoogleScript();

        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential || disabled) {
              return;
            }

            void onCredential(response.credential);
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "signin_with",
          width: 320,
        });
      } catch {
        if (!cancelled) {
          setError("No fue posible cargar el boton de Google.");
        }
      }
    }

    void initializeGoogleButton();

    return () => {
      cancelled = true;
      window.google?.accounts?.id.cancel();
    };
  }, [disabled, onCredential]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        aria-disabled={disabled}
        className={disabled ? "pointer-events-none opacity-60" : undefined}
        ref={buttonRef}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
