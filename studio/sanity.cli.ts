import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: '3gwdnd3t', dataset: 'production' },
  // Where `npm run deploy` publishes the Studio: https://medievalismes.sanity.studio
  deployment: { appId: 'tfiyj0l4h9l8gromzsn9qiux' },
});
