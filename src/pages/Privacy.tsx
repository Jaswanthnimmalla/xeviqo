export default function Privacy() {
  return (
    <div className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 lg:pb-24 min-h-screen">
      <div className="container-x max-w-3xl px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-ink dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-ink/50 dark:text-slate-500">
          Last updated: July 2026
        </p>

        <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8 text-ink/70 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              1. Information we collect
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              We collect information you provide directly, such as your name, email, phone number,
              and course interest, when you fill out an enrollment or contact form.
            </p>
          </section>
          
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              2. How we use your information
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              We use your information to respond to enquiries, provide training and project
              services, and share relevant updates about our programs.
            </p>
          </section>
          
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              3. Data protection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              We take reasonable technical and organizational measures to protect your personal
              data from unauthorized access, alteration, or disclosure.
            </p>
          </section>
          
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-ink dark:text-white">
              4. Contact
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base">
              For any privacy-related questions, reach us at hello@xeviqo.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}