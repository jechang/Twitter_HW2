var twitter = require('twitter');
var mysql = require('mysql');
var aws = require( "aws-sdk" );

var fs = require('fs');
var nconf = require('nconf');

nconf.argv().env().file({ file: './config.json' });

// Create an instance of our SQS Client.
var sqs = new aws.SQS({
    region: nconf.get('amazon:region'),
    accessKeyId: nconf.get('amazon:accessKeyId'),
    secretAccessKey: nconf.get('amazon:secretAccessKey')
});

// Start Amazon RDS mySQL connection
var connection = mysql.createConnection({
  host     : 'twitterdb.cvszelfjqssa.us-west-1.rds.amazonaws.com',
  user     : 'Jonathan',
  password : 'amazoncloud',
  port     : '3306',
  database : 'MyTwitterStream'
});

connection.connect(function(err){
  if(!err) {
      console.log("Connected to SQL database ... \n");  
  } else {
      console.log("Error connecting to database ... \n");  
  }
});

var sqlQuery = 'CREATE TABLE IF NOT EXISTS TWEETS (sn VARCHAR(255) not NULL,  status VARCHAR(255) default NULL,  latitude VARCHAR(255) default NULL,  longitude VARCHAR(255) not NULL,  category VARCHAR(255) not NULL,  PRIMARY KEY ( sn ))'
    connection.query(sqlQuery, function(err, result) {
		if (err) throw err;

		console.log('Table created or already created.');
	});
// End Amazon RDS mySQL connection

var client = new twitter({
  consumer_key: nconf.get('twitter:consumer_key'),
  consumer_secret: nconf.get('twitter:consumer_secret'),
  access_token_key: nconf.get('twitter:access_token_key'),
  access_token_secret: nconf.get('twitter:access_token_secret')
});

client.stream('statuses/filter', {track: 'the, and, is, a, for, in, to, he, on, do, that', language: 'en'}, function(stream) { //Hillary Clinton, Donald Trump, Ben Carson, Carly Fiorina, Bernie Sanders
  stream.on('data', function(tweet) {
    //console.log(tweet.text);
    if (tweet.coordinates != null) {
    	console.log('tweet: ' + JSON.stringify(tweet, null, 4) + '\n \n');

    	console.log('latitude: ' + tweet.geo.coordinates[0] + ' longitude: ' + tweet.geo.coordinates[1]);


      var msg = { text: tweet.text, lat: tweet.geo.coordinates[0], lon: tweet.geo.coordinates[1] };

      // Send message to Amazon SQS
      var sqsParams = {
          MessageBody: JSON.stringify(msg),
          QueueUrl: nconf.get('amazon:QueueUrl')
      };

      sqs.sendMessage(sqsParams, function(err, data) {
          if (err) {
              console.log('ERR', err);
          }

          console.log('Sent message to Amazon SQS: ' + JSON.stringify(msg))
          console.log(data);
      });


	}
    //console.log('tweet screen name: ' + tweet.user.screen_name + '\n \n \n');
   	
    /*
    // Insert tweet into SQL database
    var sqlQuery = {sn: tweet.user.screen_name, status: tweet.text, latitude: tweet.geo.coordinates[0], longitude: tweet.geo.coordinates[1], category: 'test'};
    connection.query('INSERT INTO TWEETS SET ?', sqlQuery, function(err, result) {
  		if (err) throw err;

  		console.log(result.insertId);
	  });
	  // End of inserting tweet into database
	  */

  });
 
  stream.on('error', function(error) {
    throw error;
  });
});

//SQL statement:
//"INSERT INTO TWEETS (sn, status, latitude, longitude, category) VALUES('" + tweet_sn + "', '" + tweet_status + "', '" + tweet_lat +  "', '" + tweet_lon + "', 'Clinton')"
// "CREATE TABLE IF NOT EXISTS TWEETS (sn VARCHAR(255) not NULL,  status VARCHAR(255) default NULL,  latitude VARCHAR(255) default NULL,  longitude VARCHAR(255) not NULL,  category VARCHAR(255) not NULL,  PRIMARY KEY ( sn ))"