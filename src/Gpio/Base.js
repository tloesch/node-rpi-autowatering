class GpioBase {

    constructor(gpioPin) {
        this.GpioInterface = require('onoff').Gpio;
        this.setGpioPin(gpioPin)
    }

    setGpioPin(pin) {
        this.reset();
        this.gpioInterface = this.createGpioInterface(pin);
    }

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'out');
    }

    reset() {}
}

module.exports = GpioBase;