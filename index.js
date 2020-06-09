const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Config = require('./src/Config.js');
const GpioPump = require('./src/Gpio/Pump.js');
const GpioMoistureSensor = require('./src/Gpio/MoistureSensor.js');


let config = new Config();
let pump = new GpioPump(config.GPIO.PUMP);
let moistureSensor = new GpioMoistureSensor(config.GPIO.MOISTURE_SENSOR);


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('configChanged', config);

    socket.on('disconnect', () => console.log('user disconnected'));
});


moistureSensor.startContinuouslyReading((value) => {
    let isWet = (value <= config.IS_WET_THRESHOLD);
    if(config.IS_AUTOWATERING_ENABLED && !isWet) {
        for(let i = 0; i < config.NUMBER_OF_CONSECUTIVE_WATERING; i++) {
            setTimeout(() => pump.activateForServeralTime(1000), config.CONSECUTIVE_WATERING_INTERVAL * (i + 1));
        }
    }
    io.emit('newMoistureSensorValue', value);
}, config.MOISTURE_SENSOR_UPDATE_INTERVAL);


app.use(express.static('public'));
http.listen(3000, () => {
    console.log('listening on *:3000');
});