import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    async function sendMagicLink() {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
        if (error) {
            setMessage(error.message);
        }
        else {
            setMessage("Magic link sent! Check your inbox.");
        }
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8 space-y-6 shadow-glass", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: "FlowPulse" }), _jsx("p", { className: "text-sm text-slate-400", children: "Sign in to view your focus analytics." })] }), _jsx("input", { className: "w-full rounded-2xl bg-slate-900/50 border border-white/10 px-4 py-3 outline-none focus:border-indigo-400", placeholder: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("button", { className: "w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 py-3 font-medium", onClick: sendMagicLink, children: "Send magic link" }), message && _jsx("p", { className: "text-xs text-center text-slate-300", children: message })] }) }));
}
