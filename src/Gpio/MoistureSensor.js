const GpioBase = require('./Base');

class GpioMoistureSensor extends GpioBase {

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'in', 'both');
    }

    async getValue() {
        return this.gpio.readSync();
    }

    startContinuouslyReading(callback, interval = 1000) {
        this.logMessage('Moisture Sensor: started ContinuouslyReading every ' + interval / 1000 + ' seconds', 'action');
        this.stopContinuouslyReading();
        this.interval = setInterval(async () => {
            let value = await this.getValue();
            callback(value);
        }, interval);
    }

    stopContinuouslyReading() {
        if(this.interval) {
            this.logMessage('Moisture Sensor: stopped ContinuouslyReading', 'action');
            clearInterval(this.interval);
            this.interval = null;
        }
    }

}

module.exports = GpioMoistureSensor;
