var channel = 'smart-temp';
var admin = require("firebase-admin");
var five = require("johnny-five");

var upper = 27.0; //upper temperature limit
var lower = 20.0; //lower temperature limit
var topic = "temp";
var lcd;
var payload;
var messagecount = 0;
var warningCount = 0;
var ventilatorSpeed = 200;
var alert = false;
var override = false;
var notify = true;

var options = { //notification options
  priority: "high",
  collapseKey: "Temeparture notification",
  timeToLive: 60 * 60
};

five.Board({ port: "COM3" }).on('ready', function() {
  console.log('ready');

  new five.Motor([5, 4, 3]);

var motor = new five.Motor({
  pins: {
    pwm:5,
    dir:4,
    cdir: 3
  }
});

  var serviceAccount = require("./serviceAccountKey.json");

  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tempnotifications-52936.firebaseio.com"
  });

  var pubnub = require('pubnub').init({
    publish_key: 'pub-c-5cc5e25e-47ef-46d1-b602-5eeb96c0ee6c',
    subscribe_key: 'sub-c-7c93f858-3a44-11e7-887b-02ee2ddab7fe',
    ssl: true
  });

  lcd = new five.LCD({
  pins: [7, 8, 9, 10, 11, 12],
  backlight: 6,
  rows: 2,
  cols: 20
  });

  var temperature = new five.Thermometer({
    pin: "A0",
    freq: 3000
  });

  pubnub.subscribe({
    channel: "smart-temp2",
    callback: setValues,
    error: function(err) {console.log(err);}
  });

  pubnub.subscribe({
    channel: "smart-temp3",
    callback: updateLimits,
    error: function(err) {console.log(err);}
  });

  function updateLimits(m) {
    var newUpperLimit = m.up;
    var newLowerLimit = m.lo;

    if(newUpperLimit == undefined) {
      lower = newLowerLimit;
    }
    else if (newLowerLimit == undefined) {
      upper = newUpperLimit
    }
    else if (newUpperLimit == undefined && newLowerLimit == undefined) {
      //do nothing
    }
    else {
      upper = newUpperLimit;
      lower = newLowerLimit;
    }
  }

  // function switchVentilator(m) {
  //   console.log("m message " + m);
  //   if(m == "true") {
  //     override = true;
  //     motor.reverse(ventilatorSpeed);
  //   }
  //   else if(m == "false") {
  //     override = false;
  //     motor.stop();
  //   }
  // }

  function setValues(m) {
    if(m != "" || m != undefined) {
      if(m == "fast") {
        ventilatorSpeed = 200;
      }
      else if (m == "medium") {
        ventilatorSpeed = 128;
      }
      else if (m == "slow") {
        ventilatorSpeed = 90;
      }
    }
    else {
      console.log("Ventilator speed undefined!");
    }
  }

  temperature.on("change", function() {
    var results = convertTemp(this);
    var celsius = results.C;
    var fahrenheit = results.F;
    var data;

    messagecount ++;

    if(celsius > upper) {
      alert = true;
      motor.reverse(ventilatorSpeed);
      setPayload(celsius, upper);

      if(notify == true) {
        sendNotification();
        notify = false;
        setTimeout(allowNotifications, 600000); //hold on sending notification for 10 minutes
      }

      warningCount ++;
    }
    else if(celsius < lower) {
      alert = true;
      setPayload(celsius, lower);

      if(notify == true) {
        sendNotification();
        notify = false;
        console.log("setting to false");
        setTimeout(allowNotifications, 600000);
      }
      warningCount ++;
    }
    else {
      alert = false;
      motor.stop();
    }

    publish(celsius, fahrenheit);

    lcd.clear();
    lcd.print("C " + results.C);
    lcd.cursor(1, 0);
    lcd.print("F " + results.F);
  });

  function allowNotifications() {
    notify = true;
  }

  function setPayload(celsius, limit) {
    payload = {
      notification: {
        title: "Room temperature warning",
        body: "Celsius: " + celsius + " (limit - " + limit + "). Starting ventilation!"
      }
    };
  }
  function publish(celsius, fahrenheit) {
    var data = {C:celsius, F:fahrenheit, M:messagecount, A:alert, W:warningCount, U: upper, L:lower};

    pubnub.publish({
        channel: 'smart-temp',
        message: data,
        success : function(details) {
            console.log(details)
        }});
      }

  function sendNotification() {
    admin.messaging().sendToTopic(topic, payload, options)
      .then(function(response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
      });
  }

  function convertTemp(object) {
    console.log(object.C);
    var tempK = Math.log(10000.0 * ((1024.0 / object.C - 1)));
    tempK = (1 / (0.001129148 + (0.000234125 + (0.0000000876741 * tempK * tempK )) * tempK )).toFixed(2); //  Temp Kelvin
    console.log("Kelvin: " + tempK);
    var tempC = (tempK - 273.15).toFixed(2);// Convert Kelvin to Celcius
    console.log("Celsius: " + tempC);
    var tempF = ((tempC * 9.0)/ 5.0 + 32.0).toFixed(2); // Convert Celcius to Fahrenheit
    console.log("Farenheit: " + tempF);

    var results = {C:tempC, F:tempF, K:tempK};
    return results;
  }
});
