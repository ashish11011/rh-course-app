const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const GRADLE_SETTINGS = {
  'org.gradle.jvmargs': '-Xmx4g -XX:MaxMetaspaceSize=1g -Dfile.encoding=UTF-8',
  'org.gradle.daemon': 'false',
  'org.gradle.parallel': 'false',
  'org.gradle.vfs.watch': 'false',
  'org.gradle.workers.max': '2',
};

function upsertGradleProperty(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=.*$`, 'm');

  if (pattern.test(contents)) {
    return contents.replace(pattern, line);
  }

  return `${contents.trimEnd()}\n${line}\n`;
}

module.exports = function withGradleBuildSettings(config) {
  const configWithManifest = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const manifestRoot = manifest.manifest || manifest;
    manifestRoot.$ = {
      ...manifestRoot.$,
      'xmlns:tools': 'http://schemas.android.com/tools',
    };

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    application.$['android:allowBackup'] = 'false';

    const blockedPermissions = new Set([
      'android.permission.ACCESS_ADSERVICES_AD_ID',
      'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
      'android.permission.CAMERA',
      'android.permission.DOWNLOAD_WITHOUT_NOTIFICATION',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.RECORD_AUDIO',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'com.google.android.gms.permission.AD_ID',
    ]);

    const existingPermissions = manifestRoot['uses-permission'] || [];
    manifestRoot['uses-permission'] = existingPermissions.filter(
      (permission) => !blockedPermissions.has(permission.$?.['android:name'])
    );

    const existingPermissionNames = new Set(
      manifestRoot['uses-permission'].map((permission) => permission.$?.['android:name'])
    );

    for (const permissionName of blockedPermissions) {
      if (!existingPermissionNames.has(permissionName)) {
        manifestRoot['uses-permission'].push({
          $: {
            'android:name': permissionName,
            'tools:node': 'remove',
          },
        });
      }
    }

    for (const activity of application.activity || []) {
      for (const intentFilter of activity['intent-filter'] || []) {
        intentFilter.data = (intentFilter.data || []).filter((data) => {
          const scheme = data.$?.['android:scheme'];
          return typeof scheme !== 'string' || !scheme.startsWith('exp+');
        });
      }
    }

    return config;
  });

  return withDangerousMod(configWithManifest, [
    'android',
    async (config) => {
      const gradlePropertiesPath = path.join(
        config.modRequest.platformProjectRoot,
        'gradle.properties'
      );

      let contents = '';
      try {
        contents = await fs.promises.readFile(gradlePropertiesPath, 'utf8');
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      const nextContents = Object.entries(GRADLE_SETTINGS).reduce(
        (current, [key, value]) => upsertGradleProperty(current, key, value),
        contents
      );

      await fs.promises.writeFile(gradlePropertiesPath, nextContents);

      return config;
    },
  ]);
};
