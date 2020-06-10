const GpioBase = require('./Base');

class GpioPump extends GpioBase {

    createGpioInterface(pin) {
        return new this.GpioInterface(pin, 'in', 'both');
    }

    reset() {
        this.off();
        this.timeout && clearTimeout(this.timeout);
    }

    on() {
        this.logMessage('Turned pump on');
        this.gpio.writeSync(0);
    }

    off() {
        this.logMessage('Turned pump off');
        this.gpio && this.gpio.writeSync(1);
    }

    activateForServeralTime(timeInMs = 1000) {
        this.reset();
        this.on();
        this.timeout = setTimeout(this.off.bind(this), timeInMs);
    }

}


module.exports = GpioPump;