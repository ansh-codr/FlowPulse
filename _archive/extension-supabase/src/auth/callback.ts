// @ts-nocheck
import { supabase } from "../lib/supabase";

async function handleAuthCallback() {
  const rootEl = document.getElementById("root");
  try {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    const description = url.searchParams.get("error_description");
    const code = url.searchParams.get("code");

    if (error) {
      rootEl!.textContent = `Authentication failed: ${description ?? error}`;
      return;
    }

    if (!code) {
      rootEl!.textContent = "Missing verification code in link. Try signing in again.";
      return;
    }

    // Complete the magic link flow and persist the session in chrome.storage
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession({ code });
    if (exchangeError) {
      rootEl!.textContent = `Authentication failed: ${exchangeError.message}`;
      return;
    }

    rootEl!.textContent = "Authentication successful! You can close this tab.";
    setTimeout(() => window.close(), 2000);
  } catch (err: any) {
    rootEl!.textContent = `Unexpected error: ${err?.message ?? err}`;
  }
}

handleAuthCallback();
