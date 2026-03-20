export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white/85">
      <h1 className="font-display text-3xl font-semibold text-white">Terms of Service</h1>
      <p className="mt-4 text-sm text-white/65">
        By using FlowPulse, you agree to use the platform in compliance with applicable laws and responsible data practices.
      </p>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-white/75">
        <p>
          FlowPulse provides analytics and recommendations based on summarized activity data to improve focus and productivity.
        </p>
        <p>
          You can disconnect integrations at any time. Deletion and account controls are available in app settings.
        </p>
        <p>
          These terms may be updated over time. Continued use of the service implies acceptance of the current terms.
        </p>
      </section>
    </div>
  );
}
