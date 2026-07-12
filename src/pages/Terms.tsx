export default function Terms() {
  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 lg:pb-24 min-h-screen">
      <div className="container-x max-w-3xl px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-ink/50 dark:text-slate-500">
          Last updated: July 2026
        </p>

        <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8 text-ink/70 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              1. Enrollment
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              Enrollment in any Xeviqo training program is confirmed once payment and registration
              details are received. Seats in a cohort are limited and allocated on a first-come basis.
            </p>
          </section>
          
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              2. Certificates
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              Certificates are issued only to learners who complete the required assignments and
              final project to a satisfactory standard.
            </p>
          </section>
          
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              3. Project requests
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              Final year project requests are scoped individually. Timelines and deliverables are
              confirmed in writing before work begins.
            </p>
          </section>
          
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              4. Changes
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              Xeviqo may update these terms from time to time. Continued use of our services
              constitutes acceptance of the revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}