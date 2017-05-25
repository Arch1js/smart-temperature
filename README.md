## Arduino smart temperature meter

My first IoT project using Arduino UNO R3.

## Setup
Arduino with a small thermistor (for measuring ambient temperature), alphanumeric LCD display (for displaying temperature in Celsius and Fahrenheit) and a small DC motor (for cooling)
![Setup](http://lmsotfy.com/so.png)

Tech -
Node.js,
Johnny-Five (JavaScript Robotics & IoT platform) http://johnny-five.io/
Firebase Cloud Messaging (FCM) https://firebase.google.com/docs/cloud-messaging/
PubNub https://www.pubnub.com/

## What's the idea?
The basic idea was to measure the ambient temperature of the room and send notifications to my phone if temperature falls outside set limits.
Using node and johnny-five library to read data from arduino and attached temperature sensor, we can then do something with this data, like sending
notifications to my phone using FCM or PubNub to display a real-time data using web application (still work in progress...).
Extension to this project includes a small 3-6V DC motor with a fan blades attached. So whenever temperature is too high, it will switch on the ventilator in attempt to lower the temperature (and cool me :D).

Android application (for displaying notifications on my phone) was forked from https://github.com/adhishlal/FirebaseNotifications. I made a few modifications to it and will create a separate repo for it later.
![Notification](https://image.ibb.co/ecJYDF/Screenshot_20170525_111341.png)

## What's next?
Continue to work on a web application that will provide a real-time data from the sensors and motor.
