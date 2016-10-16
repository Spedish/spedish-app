var g_config = {};

function initConfig(ENV) {
  if (ENV === 'dev') {
    g_config.baseUrl = 'http://localhost:3000';
    //g_config.baseUrl = 'http://spedish.com:3000';
    g_config.galleryUrl = g_config.baseUrl + '/gallery';
    g_config.embeddedMapUrl = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyAmcQ7vueZSiF2EHTBSzpTk-A0X6wkjW-s&q=';
  } else {
    g_config.baseUrl = 'http://localhost:4000';
    g_config.galleryUrl = g_config.baseUrl + '/gallery';
    // TODO: Need to apply for a API key for prod mode
    g_config.embeddedMapUrl = '';
    //g_config.baseUrl = 'http://spedish.com:4000';
  }
}
