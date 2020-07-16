const fs = require('fs');
const os = require("os");

class Logger {

    constructor(writeFile = true, folderPath = 'log') {
        this.fileWritingEnabled = writeFile;
        this.folderPath = process.cwd() + '/' + folderPath + '/';
        fs.existsSync(this.folderPath) || fs.mkdirSync(this.folderPath, {recursive: true});
    }

    onLog(message, type) {}

    logMessage(message, type) {
        this.onLog(message, type);
        this.fileWritingEnabled && fs.appendFileSync(this.folderPath + new Date().toISOString().substr(0,10) + '-app.log', '[' + new Date().toLocaleString() + '][' + type + '] ' + message + os.EOL, 'utf8');
    }

    info(message) {
        this.logMessage(message, 'info');
    }

    warn(message) {
        this.logMessage(message, 'warn');
    }

    action(message) {
        this.logMessage(message, 'action');
    }
}

module.exports = Logger;
