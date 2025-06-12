import { Installation as DBInstallation } from '@prisma/client';

import { Installation } from './route';

export const mapInstallation = (installation: DBInstallation): Installation => {
  return {
    id: installation.id,
    installationId: installation.installationId,
    type: installation.type as 'Organization' | 'User',
    name: installation.githubName,
  };
};
