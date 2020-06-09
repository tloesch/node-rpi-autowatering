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
        this.gpioPump.writeSync(0);
    }

    off() {
        this.gpioPump.writeSync(1);
    }

    activateForServeralTime(timeInMs = 1000) {
        this.reset();
        this.on();
        this.timeout = setTimeout(this.off, time);
    }

}


module.exports = GpioPump;