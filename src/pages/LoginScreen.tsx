import React, { useState } from 'react';

import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogle = async () => {
    setErrorMessage(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setErrorMessage(msg);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-gray-900/90 shadow-xl border border-gray-200/80 dark:border-gray-700 p-8 text-center"
        role="region"
        aria-label="Sign in"
      >
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Sign in</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Continue with Google to use Whisperrr.
        </p>
        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4" role="alert">
            {errorMessage}
          </p>
        )}
        <Button type="button" onClick={handleGoogle} loading={busy} disabled={busy} fullWidth size="lg">
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
