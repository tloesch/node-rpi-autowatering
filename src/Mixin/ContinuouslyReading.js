const MixinLogger = require('./Logger');

let MixinContinuouslyReading = {

    async getValue() {
        return -1;
    },

    startContinuouslyReading(callback, interval = 1000) {
        this.logMessage('Moisture Sensor: started ContinuouslyReading every ' + interval / 1000 + ' seconds', 'action');
        this.stopContinuouslyReading();
        this.interval = setInterval(async () => {
            let value = await this.getValue();
            callback(value);
        }, interval);
    },

    stopContinuouslyReading() {
        if(this.interval) {
            this.logMessage('Moisture Sensor: stopped ContinuouslyReading', 'action');
            clearInterval(this.interval);
            this.interval = null;
        }
    }

}
Object.assign(MixinContinuouslyReading, MixinLogger);
module.exports = MixinContinuouslyReading;