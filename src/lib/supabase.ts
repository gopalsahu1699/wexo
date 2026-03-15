import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error("Supabase environment variables are missing!");
  }

  return createBrowserClient(
    url || '',
    anonKey || '',
    {
      cookies: {
        getAll() {
          return parseCookieString(document.cookie)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serializeCookie(name, value, options)
          })
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      }
    }
  )
}

// Helper functions for cookie handling in the browser
function parseCookieString(cookieString: string) {
  return cookieString
    .split(';')
    .filter(Boolean)
    .map((cookie) => {
      const [name, ...value] = cookie.split('=')
      return { name: name.trim(), value: value.join('=') }
    })
}

function serializeCookie(name: string, value: string, options: any) {
  let cookie = `${name}=${value}`
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`
  if (options.domain) cookie += `; Domain=${options.domain}`
  if (options.path) cookie += `; Path=${options.path}`
  if (options.expires && options.expires instanceof Date) cookie += `; Expires=${options.expires.toUTCString()}`
  if (options.httpOnly) cookie += `; HttpOnly`
  if (options.secure) cookie += `; Secure`
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`
  return cookie
}
