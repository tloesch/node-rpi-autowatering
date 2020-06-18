const MixinLogger = require('./Logger');
const fs = require('fs');

let MixinContinuouslyReading = {


    initContinuouslyReadingLogging(folderPath = 'log/continuously_reading/') {
        this.loggingOfContinuouslyReadingEnabled = true;
        this.continuouslyReadingFolderPath = process.cwd() + '/' + folderPath + '/';
        fs.mkdirSync(this.continuouslyReadingFolderPath, {recursive: true});
        this.initContinuouslyReadingLoggingObjectIfDayChanges();
    },


    initContinuouslyReadingLoggingObjectIfDayChanges() {
        if(this.currentLoggingDate != new Date().toISOString().substr(0,10)) {
            this.loggedValues = [];
            this.currentLoggingDate =  new Date().toISOString().substr(0,10);
        }
    },

    logValue(value) {
        if(!this.loggingOfContinuouslyReadingEnabled) {
            return;
        }
        this.initContinuouslyReadingLoggingObjectIfDayChanges();
        this.loggedValues.push({timestamp: +new Date(), value: value});
        fs.writeFileSync(this.continuouslyReadingFolderPath + new Date().toISOString().substr(0,10) + '-continuously-reading-values.json', JSON.stringify(this.loggedValues), 'utf8');
    },

    startContinuouslyReading(callback, interval = 1000) {
        this.logMessage('Moisture Sensor: started ContinuouslyReading every ' + interval / 1000 + ' seconds', 'action');
        this.stopContinuouslyReading();
        this.interval = setInterval(async () => {
            let value = await this.getValue();
            this.logValue(value);
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