import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Check if haptics are available (iOS/Android native)
 */
export const isHapticsAvailable = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Trigger impact haptic feedback
 */
export const triggerImpactHaptic = async (
  style: 'light' | 'medium' | 'heavy' = 'medium'
): Promise<void> => {
  if (!isHapticsAvailable()) return;

  const impactStyle = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  }[style];

  try {
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Trigger notification haptic feedback
 */
export const triggerNotificationHaptic = async (
  type: 'success' | 'warning' | 'error' = 'success'
): Promise<void> => {
  if (!isHapticsAvailable()) return;

  const notificationType = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error,
  }[type];

  try {
    await Haptics.notification({ type: notificationType });
  } catch (error) {
    console.warn('Haptic notification failed:', error);
  }
};

/**
 * Trigger selection haptic (light tap)
 */
export const triggerSelectionHaptic = async (): Promise<void> => {
  if (!isHapticsAvailable()) return;

  try {
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch (error) {
    console.warn('Selection haptic failed:', error);
  }
};

/**
 * Vibrate for a duration (Android mainly)
 */
export const vibrate = async (duration: number = 100): Promise<void> => {
  if (!isHapticsAvailable()) return;

  try {
    await Haptics.vibrate({ duration });
  } catch (error) {
    console.warn('Vibrate failed:', error);
  }
};
