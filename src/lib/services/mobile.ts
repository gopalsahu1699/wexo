import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { createClient } from '../supabase';
import { getCurrentUser } from './auth-role';

export const isNative = () => Capacitor.isNativePlatform();

/**
 * Camera Service
 */
export async function takePhoto() {
    if (!isNative()) {
        alert("Camera is only available on the native Android app.");
        return null;
    }

    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Prompt,
        });

        return image.base64String;
    } catch (err) {
        console.error("Camera error:", err);
        return null;
    }
}

/**
 * Push Notifications Service
 */
export async function setupPushNotifications() {
    if (!isNative()) return;

    console.warn("Push notifications are currently disabled because google-services.json is not configured.");
    return;
}
