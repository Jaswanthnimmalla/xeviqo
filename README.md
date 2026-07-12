# Xeviqo — Learn Today. Build Tomorrow.

A premium, modern website for Xeviqo, a technology company offering Python and Java training
and final year academic project guidance today, built to scale into mobile, web, AI, cloud,
and SaaS services tomorrow.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Lucide Icons

## Getting started

```bash
npm install
npm run dev
```

The site runs at `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/     Navbar, Footer, ScrollProgress
    ui/         Button, SectionHeading, AnimatedCounter
    home/       Home page sections (Hero, WhyXeviqo, Services, FAQ, etc.)
  data/         Single source of truth for courses, projects, services, testimonials, FAQs
  pages/        One file per route
  context/      Dark/light theme provider
```

## Adding a new service (no redesign needed)

Open `src/data/services.ts` and add an object to the `services` array with an id, title,
description, a Lucide icon, and a status of `'live'` or `'coming-soon'`. It will automatically
appear on the Home page services section and the full Services page.

## Adding a new training program

Open `src/data/courses.ts` and add a course object. A route already exists at
`/training/:slug`, so a new course becomes browsable automatically.

## Adding a new project category

Add entries to `src/data/projects.ts`. If the category is new, add it to `projectCategories`
so it appears as a filter on the Projects page.

## Notes

- Dark mode preference is stored in `localStorage` and respects the system preference on first visit.
- The contact form is front-end only; connect it to your backend or a form service (e.g. Formspree,
  a serverless function, or your own API) inside `src/pages/Contact.tsx`.
- The embedded map in the Contact page uses a generic Google Maps embed URL — replace it with
  your actual business location.
- Replace social links in `src/components/layout/Footer.tsx` and contact details in
  `src/pages/Contact.tsx` with real values before launch.
