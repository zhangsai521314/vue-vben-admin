import type { GlobConfig } from '#/config';

import { getAppEnvConfig } from '@/utils/env';

export const useGlobSetting = (): Readonly<GlobConfig> => {
  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_APP_TITLE_EN,
    VITE_GLOB_APP_TITLE_FR,
    VITE_GLOB_API_URL,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_UPLOAD_URL,
    VITE_GLOB_MQTT,
    VITE_GLOB_APP_VERSION,
  } = getAppEnvConfig();

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    title: VITE_GLOB_APP_TITLE,
    titleEn: VITE_GLOB_APP_TITLE_EN,
    titleFr: VITE_GLOB_APP_TITLE_FR,
    apiUrl: VITE_GLOB_API_URL,
    shortName: VITE_GLOB_APP_TITLE.replace(/\s/g, '_').replace(/-/g, '_'),
    urlPrefix: VITE_GLOB_API_URL_PREFIX,
    uploadUrl: VITE_GLOB_UPLOAD_URL,
    mqttConfig: VITE_GLOB_MQTT,
    version: VITE_GLOB_APP_VERSION,
  };
  return glob as Readonly<GlobConfig>;
};
