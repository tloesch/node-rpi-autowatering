const MixinLogger = require('../Mixin/Logger');

class GpioBase {

    constructor(gpioPin) {
       // this.GpioInterface = require('onoff').Gpio;
        this.GpioInterface = require('./DummyInterface.js');
        this.setGpioPin(gpioPin)
    }

    setGpioPin(pin) {
        this.reset();
        this.gpio = this.createGpioInterface(pin);
    }

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'out');
    }

    reset() {}
}

Object.assign(GpioBase.prototype, MixinLogger);

module.exports = GpioBase;