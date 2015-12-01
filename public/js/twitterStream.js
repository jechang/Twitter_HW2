var selectedkeyword;
var liveTweets;
var URL = 'http://twitterstreamhw2-env.elasticbeanstalk.com'; // EBS url for socket.io connections
//var URL = 'http://localhost:8081';

function initialize() {
  console.log('Initializing Google Map...')

  // Setup Google Map
  var myLatlng = new google.maps.LatLng(39.5,-98.35);

  

  // Google Map Snazzy Styles
  var light_grey_style = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#193341"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c5a71"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#29768a"},{"lightness":-37}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#3e606f"},{"weight":2},{"gamma":0.84}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"weight":0.6},{"color":"#1a3541"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#2c5a71"}]}];
  //var light_grey_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];
  //var light_grey_style = [{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}]
  //var light_grey_style = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]
  
  var myOptions = {
    zoom: 5,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.LEFT_BOTTOM
    },
    styles: light_grey_style
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
  
  // Setup heat map and link to Twitter array we will append data to
  var heatmap;
  liveTweets = new google.maps.MVCArray();
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: liveTweets,
    radius: 25
  });
  heatmap.setMap(map);
  // End setting up Google Map

  if(io !== undefined) {
    // Storage for WebSocket connections
    var socket = io.connect(URL); //Jonathan enter in localhost address
    //var socket = io.connect('http://twitterstreamhw2-env.elasticbeanstalk.com');

    // This listens on the "twitter-steam" channel and data is 
    // received everytime a new tweet is receieved.
    socket.on('add marker', function (data) {
      
      //Add tweet to the heat map array.
      var tweetLocation = new google.maps.LatLng(data.lat,data.lng);
      liveTweets.push(tweetLocation);

      //Flash a dot onto the map quickly

      if (data.sentiment == "positive") {
        var image = "css/green.png";
        console.log("postive sentiment recieved");
      }

      else if (data.sentiment == "negative") {
        var image = "css/red.png";
        console.log("negative sentiment recieved");
      }

      else if (data.sentiment == "neutral") {
        var image = "css/blue.png";
        console.log("negative sentiment recieved");
      }

      //var image = "css/green.png";
      var marker = new google.maps.Marker({
        position: tweetLocation,
        map: map,
        icon: image
      });
      setTimeout(function(){
        marker.setMap(null);
      },600);

    });



    // Recieve trending topics and display them on UI
    socket.on('show trends', function (data) {
      console.log("Recieved trends: " + data)

      obj = JSON.parse(data);
      topic1 = obj.t1;
      topic2 = obj.t2;
      topic3 = obj.t3;
      document.getElementById("trend").innerText = '\n' + topic1 + '\n\n' + topic2 + '\n\n' + topic3;
    });






    // Listens for a success response from the server to 
    // say the connection was successful.
    socket.on("connected", function(r) {

      //Now that we are connected to the server let's tell 
      //the server we are ready to start receiving tweets.

      //socket.emit("start tweets");
    });
  }
}

function myFunction() {
    var x = document.getElementById("mySelect").selectedIndex;
    var y = document.getElementById("mySelect").options;
    //alert("Index: " + y[x].index + " is " + y[x].text);

    if (y[x].text == 'New York City') {

      while(liveTweets.getLength() > 0) liveTweets.pop(); // Clear current markers on map 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect(URL);
      socket.emit("start trends", { keyword: "New York City" });
      socket.emit("start tweets");
    }

    else if (y[x].text == 'Los Angeles') {

      while(liveTweets.getLength() > 0) liveTweets.pop(); // Clear current markers on map 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect(URL);
      socket.emit("start trends", { keyword: "Los Angeles" });
      socket.emit("start tweets");
    }

    else if (y[x].text == 'Chicago') {
      //alert("Trump selected!");

      while(liveTweets.getLength() > 0) liveTweets.pop(); // Clear current markers on map 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect(URL);
      socket.emit("start trends", { keyword: "Chicago" });
      socket.emit("start tweets");
    }

    else if (y[x].text == 'Carson') {
      //alert("Trump selected!");

      while(liveTweets.getLength() > 0) liveTweets.pop(); 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect('http://twittermapjc4267-env.elasticbeanstalk.com');
      socket.emit("start tweets", { keyword: "Carson" });
    }

    else if (y[x].text == 'Fiorina') {
      //alert("Trump selected!");

      while(liveTweets.getLength() > 0) liveTweets.pop(); 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect('http://twittermapjc4267-env.elasticbeanstalk.com');
      socket.emit("start tweets", { keyword: "Fiorina" });
    }

    else if (y[x].text == 'Christie') {
      //alert("Trump selected!");

      while(liveTweets.getLength() > 0) liveTweets.pop(); 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect('http://twittermapjc4267-env.elasticbeanstalk.com');
      socket.emit("start tweets", { keyword: "Christie" });
    }

    else if (y[x].text == 'Bush') {
      //alert("Trump selected!");

      while(liveTweets.getLength() > 0) liveTweets.pop(); 
      //var socket = io.connect('http://localhost:8081');
      var socket = io.connect('http://twittermapjc4267-env.elasticbeanstalk.com');
      socket.emit("start tweets", { keyword: "Bush" });
    }
}