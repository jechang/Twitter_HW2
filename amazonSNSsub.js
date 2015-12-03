var AWS = require('aws-sdk'); 
var util = require('util');
var async = require('async');
//var config = require('./config.json');
var fs = require('fs');
var nconf = require('nconf');

nconf.argv().env().file({ file: './config.json' });

// configure AWS
AWS.config.update({
    region: nconf.get('amazon:region'),
    accessKeyId: nconf.get('amazon:accessKeyId'),
    secretAccessKey: nconf.get('amazon:secretAccessKey')
});

var sns = new AWS.SNS();





/*
function createTopic(cb) {
  sns.createTopic({
    'Name': 'demo'
  }, function (err, result) {

    if (err !== null) {
      console.log(util.inspect(err));
      return cb(err);
    }
    console.log(util.inspect(result));

    config.TopicArn = result.TopicArn;

    cb();
  });
}
*/


function snsSubscribe(cb) {
  sns.subscribe({
    'TopicArn': 'arn:aws:sns:us-west-1:691569146434:twitter',
    'Protocol': 'http',
    'Endpoint': 'http://twitterstreamhw2v3-env.elasticbeanstalk.com' //'arn:aws:sqs:us-west-1:691569146434:twitterSNS'
  }, function (err, result) {

    if (err !== null) {
      console.log(util.inspect(err));
      return cb(err);
    }

    console.log(util.inspect(result));

    cb();
  });

}

async.series([snsSubscribe]);
//snsSubscribe();