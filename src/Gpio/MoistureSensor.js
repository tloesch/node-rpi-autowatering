const GpioBase = require('./Base');
const MixinContinuouslyReading = require('../Mixin/ContinuouslyReading');

class GpioMoistureSensor extends GpioBase {

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'in', 'both');
    }

    async getValue() {
        return this.gpio.readSync();
    }

}
Object.assign(GpioMoistureSensor.prototype, MixinContinuouslyReading);

module.exports = GpioMoistureSensor;
