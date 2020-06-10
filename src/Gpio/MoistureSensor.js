const GpioBase = require('./Base');

class GpioMoistureSensor extends GpioBase {

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'out');
    }

    getValue() {
        return this.gpio.readSync();
    }

    startContinuouslyReading(callback, interval = 1000) {
        this.logMessage('Moisture Sensor: started ContinuouslyReading every ' + interval / 1000 + ' seconds');
        this.stopContinuouslyReading();
        this.interval = setInterval(() => callback(this.getValue()), interval);
    }

    stopContinuouslyReading() {
        if(this.interval) {
            this.logMessage('Moisture Sensor: stopped ContinuouslyReading');
            clearInterval(this.interval);
            this.interval = null;
        }
    }

}

module.exports = GpioMoistureSensor;