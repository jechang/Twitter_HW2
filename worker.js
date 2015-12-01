var aws = require( "aws-sdk" );
var AlchemyAPI = require('alchemy-api');

var fs = require('fs');
var nconf = require('nconf');

nconf.argv().env().file({ file: './config.json' });

var alchemy = new AlchemyAPI(nconf.get('alchemy:key'));

// configure AWS
aws.config.update({
    region: nconf.get('amazon:region'),
    accessKeyId: nconf.get('amazon:accessKeyId'),
    secretAccessKey: nconf.get('amazon:secretAccessKey')
});

var sqs = new aws.SQS();

// Declare a new SNS object
var sns = new aws.SNS();

// SNS publish function
function publish(mesg) {
  var publishParams = { 
    TopicArn : 'arn:aws:sns:us-west-1:691569146434:twitter',
    Message: mesg
  };

  sns.publish(publishParams, function(err, data) {
    process.stdout.write(".");
    //console.log(data);
  });
}


// Need to repeat recieve message with a interval

setInterval(function() {


  sqs.receiveMessage({
     QueueUrl: nconf.get('amazon:QueueUrl'),
     MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
     VisibilityTimeout: 60, // seconds - how long we want a lock on this job
     WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
   }, function(err, data) {
     // If there are any messages to get
     if (data.Messages) {
        // Get the first message (should be the only one since we said to only get one above)
        var message = data.Messages[0],
        body = JSON.parse(message.Body);
        // Now this is where you'd do something with this message
        //doSomethingCool(body, message);  // whatever you wanna do

        console.log('Recieved message from Amazon SQS: ' + JSON.stringify(message.Body) + body.text)

        // Delete the message from the queue
        removeFromQueue(message);
        console.log('Recieved message deleted from Amazon SQS')

        // Process message with Alchemy API
        alchemy.sentiment(body.text, {}, function(err, response) {
          //if (err) throw err;

          // See http://www.alchemyapi.com/api/ for format of returned object
          var sentiment = response.docSentiment;

          console.log('Alchemy API determined message: |' + body.text + '| has sentiment: ' + sentiment.type + ', with score: ' + sentiment.score);
          

          // Send Amazon SNS message to update all UI with a marker and a sentiment for a tweet
          var msg = { text: body.text, lat: body.lat, lon: body.lon, sentiment: sentiment.type, score: sentiment.score};
          publish(JSON.stringify(msg));
          console.log('Just published SNS message: ' + JSON.stringify(msg));

        });
     }
   });


console.log("--- Interval ---"); }, 5000);


/*
processTweet();


var processTweet = function(message) {
  sqs.receiveMessage({
     QueueUrl: 'https://sqs.us-west-1.amazonaws.com/691569146434/twitter',
     MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
     VisibilityTimeout: 60, // seconds - how long we want a lock on this job
     WaitTimeSeconds: 3 // seconds - how long should we wait for a message?
   }, function(err, data) {
     // If there are any messages to get
     if (data.Messages) {
        // Get the first message (should be the only one since we said to only get one above)
        var message = data.Messages[0],
        body = JSON.parse(message.Body);
        // Now this is where you'd do something with this message
        //doSomethingCool(body, message);  // whatever you wanna do

        console.log('Recieved message from Amazon SQS: ' + JSON.stringify(message.Body) + body.text)

        // Delete the message from the queue
        removeFromQueue(message);
        console.log('Recieved message deleted from Amazon SQS')

        // Process message with Alchemy API
        alchemy.sentiment(body.text, {}, function(err, response) {
          if (err) throw err;

          // See http://www.alchemyapi.com/api/ for format of returned object
          var sentiment = response.docSentiment;

          console.log('Alchemy API determined message: |' + body.text + '| has sentiment: ' + sentiment.type + ', with score: ' + sentiment.score);

          // Send Amazon SNS message to update all UI with a marker and a sentiment for a tweet
          var msg = { text: body.text, lat: body.lat, lon: body.lon };
          publish(JSON.stringify(msg));
          console.log('Just published SNS message: ' + JSON.stringify(msg));

        });
     }
   });
};
*/



// SQS remove message from queue function
var removeFromQueue = function(message) {
   sqs.deleteMessage({
      QueueUrl: nconf.get('amazon:QueueUrl'),
      ReceiptHandle: message.ReceiptHandle
   }, function(err, data) {
      // If we errored, tell us that we did
      err && console.log(err);
   });
};
