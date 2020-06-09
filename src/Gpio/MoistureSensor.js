const GpioBase = require('./Base');

class GpioMoistureSensor extends GpioBase {

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'out');
    }

    getValue() {
        return this.gpioSensor.readSync();
    }

    startContinuouslyReading(callback, interval = 1000) {
        this.stopContinuouslyReading();
        this.interval = setInterval(() => callback(this.getValue()), interval);
    }

    stopContinuouslyReading() {
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

}

module.exports = GpioMoistureSensor;