const GpioBase = require('./Base');

class GpioPump extends GpioBase {

    constructor(gpioPin) {
        super(gpioPin);
        this._isActivated = false;
        this._pumpIsConsecutivelyActivated = false;
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
        this.logMessage('Turned pump on', 'action');
        this.gpio.writeSync(0);
        this._isActivated = true;
    }

    off() {
        this.logMessage('Turned pump off', 'action');
        this.gpio && this.gpio.writeSync(1);
        this._isActivated = false;
    }

    isActivated() {
        return this._isActivated || this._pumpIsConsecutivelyActivated;
    }

    activateForServeralTime(timeInMs = 1000) {
        this.reset();
        this.on();
        this.timeout = setTimeout(this.off.bind(this), timeInMs);
    }

    activatePumpConsecutively(numberOfConsecutiveActivations, intervalBetweenConsecutiveActivationsInMs = 1500, pumpActivationTimeInMs = 1000) {
        let me = this;
        this.logMessage('Turning on pump for consecutive watering', 'action');
        this._pumpIsConsecutivelyActivated = true;
        for(let i = 0; i < numberOfConsecutiveActivations; i++) {
            setTimeout(() => me.activateForServeralTime(pumpActivationTimeInMs), intervalBetweenConsecutiveActivationsInMs * (i + 1));
        }
        setTimeout(() => {
            me._pumpIsConsecutivelyActivated = false;
        }, (intervalBetweenConsecutiveActivationsInMs * numberOfConsecutiveActivations));
    }

}


module.exports = GpioPump;
