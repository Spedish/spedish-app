var ses = require('node-ses')
var config = require('config');

var client = ses.createClient({ key: config.get('server.awsKeys.aws_access_key_id'),
                                secret: config.get('server.awsKeys.aws_secret_access_key'),
                                amazon: config.get('server.awsKeys.region') });
module.exports = {
  send: function(to, subject, message, next){
  // Give SES the details and let it construct the message for you.
  return client.sendEmail({
       to: to
     , from: 'huaxi.wang@gmail.com'
     , cc: ''
     , subject: subject
     , message: message
     , altText: 'plain text'
    }, next);
  }
}
