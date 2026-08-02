import { Linking, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { cloudfrontAssetUrl } from '@/lib/cloudfront';

const CERTIFICATE_FOLDER = 'RH Healthcare';
const CERTIFICATE_MIME_TYPE = 'application/pdf';

export function getCertificateUrl(certificatePath?: string | null) {
  return cloudfrontAssetUrl(certificatePath);
}

export function getCertificateFileName(title: string, id: string) {
  const cleanTitle = title
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const cleanId = id.replace(/[^a-z0-9-]+/gi, '').toLowerCase();

  return `${cleanTitle || 'certificate'}-${cleanId || Date.now()}.pdf`;
}

export async function viewCertificate(url: string) {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('Certificate URL is missing');
  }

  const canOpen = await Linking.canOpenURL(cleanUrl);
  if (!canOpen) {
    throw new Error('Unable to open certificate');
  }

  await Linking.openURL(cleanUrl);
}

export async function downloadCertificate(url: string, fileName: string) {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    throw new Error('Certificate URL is missing');
  }

  if (Platform.OS === 'web') {
    await Linking.openURL(cleanUrl);
    return;
  }

  if (Platform.OS === 'android') {
    const response = await ReactNativeBlobUtil.config({
      fileCache: true,
      appendExt: 'pdf',
    }).fetch('GET', cleanUrl, {
      Accept: CERTIFICATE_MIME_TYPE,
    });

    const status = response.info().status;
    if (status < 200 || status >= 300) {
      response.flush();
      throw new Error(`Download failed with status ${status}`);
    }

    await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      {
        name: fileName,
        parentFolder: CERTIFICATE_FOLDER,
        mimeType: CERTIFICATE_MIME_TYPE,
      },
      'Download',
      response.path()
    );
    response.flush();
    return;
  }

  const { dirs } = ReactNativeBlobUtil.fs;
  const downloadPath = `${dirs.DocumentDir}/${fileName}`;
  const response = await ReactNativeBlobUtil.config({
    fileCache: true,
    path: downloadPath,
  }).fetch('GET', cleanUrl, {
    Accept: CERTIFICATE_MIME_TYPE,
  });

  const status = response.info().status;
  if (status < 200 || status >= 300) {
    response.flush();
    throw new Error(`Download failed with status ${status}`);
  }

  ReactNativeBlobUtil.ios.openDocument(response.path());
}
