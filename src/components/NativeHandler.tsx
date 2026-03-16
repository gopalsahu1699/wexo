"use client";

import { useEffect } from "react";
import { setupPushNotifications, isNative } from "@/lib/services/mobile";
import { getCurrentUser } from "@/lib/services/auth-role";
import { createClient } from "@/lib/supabase";

import { App } from "@capacitor/app";
import { useRouter } from "next/navigation";

export default function NativeHandler() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (isNative()) {
            console.log("Native environment detected. Initializing mobile listeners...");
            initializeNativeFeatures();
            
            // Handle Deep Linking for OAuth
            App.addListener('appUrlOpen', async (data) => {
                console.log('App opened with URL:', data.url);
                
                // For Supabase OAuth: com.wexo.app://auth/callback
                if (data.url.includes('auth/callback')) {
                    // Close the in-app browser if it's open
                    try {
                        const { Browser } = await import('@capacitor/browser');
                        await Browser.close();
                    } catch (e) {
                        console.error('Error closing browser:', e);
                    }

                    const url = new URL(data.url.replace('com.wexo.app://', 'https://'));
                    
                    // 1. Handle PKCE Flow (Preferred)
                    const code = url.searchParams.get('code');
                    if (code) {
                        supabase.auth.exchangeCodeForSession(code).then(({ error, data: sessionData }) => {
                            if (!error && sessionData.session) {
                                console.log('Session exchanged successfully from PKCE code');
                                router.push('/auth/callback');
                            } else {
                                console.error('Error exchanging code:', error);
                                router.push(`/login?error=${encodeURIComponent(error?.message || 'Code exchange failed')}`);
                            }
                        });
                        return;
                    }

                    // 2. Handle Implicit Flow (Fallback)
                    const hash = url.hash.substring(1);
                    if (hash) {
                        const params = new URLSearchParams(hash);
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');

                        if (access_token && refresh_token) {
                            supabase.auth.setSession({
                                access_token,
                                refresh_token
                            }).then(({ error, data: sessionData }) => {
                                if (!error && sessionData.session) {
                                    console.log('Session set successfully from hash');
                                    router.push('/auth/callback');
                                } else {
                                    console.error('Error setting session:', error);
                                    router.push(`/login?error=${encodeURIComponent(error?.message || 'Session setup failed')}`);
                                }
                            });
                        }
                    }
                }
            });
        }
    }, [router, supabase.auth]);

    async function initializeNativeFeatures() {
        try {
            // Setup Push Notifications
            await setupPushNotifications();
            
        } catch (err) {
            console.error("Failed to initialize native features:", err);
        }
    }

    return null; // This component doesn't render anything
}
