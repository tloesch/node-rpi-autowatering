const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Config = require('./src/Config.js');
const Logger = require('./src/Logger.js');
const GpioPump = require('./src/Gpio/Pump.js');
const GpioMoistureSensor = require('./src/Gpio/MoistureSensor.js');

let logger = new Logger();
let config = new Config();
let pump = new GpioPump(config.GPIO.PUMP);
let moistureSensor = new GpioMoistureSensor(config.GPIO.MOISTURE_SENSOR);

config.setLogger(logger);
//pump.setLogger(logger);
moistureSensor.setLogger(logger);


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('configUpdated', config);

    socket.on('disconnect', () => console.log('user disconnected'));
});

logger.onLog = (message, type) => {
    console.log('[' + type + ']', message);
    io.emit('messageLogged', message, type);
};

let onNewMoistureSensorValue = (value) => {
    let isWet = (value <= config.IS_WET_THRESHOLD);
    if(config.IS_AUTOWATERING_ENABLED && !isWet) {
        logger.info('Turning on pump for consecutive watering');
        for(let i = 0; i < config.NUMBER_OF_CONSECUTIVE_WATERING; i++) {
            setTimeout(() => pump.activateForServeralTime(1000), config.CONSECUTIVE_WATERING_INTERVAL * (i + 1));
        }
    }
    io.emit('newMoistureSensorValue', value);
}

moistureSensor.startContinuouslyReading(onNewMoistureSensorValue, config.MOISTURE_SENSOR_UPDATE_INTERVAL);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/config/update', (req, res) => {
    config.update(req.body);
    moistureSensor.stopContinuouslyReading();
    moistureSensor.startContinuouslyReading(onNewMoistureSensorValue, config.MOISTURE_SENSOR_UPDATE_INTERVAL);
    io.emit('configUpdated', config);
    return res.send(config.getConfigObject());
});

app.post('/autowatering/on', (req, res) => {
    config.update({IS_AUTOWATERING_ENABLED: true});
    logger.info('Autowatering turned on!');
    io.emit('configUpdated', config);
    return res.send(true);
});

app.post('/autowatering/off', (req, res) => {
    config.update({IS_AUTOWATERING_ENABLED: false});
    logger.info('Autowatering turned off!');
    io.emit('configUpdated', config);
    return res.send({message: 'Pump could continue tu run for about ' + (config.CONSECUTIVE_WATERING_INTERVAL * config.NUMBER_OF_CONSECUTIVE_WATERING / 1000) + ' seconds!'});
});




app.post('/pump/on', (req, res) => {
    pump.on();
    return res.send(true);
});

app.post('/pump/off', (req, res) => {
    pump.off();
    return res.send(true);
});

app.get('/moiusturesensor/value', (req, res) => {
    return res.send(moistureSensor.getValue());
});

app.get('/config', (req, res) => {
    return res.send(config.getConfigObject());
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});