import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-xl bg-surface border border-border shadow-sm flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-text-muted" />
        </div>
        <h1 className="text-5xl font-bold text-text-primary tracking-tight">404</h1>
        <p className="mt-3 text-base text-text-secondary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-surface border border-border rounded-md hover:bg-surface-muted transition-colors duration-[var(--transition-base)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-inverted bg-primary-600 rounded-md hover:bg-primary-700 transition-colors duration-[var(--transition-base)]"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
