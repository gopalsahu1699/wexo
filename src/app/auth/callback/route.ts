import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  let authError = null;

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error;
    
    if (!error && session?.user) {
      // If this is a password recovery flow, redirect to reset-password
      const isRecovery = searchParams.get('type') === 'recovery'
      if (isRecovery) {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Check if business_name exists in metadata or profile
      const businessName = session.user.user_metadata?.business_name;
      
      if (!businessName) {
        // Double check the profile table just in case
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name')
          .eq('id', session.user.id)
          .single();
          
        if (!profile?.company_name) {
          return NextResponse.redirect(`${origin}/finish-setup`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  const errorMessage = authError?.message || "Could not authenticate with Google";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMessage)}`)
}
