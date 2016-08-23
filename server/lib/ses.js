var ses = require('node-ses')
var config = require('config');

var client = ses.createClient({ key: config.get('server.awsKeys.aws_access_key_id'),
                                secret: config.get('server.awsKeys.aws_secret_access_key'),
                                amazon: config.get('server.awsKeys.region') });
module.exports = {
  getClient: function(){
    return client;
  }
}
