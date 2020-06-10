class GpioBase {

    constructor(gpioPin) {
        this.GpioInterface = require('onoff').Gpio;
        //this.GpioInterface = require('./DummyInterface.js');
        this.setGpioPin(gpioPin)
    }

    setLogger(logger) {
        this.logger = logger;
    }

    logMessage(message, type = 'info') {
        if(this.logger) {
            this.logger.logMessage(message, type);
        }
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

module.exports = GpioBase;