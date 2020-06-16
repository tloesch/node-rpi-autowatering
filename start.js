const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const basicAuth = require('express-basic-auth');

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

if(config.BASIC_AUTH.ENABLED) {
    let users = {};
    users[config.BASIC_AUTH.USERNAME] = config.BASIC_AUTH.PASSWORD;
    app.use(basicAuth({
        users: users,
        challenge: true,
    }));
}



io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('configUpdated', config.getPublicConfigObject());
    socket.emit('pumpToggled', pump.isActivated());
    socket.on('disconnect', () => console.log('user disconnected'));
});

logger.onLog = (message, type) => {
    console.log('[' + type + ']', message);
    io.emit('messageLogged', message, type);
};

let onNewMoistureSensorValue = (value) => {
    let isWet = (value <= config.IS_WET_THRESHOLD);
    if(config.IS_AUTOWATERING_ENABLED && !isWet) {
        logger.action('Turning on pump for consecutive watering');
        pump.activatePumpConsecutively(config.NUMBER_OF_CONSECUTIVE_WATERING, config.CONSECUTIVE_WATERING_INTERVAL);
    }
    io.emit('newMoistureSensorValue', value);
}

moistureSensor.startContinuouslyReading(onNewMoistureSensorValue, config.MOISTURE_SENSOR_UPDATE_INTERVAL);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/jquery/dist'));

app.post('/config/update', (req, res) => {
    config.update(req.body);
    moistureSensor.stopContinuouslyReading();
    moistureSensor.startContinuouslyReading(onNewMoistureSensorValue, config.MOISTURE_SENSOR_UPDATE_INTERVAL);
    io.emit('configUpdated', config.getPublicConfigObject());
    return res.send(config.getConfigObject());
});

let turnOffAutowatering = () => {
    config.update({IS_AUTOWATERING_ENABLED: false});
    io.emit('configUpdated', config.getPublicConfigObject());
    let response = {message: 'Autowatering: Pump could continue to run for about ' + (config.CONSECUTIVE_WATERING_INTERVAL * config.NUMBER_OF_CONSECUTIVE_WATERING / 1000) + ' seconds!'};
    logger.action('Autowatering turned off!');
    logger.warn(response.message);
    return response;
};

let turnOffPump = () => {
    pump.off();
    logger.action('Pump turned off!');
    io.emit('pumpToggled', pump.isActivated());
};

app.post('/autowatering/on', (req, res) => {
    turnOffPump();
    config.update({IS_AUTOWATERING_ENABLED: true});
    logger.action('Autowatering turned on!');
    io.emit('configUpdated', config.getPublicConfigObject());
    return res.send(true);
});

app.post('/autowatering/off', (req, res) => {
    return res.send(turnOffAutowatering());
});

app.post('/pump/consecutively', (req, res) => {
    logger.action('Turning on pump for consecutive watering');
    pump.activatePumpConsecutively(config.NUMBER_OF_CONSECUTIVE_WATERING, config.CONSECUTIVE_WATERING_INTERVAL);
    return res.send(true);
});

app.post('/pump/on', (req, res) => {
    config.IS_AUTOWATERING_ENABLED && turnOffAutowatering();
    pump.on();
    logger.action('Pump turned on!');
    io.emit('pumpToggled', pump.isActivated());
    return res.send(true);
});



app.post('/pump/off', (req, res) => {
    turnOffPump();
    return res.send(true);
});

app.get('/moiusturesensor/value', (req, res) => {
    return res.send(moistureSensor.getValue());
});

app.get('/config', (req, res) => {
    return res.send(config.getPublicConfigObject());
});

http.listen(config.PORT, () => {
    console.log('listening on *:' + config.PORT);
});