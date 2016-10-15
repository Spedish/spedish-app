var ses = require('node-ses')
var config = require('config');

var client = ses.createClient({ key: config.get('server.awsKeys.aws_access_key_id'),
                                secret: config.get('server.awsKeys.aws_secret_access_key'),
                                amazon: config.get('server.awsKeys.region') });
module.exports = {
  send: function(user, subject, message, next){
  // Give SES the details and let it construct the message for you.
  return client.sendEmail({
       to: user.email
     , from: 'notification@spedish.com'
     , cc: ''
     , subject: "🍲spedish: " + subject
     , message: `Hi ${user.firstname},<br /><br />${message}<br /><br />With ❤️,<br />Your spedish team`
     , altText: 'plain text'
    }, next);
  }
}
