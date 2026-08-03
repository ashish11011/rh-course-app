import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import DeviceInfo from 'react-native-device-info';

import { AppUpdateRemoteConfig, getAppUpdateRemoteConfig } from '@/src/services/remoteConfig';
import { isVersionSupported } from '@/src/utils/version';

type MandatoryUpdateState = {
  isCheckingUpdate: boolean;
  updateRequired: boolean;
  installedVersion: string;
  config: AppUpdateRemoteConfig | null;
};

function getInstalledAppVersion() {
  if (Platform.OS === 'web') {
    return Constants.expoConfig?.version || '0.0.0';
  }

  return DeviceInfo.getVersion();
}

export function useMandatoryUpdate(): MandatoryUpdateState {
  const [state, setState] = useState<MandatoryUpdateState>({
    isCheckingUpdate: true,
    updateRequired: false,
    installedVersion: '0.0.0',
    config: null,
  });

  useEffect(() => {
    let mounted = true;

    async function checkForMandatoryUpdate() {
      try {
        const installedVersion = getInstalledAppVersion();
        const config = await getAppUpdateRemoteConfig();

        // If there are no remote/cached values, fail open so users are not blocked by config outages.
        const canEvaluateRemoteConfig = config.fetchSucceeded || config.hasCachedRemoteValues;
        const updateRequired =
          canEvaluateRemoteConfig &&
          config.forceUpdate &&
          !isVersionSupported(installedVersion, config.minimumSupportedVersion);

        if (mounted) {
          setState({
            isCheckingUpdate: false,
            updateRequired,
            installedVersion,
            config,
          });
      }
    } catch (error) {
        if (__DEV__) {
          console.warn('Mandatory update check failed. Continuing app startup.', error);
        }

        if (mounted) {
          setState((current) => ({
            ...current,
            isCheckingUpdate: false,
            updateRequired: false,
          }));
        }
      }
    }

    checkForMandatoryUpdate();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
