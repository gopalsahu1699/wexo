import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
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

    // Request permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
        console.warn("User denied push notification permissions.");
        return;
    }

    // Register with Apple / Google
    await PushNotifications.register();

    // Listen for registration token
    PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        
        // Save the token to the database
        const userType = await getCurrentUser();
        const supabase = createClient();

        if (userType.type === 'staff') {
            await supabase
                .from('staff_members')
                .update({ push_token: token.value as any }) // Use 'any' in case column isn't in types yet
                .eq('id', userType.session.staffId);
        } else if (userType.type === 'admin') {
             await supabase
                .from('profiles')
                .update({ push_token: token.value as any })
                .eq('id', userType.userId);
        }
    });

    // Error handling
    PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on push registration: ' + JSON.stringify(error));
    });

    // Handle received notification while app is open
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        // You can use a toast or alert to show the content if the app is foregrounded
    });

    // Handle user clicking on notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push action performed: ' + JSON.stringify(action));
        // Logic to navigate to a specific page based on notification data
    });
}
