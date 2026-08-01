import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'deviceId';

function createDeviceId() {
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function getOrCreateDeviceId() {
  const existingDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const deviceId = createDeviceId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  return deviceId;
}
