class Config {

    constructor(configFolderPath = '') {
        this.staticProperties = ['GPIO', 'PORT', 'BASIC_AUTH', 'INTERFACES_TO_USE'];
        this.privateProperties = ['GPIO', 'PORT', 'BASIC_AUTH', 'INTERFACES_TO_USE'];

        this.fs = require('fs');
        this.configPath = configFolderPath + 'config.json';
        this.config = this.getDefaultConfig();
        if(this.fs.existsSync(this.configPath)) {
            this.config = JSON.parse(this.fs.readFileSync(this.configPath));
        }
        return this.createProxy();
    }

    getDefaultConfig () {
        return JSON.parse(this.fs.readFileSync('default_config.json'));
    }

    createProxy() {
        return new Proxy(this, {
            get: function(currentClass, field) {
                if (field in currentClass) {
                    return currentClass[field]; // normal case
                }
                if(currentClass.config && field in currentClass.config) {
                    return currentClass.config[field];
                }
                if(typeof  currentClass[field] === 'function') {
                    return currentClass[field](arguments);
                }
                return undefined;
            }
        });
    }

    getConfigObject() {
        return this.config;
    }

    getPublicConfigObject() {
        let publicConfigObject = Object.assign({}, this.getConfigObject());
        for(let key in publicConfigObject) {
            if(this.privateProperties.includes(key)) {
                delete publicConfigObject[key];
            }
        }
        return publicConfigObject;
    }

    async update(config) {
        for (let key in config) {
            if(key in this.config && !this.staticProperties.includes(key)) {
                this.config[key] = config[key];
            }
        }
        await this.fs.writeFileSync(this.configPath, JSON.stringify(this.getConfigObject()));
        this.logMessage('Config updated! ' + JSON.stringify(this.getPublicConfigObject()));
        return this.config;
    }

    setLogger(logger) {
        this.logger = logger;
    }

    logMessage(message, type = 'info') {
        if(this.logger) {
            this.logger.logMessage(message, type);
        }
    }

}

module.exports = Config;
