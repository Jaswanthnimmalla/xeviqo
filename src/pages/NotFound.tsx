import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center pt-24 px-6 text-center">
      <div>
        <span className="font-display text-7xl font-semibold gradient-text">404</span>
        <h1 className="mt-4 text-2xl font-semibold">This page hasn't been built yet</h1>
        <p className="mt-2 text-ink/60 dark:text-slate-400">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
