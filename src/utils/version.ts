type ParsedVersion = [number, number, number];

function parseSemanticVersion(version: string): ParsedVersion {
  const [coreVersion] = version.trim().split(/[+-]/);
  const parts = coreVersion.split('.').map((part) => {
    const value = Number.parseInt(part.replace(/[^\d]/g, ''), 10);
    return Number.isFinite(value) ? value : 0;
  });

  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function compareVersions(currentVersion: string, minimumSupportedVersion: string) {
  const current = parseSemanticVersion(currentVersion);
  const minimum = parseSemanticVersion(minimumSupportedVersion);

  for (let index = 0; index < 3; index += 1) {
    if (current[index] > minimum[index]) return 1;
    if (current[index] < minimum[index]) return -1;
  }

  return 0;
}

export function isVersionSupported(currentVersion: string, minimumSupportedVersion: string) {
  return compareVersions(currentVersion, minimumSupportedVersion) >= 0;
}
