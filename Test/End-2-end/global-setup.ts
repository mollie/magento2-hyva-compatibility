/*
 * Copyright Magmodules.eu. All rights reserved.
 * See COPYING.txt for license details.
 */

import { type FullConfig } from '@playwright/test';
import { getAdminToken } from './support/magento-rest';

const ADMIN_USERNAME = process.env.MAGENTO_ADMIN_USERNAME ?? 'exampleuser';
const ADMIN_PASSWORD = process.env.MAGENTO_ADMIN_PASSWORD ?? 'examplepassword123';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  process.env.admin_token = await getAdminToken(baseURL!, ADMIN_USERNAME, ADMIN_PASSWORD);
}

export default globalSetup;
