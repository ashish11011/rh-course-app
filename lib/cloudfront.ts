const DEFAULT_CLOUDFRONT_URL = 'https://d2c3lsl35lix55.cloudfront.net';
const DEFAULT_COURSE_CLOUDFRONT_URL = 'https://d12z58c4k5tsm1.cloudfront.net';

export const CLOUDFRONT_URL = (
  process.env.EXPO_PUBLIC_CLOUDFRONT_URL || DEFAULT_CLOUDFRONT_URL
).replace(/\/$/, '');

export const COURSE_CLOUDFRONT_URL = (
  process.env.EXPO_PUBLIC_COURSE_CLOUDFRONT_URL || DEFAULT_COURSE_CLOUDFRONT_URL
).replace(/\/$/, '');

function safelyDecodeUriComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function assetUrl(key?: string | null, baseUrl = CLOUDFRONT_URL) {
  const value = typeof key === 'string' ? key.trim() : '';
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

  return `${baseUrl.replace(/\/$/, '')}/${cleanKey}`;
}

export function cloudfrontAssetUrl(key?: string | null) {
  return assetUrl(key, CLOUDFRONT_URL);
}

export function courseAssetUrl(key?: string | null) {
  return assetUrl(key, COURSE_CLOUDFRONT_URL);
}
