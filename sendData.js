var pubnubConfig = require("./pubnubConfig.json");
class Pubnub {

  publish(celsius, fahrenheit, messagecount, alert, warningCount, upper, lower) {
    var data = {C:celsius, F:fahrenheit, M:messagecount, A:alert, W:warningCount, U: upper, L:lower};

    var pubnub = require('pubnub').init({
      publish_key: pubnubConfig.publish_key,
      subscribe_key: pubnubConfig.subscribe_key,
      ssl: true
    });

    pubnub.publish({
        channel: 'smart-temp',
        message: data,
        success : function(details) {
            console.log(details)
        }});
      }
}

module.exports = Pubnub;
