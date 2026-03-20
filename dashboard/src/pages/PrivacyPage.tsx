export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white/85">
      <h1 className="font-display text-3xl font-semibold text-white">Privacy Policy</h1>
      <p className="mt-4 text-sm text-white/65">
        FlowPulse is privacy-first. We collect only the minimum activity signals needed to provide productivity insights.
      </p>

      <section className="mt-8 space-y-3 text-sm leading-relaxed text-white/75">
        <p>
          We store aggregate activity summaries such as step count, active movement minutes, and activity sessions.
        </p>
        <p>
          We do not collect heart rate, sleep data, medical records, or location data for this feature.
        </p>
        <p>
          Data is transmitted over HTTPS and stored in secured backend services with authenticated access controls.
        </p>
      </section>
    </div>
  );
}
