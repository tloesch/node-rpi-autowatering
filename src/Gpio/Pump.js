const GpioBase = require('./Base');

class GpioPump extends GpioBase {

    constructor(gpioPin) {
        super(gpioPin);
        this._isActivated = false;
    }

    createGpioInterface(pin) {
		let gpioInterface = new this.GpioInterface(pin, 'out');
		gpioInterface.writeSync(1);
        return gpioInterface;
    }

    reset() {
        this.off();
        this.timeout && clearTimeout(this.timeout);
    }

    on() {
        this.logMessage('Turned pump on');
        this.gpio.writeSync(0);
        this._isActivated = true;
    }

    off() {
        this.logMessage('Turned pump off');
        this.gpio && this.gpio.writeSync(1);
        this._isActivated = false;
    }

    isActivated() {
        return this._isActivated;
    }

    activateForServeralTime(timeInMs = 1000) {
        this.reset();
        this.on();
        this.timeout = setTimeout(this.off.bind(this), timeInMs);
    }

}


module.exports = GpioPump;
