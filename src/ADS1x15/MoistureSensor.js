const MixinLogger = require('../Mixin/Logger');
const Raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const ADS1x15 = require('raspi-kit-ads1x15');


class ADS1x15MoistureSensor {

    constructor() {
	
        this.adc = null;
	let me = this;
        Raspi.init(() => {
            me.adc = me.createInterface();
        });
    }

    createInterface() {
        // Init Raspi-I2c
        const i2c = new I2C();
        // Init the ADC
        const adc = new ADS1x15({
            i2c,                                    // i2c interface
            chip: ADS1x15.chips.IC_ADS1115,         // chip model
            address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus

            // Defaults for future readings
            pga: ADS1x15.pga.PGA_4_096V,            // power-gain-amplifier range
            sps: ADS1x15.spsADS1015.SPS_250         // data rate (samples per second)
        });
        return adc;
    }

    async getValue() {
        if(this.adc) {
		let me = this;
            return new Promise((resolve, reject) => {
                me.adc.readChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
                    if (err) {
                        me.logMessage('Failed to fetch value from ADC' + JSON.stringify(err), 'error');
                    } else {
                        me.logMessage('Channel 0');
                        me.logMessage(' * Value:' + value);    // will be a 11 or 15 bit integer depending on chip
                        me.logMessage(' * Volts:' + volts);    // voltage reading factoring in the PGA
                    }
                    resolve(value);
                });
            });
        }
        return null;
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

Object.assign(ADS1x15MoistureSensor.prototype, MixinLogger);

module.exports = ADS1x15MoistureSensor;
