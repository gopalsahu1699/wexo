"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error.message);
        router.push(`/login?error=${encodeURIComponent(error.message)}`);
        return;
      }

      if (session?.user) {
        const isRecovery = searchParams.get('type') === 'recovery';
        if (isRecovery) {
          router.push('/reset-password');
          return;
        }

        const businessName = session.user.user_metadata?.business_name;
        
        if (!businessName) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_name')
            .eq('id', session.user.id)
            .single();
            
          if (!profile?.company_name) {
            router.push('/finish-setup');
            return;
          }
        }

        const next = searchParams.get('next') ?? '/dashboard';
        router.push(next);
      } else {
        const timeout = setTimeout(() => {
           if (!session) router.push('/login');
        }, 5000);
        return () => clearTimeout(timeout);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-900 tracking-widest uppercase text-xs">Authenticating...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-900 tracking-widest uppercase text-xs">Loading Auth...</p>
        </div>
      }>
        <AuthCallbackHandler />
      </Suspense>
    </div>
  );
}
