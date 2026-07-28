const { withDangerousMod } = require('@expo/config-plugins');
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
  return withDangerousMod(config, [
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
