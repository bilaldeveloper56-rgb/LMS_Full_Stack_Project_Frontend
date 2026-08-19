import React from 'react';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary tracking-tight">
          Sign In
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Enter your institutional credentials to access your portal.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}

export default LoginPage;
