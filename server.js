//Setup web server and socket
var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

var twitter = require('twitter');
var fs = require('fs');
var nconf = require('nconf');

nconf.argv().env().file({ file: './config.json' });

//var unirest = require('unirest');

var client = new twitter({
  consumer_key: nconf.get('twitter:consumer_key'),
  consumer_secret: nconf.get('twitter:consumer_secret'),
  access_token_key: nconf.get('twitter:access_token_key'),
  access_token_secret: nconf.get('twitter:access_token_secret')
});

//var bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//app.use(bodyParser());
//app.use(bodyParser.json({ type: 'application/*+json' }));

var interval;

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup routing for app
app.use(express.static(__dirname + '/public'));




/*
// Added to accept SNS http endpoint POST request
// accept POST request on the homepage
app.post('/', function (req, res) {
  res.send('Got a POST request to add a marker to the map');
  console.log('Got a POST request with body: ' + JSON.stringify(req.body));
  console.log('Got a POST request with body: ' + req.body);
  //console.log('Got a POST request with body: ' + JSON.stringify(res));
  // Take message and send marker to UI with sentiment

  // http://stackoverflow.com/questions/18484775/how-do-you-access-an-amazon-sns-post-body-with-express-node-js
  var bodyarr = []
  req.on('data', function(chunk){
    bodyarr.push(chunk);
  })  
  req.on('end', function(){
    var msg = bodyarr.join('')
    //console.log( bodyarr.join('') )
    var obj = JSON.parse(msg);
    console.log(JSON.stringify(msg));
    console.log(obj.Message);
    //console.log(msg.type())
    //var outputPoint = {"lat": obj.Message.lat,"lng": obj.Message.lon};
    //socket.emit('add marker', outputPoint);




    //var Request = unirest.get('http://mockbin.com/request');
  })  
  

  //var msg_string = msg.toString();

  //var obj = JSON.parse(msg);

  //console.log('Parsed JSON message: ' + msg);

});
*/







//Create web sockets connection.
io.sockets.on('connection', function (socket) {
  console.log("Server recieved connection...");

  socket.on("start tweets", function(data) {
    console.log("Server is starting tweets...");


    ///*
    // **************** Testing POST ****************
    app.post('/', function (req, res) {
      res.send('Got a POST request to add a marker to the map');
      console.log('Got a POST request to add a marker to the map');
      //console.log('Got a POST request with body: ' + JSON.stringify(req.body));
      // Take message and send marker to UI with sentiment

      // http://stackoverflow.com/questions/18484775/how-do-you-access-an-amazon-sns-post-body-with-express-node-js
      var bodyarr = []
      req.on('data', function(chunk){
        bodyarr.push(chunk);
      })  

      req.on('end', function(){
        var msg = bodyarr.join('')
        //console.log( bodyarr.join('') )
        var obj = JSON.parse(msg);
        console.log(JSON.stringify(msg));
        console.log(obj.Message);
        //console.log(msg.type())

        var obj2 = JSON.parse(obj.Message);

        console.log('Recieved marker with latitude: ' + obj2.lat + ' and longitude: ' + obj2.lon + ' and sentiment: ' + obj2.sentiment);
        var outputPoint = {"lat": obj2.lat,"lng": obj2.lon, "sentiment": obj2.sentiment};
        socket.emit('add marker', outputPoint);
        console.log('Sent marker through socket to plot on UI.');
      })  
    });
    // **************** Testing POST ****************
    //*/




    //console.log(data);
    //console.log(data.keyword);

    clearInterval(interval);
    
    //var outputPoint = {"lat": rows[i].latitude,"lng": rows[i].longitude};
    //socket.broadcast.emit("add marker", outputPoint);
    //Send out to web sockets channel.
    //socket.emit('add marker', outputPoint);
    //console.log('Server just sent new marker...');    



    /*
    interval = setInterval(function(){
      console.log('Checking for new tweets...');

    }, 3000)
    */

  
  });

  socket.on("start trends", function(data) {
    console.log("Server is starting trends with trend keyword: " + data.keyword);

    //var topic = 'hello';
    if (data.keyword == "New York City") {
      var loc = '2459115';
    }
    else if (data.keyword == "Los Angeles") {
      var loc = '2442047'; 
    }
    else if (data.keyword == "Chicago") {
      var loc = '2379574'; 
    }
    
    client.get('trends/place', {id: loc}, function(error, tweets, response){
       //console.log(tweets.trends[1].name);
       //console.log(response.body);
       if (error) return error;

       var topic = JSON.stringify(tweets[0].trends[0].name);
       var topic2 = JSON.stringify(tweets[0].trends[1].name);
       var topic3 = JSON.stringify(tweets[0].trends[2].name);
       console.log(topic);

       var obj = {t1: topic, t2: topic2, t3: topic3};
       var str = JSON.stringify(obj);

       socket.emit("show trends", str);
    });



  
  });

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    socket.emit("connected");
    console.log("Server emitting connected...");
});


