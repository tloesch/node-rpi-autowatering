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

let copyFromMixinContinuouslyReading = {};
Object.assign(copyFromMixinContinuouslyReading, MixinContinuouslyReading);
Object.assign(copyFromMixinContinuouslyReading, GpioMoistureSensor.prototype);
Object.assign(GpioMoistureSensor.prototype, copyFromMixinContinuouslyReading);

module.exports = GpioMoistureSensor;
