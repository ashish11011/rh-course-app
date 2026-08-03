import { getApp } from '@react-native-firebase/app';
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from '@react-native-firebase/remote-config';
import { Platform } from 'react-native';

export const APP_UPDATE_REMOTE_CONFIG_KEY = 'app_update_config';
export const FEATURED_SECTION_REMOTE_CONFIG_KEY = 'featured_section';

type AppUpdateRemoteConfigJson = {
  minimum_supported_version: string;
  latest_version: string;
  current_version_message: string;
  store_urls: {
    android: string;
    ios: string;
  };
  force_update: boolean;
};

export type AppUpdateRemoteConfig = {
  minimumSupportedVersion: string;
  latestVersion: string;
  currentVersionMessage: string;
  storeUrl: string;
  storeUrls: {
    android: string;
    ios: string;
  };
  forceUpdate: boolean;
  hasCachedRemoteValues: boolean;
  fetchSucceeded: boolean;
};

const APP_UPDATE_CONFIG_DEFAULT_VALUE: AppUpdateRemoteConfigJson = {
  minimum_supported_version: '0.0.0',
  latest_version: '0.0.0',
  current_version_message: 'Please update to the latest version to continue using the app.',
  store_urls: {
    android: '',
    ios: '',
  },
  force_update: false,
};

const APP_UPDATE_REMOTE_CONFIG_DEFAULTS = {
  [APP_UPDATE_REMOTE_CONFIG_KEY]: JSON.stringify(APP_UPDATE_CONFIG_DEFAULT_VALUE),
  [FEATURED_SECTION_REMOTE_CONFIG_KEY]: JSON.stringify({ homeSection: [] }),
};

let remoteConfigInitialized = false;
let remoteConfigFetchPromise: Promise<boolean> | null = null;
let remoteConfigFetchSucceeded = false;
let remoteConfigFetchAttempted = false;

function getAppRemoteConfig() {
  return getRemoteConfig(getApp());
}

export async function initializeRemoteConfig() {
  if (remoteConfigInitialized) return;

  const config = getAppRemoteConfig();
  config.settings = {
    // Use fast refreshes in development and a production-safe interval in release builds.
    minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
    fetchTimeoutMillis: 10 * 1000,
  };

  config.defaultConfig = APP_UPDATE_REMOTE_CONFIG_DEFAULTS;
  remoteConfigInitialized = true;
}

async function fetchRemoteConfigOnce() {
  await initializeRemoteConfig();

  if (remoteConfigFetchAttempted) {
    return remoteConfigFetchSucceeded;
  }

  if (!remoteConfigFetchPromise) {
    remoteConfigFetchPromise = fetchAndActivate(getAppRemoteConfig())
      .then(() => {
        remoteConfigFetchSucceeded = true;
        return true;
      })
      .catch((error) => {
        remoteConfigFetchSucceeded = false;
        if (__DEV__) {
          console.warn('Failed to fetch Firebase Remote Config. Falling back to cached values.', error);
        }
        return false;
      })
      .finally(() => {
        remoteConfigFetchAttempted = true;
        remoteConfigFetchPromise = null;
      });
  }

  return remoteConfigFetchPromise;
}

function hasCachedRemoteUpdateValues() {
  return getValue(getAppRemoteConfig(), APP_UPDATE_REMOTE_CONFIG_KEY).getSource() === 'remote';
}

function parseAppUpdateConfigJson(rawConfig: string): AppUpdateRemoteConfigJson {
  try {
    const parsedConfig = JSON.parse(rawConfig) as Partial<AppUpdateRemoteConfigJson>;

    return {
      minimum_supported_version:
        parsedConfig.minimum_supported_version ||
        APP_UPDATE_CONFIG_DEFAULT_VALUE.minimum_supported_version,
      latest_version: parsedConfig.latest_version || APP_UPDATE_CONFIG_DEFAULT_VALUE.latest_version,
      current_version_message:
        parsedConfig.current_version_message ||
        APP_UPDATE_CONFIG_DEFAULT_VALUE.current_version_message,
      store_urls: {
        android:
          parsedConfig.store_urls?.android || APP_UPDATE_CONFIG_DEFAULT_VALUE.store_urls.android,
        ios: parsedConfig.store_urls?.ios || APP_UPDATE_CONFIG_DEFAULT_VALUE.store_urls.ios,
      },
      force_update:
        typeof parsedConfig.force_update === 'boolean'
          ? parsedConfig.force_update
          : APP_UPDATE_CONFIG_DEFAULT_VALUE.force_update,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('Invalid app_update_config JSON. Falling back to safe defaults.', error);
    }
    return APP_UPDATE_CONFIG_DEFAULT_VALUE;
  }
}

function readAppUpdateConfig(fetchSucceeded: boolean): AppUpdateRemoteConfig {
  const appUpdateConfig = parseAppUpdateConfigJson(
    getValue(getAppRemoteConfig(), APP_UPDATE_REMOTE_CONFIG_KEY).asString()
  );

  const storeUrl =
    Platform.OS === 'ios' ? appUpdateConfig.store_urls.ios : appUpdateConfig.store_urls.android;

  return {
    minimumSupportedVersion: appUpdateConfig.minimum_supported_version,
    latestVersion: appUpdateConfig.latest_version,
    currentVersionMessage: appUpdateConfig.current_version_message,
    storeUrl,
    storeUrls: appUpdateConfig.store_urls,
    forceUpdate: appUpdateConfig.force_update,
    hasCachedRemoteValues: hasCachedRemoteUpdateValues(),
    fetchSucceeded,
  };
}

export async function getAppUpdateRemoteConfig(): Promise<AppUpdateRemoteConfig> {
  const fetchSucceeded = await fetchRemoteConfigOnce();
  return readAppUpdateConfig(fetchSucceeded);
}

export async function getFeaturedSectionConfig() {
  await fetchRemoteConfigOnce();
  return getValue(getAppRemoteConfig(), FEATURED_SECTION_REMOTE_CONFIG_KEY).asString();
}
