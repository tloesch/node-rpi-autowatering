class Config {

    constructor(configFolderPath = '') {
        this.staticProperties = ['GPIO'];

        this.fs = require('fs');
        this.configPath = configFolderPath + 'config.json';
        this.config = this.getDefaultConfig();
        if(this.fs.existsSync(this.configPath )) {
            this.update(JSON.parse(this.fs.readFileSync('config.json')));
        } else {
            this.update(this.getDefaultConfig());
        }
        return this.createProxy();
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

    getDefaultConfig () {
        return {
            IS_AUTOWATERING_ENABLED: true,
            NUMBER_OF_CONSECUTIVE_WATERING: 10,
            CONSECUTIVE_WATERING_INTERVAL: 1500,
            IS_WET_THRESHOLD: 0,
            MOISTURE_SENSOR_UPDATE_INTERVAL: 1000,
            GPIO: {
                PUMP: 7,
                MOISTURE_SENSOR: 6
            }
        };
    }

    async update(config) {
        for (let key in config) {
            if(key in this.config && !this.staticProperties.contains(key)) {
                this.config[key] = config[key];
            }
        }
        await this.fs.writeFileSync(this.configPath, JSON.stringify(this.config));
        return this.config;
    }
}

module.exports = Config;
