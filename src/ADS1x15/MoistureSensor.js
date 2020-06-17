const MixinLogger = require('../Mixin/Logger');
const MixinContinuouslyReading = require('../Mixin/ContinuouslyReading');

let Raspi = null;
let I2C = null;
let ADS1x15 = null;
if(['arm', 'arm64'].includes(process.arch)) {
    Raspi = require('raspi');
    I2C = require('raspi-i2c').I2C;
    ADS1x15 = require('raspi-kit-ads1x15');
}

class ADS1x15MoistureSensor {

    constructor(adsType = 'ADS1115') {
        this.adc = null;
	    let me = this;
	    if(!['arm', 'arm64'].includes(process.arch)) {
            console.log('-----------------------------------------------------------------------------------------------------------');
	        console.log('ADS1x15MoistureSensor.js: Unsupported platform for raspi-peripheral: wanted {"os":"any","arch":"arm,arm64"}');
            console.log('-----------------------------------------------------------------------------------------------------------');
	        return;
        }
        Raspi.init(() => {
            me.adc = me.createInterface(adsType);
        });
    }

    createInterface(adsType) {
        // Init Raspi-I2c
        const i2c = new I2C();
        // Init the ADC
        const adc = new ADS1x15({
            i2c,                                    // i2c interface
            chip: ADS1x15.chips['IC_' + adsType],         // chip model
            address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus

            // Defaults for future readings
            pga: ADS1x15.pga.PGA_4_096V,            // power-gain-amplifier range
            sps: ADS1x15['sps' + adsType].SPS_250         // data rate (samples per second)
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
                    }
                    resolve(value);
                });
            });
        }
        return -1;
    }

}

Object.assign(ADS1x15MoistureSensor.prototype, MixinLogger);

let copyFromMixinContinuouslyReading = {};
Object.assign(copyFromMixinContinuouslyReading, MixinContinuouslyReading);
Object.assign(copyFromMixinContinuouslyReading, ADS1x15MoistureSensor.prototype);
Object.assign(ADS1x15MoistureSensor.prototype, copyFromMixinContinuouslyReading);

module.exports = ADS1x15MoistureSensor;
