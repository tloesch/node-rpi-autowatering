let MixinLogger = {

    setLogger(logger) {
        this.logger = logger;
    },

    logMessage(message, type = 'info') {
        if(this.logger) {
            this.logger.logMessage(message, type);
        }
    }

}

module.exports = MixinLogger;