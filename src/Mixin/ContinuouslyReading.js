const MixinLogger = require('./Logger');
const fs = require('fs');

let MixinContinuouslyReading = {


    initContinuouslyReadingLogging(folderPath = 'log/continuously_reading/') {
        this.loggingOfContinuouslyReadingEnabled = true;
        this.continuouslyReadingFolderPath = process.cwd() + '/' + folderPath + '/';
        fs.existsSync(this.continuouslyReadingFolderPath) || fs.mkdirSync(this.continuouslyReadingFolderPath, {recursive: true});
        this.initContinuouslyReadingLoggingObjectIfDayChanges();
    },


    initContinuouslyReadingLoggingObjectIfDayChanges() {
        if(this.currentLoggingDate != new Date().toISOString().substr(0,10)) {
            this.continuouslyReadedValues = [];
            this.currentLoggingDate =  new Date().toISOString().substr(0,10);
            this.continuouslyReadingLoggingFileName = this.currentLoggingDate  + '-continuously-reading-values.json';
            if (fs.existsSync(this.getContinuouslyReadingLoggingFilePath())) {
                this.continuouslyReadedValues = JSON.parse(fs.readFileSync(this.getContinuouslyReadingLoggingFilePath()).toString());
            }
        }
    },

    getContinuouslyReadingLoggingFilePath() {
        return this.continuouslyReadingFolderPath + this.continuouslyReadingLoggingFileName;
    },


    getLoggedValuesFromLogfile(fileName) {
        if(fileName.indexOf('.json') === -1) {
            fileName += '.json';
        }
        let files = fs.readdirSync(this.continuouslyReadingFolderPath);
        let content = [];
        if(files.includes(fileName)) {
            content = fs.readFileSync(this.continuouslyReadingFolderPath + fileName);
            content = JSON.parse(content.toString());
        }
        return content
    },

    getCurrentLoggedValues() {
        this.initContinuouslyReadingLoggingObjectIfDayChanges();
        return this.continuouslyReadedValues;
    },

    logValue(value) {
        if(!this.loggingOfContinuouslyReadingEnabled) {
            return;
        }
        this.initContinuouslyReadingLoggingObjectIfDayChanges();
        this.continuouslyReadedValues.push({timestamp: +new Date(), value: value});
        fs.writeFileSync(this.getContinuouslyReadingLoggingFilePath(), JSON.stringify(this.continuouslyReadedValues), 'utf8');
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