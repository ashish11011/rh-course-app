const DEFAULT_CLOUDFRONT_URL = 'https://d2c3lsl35lix55.cloudfront.net';

export const CLOUDFRONT_URL = (
  process.env.EXPO_PUBLIC_CLOUDFRONT_URL || DEFAULT_CLOUDFRONT_URL
).replace(/\/$/, '');

function safelyDecodeUriComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function cloudfrontAssetUrl(key?: string | null) {
  const value = key?.trim();
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      if (url.hostname.includes('.s3.') || url.hostname === 's3.amazonaws.com') {
        return `${CLOUDFRONT_URL}${url.pathname}`;
      }
    } catch {
      return value;
    }

    return value;
  }

  const cleanKey = value
    .replace(/^\/+/, '')
    .split('/')
    .map((part) => encodeURIComponent(safelyDecodeUriComponent(part)))
    .join('/');

  return `${CLOUDFRONT_URL}/${cleanKey}`;
}
