var g_config = {};

function initConfig(ENV) {
  if (ENV === 'dev')
    g_config.baseUrl = 'http://localhost:3000';
  else
    g_config.baseUrl = 'http://spedish.com:4000';
}
