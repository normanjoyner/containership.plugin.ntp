'use strict';

const _ = require('lodash');
const ContainershipPlugin = require('containership.plugin');

module.exports = new ContainershipPlugin({
    name: 'ntp',
    type: 'core',

    initialize: function(core) {
        const applicationName = 'ntpd';
        core.logger.register(applicationName);

        const addApplication = () => {
            const key = [core.constants.myriad.APPLICATION_PREFIX, applicationName].join(core.constants.myriad.DELIMITER);

            core.cluster.myriad.persistence.get(key, (err) => {
                if(err) {
                    if(err.name === core.constants.myriad.ENOKEY) {
                        core.applications.add({
                            id: applicationName,
                            image: 'containership/ntp:latest',
                            cpus: 0.1,
                            memory: 16,
                            privileged: true,
                            tags: {
                                constraints: {
                                    per_host: 1
                                },
                                metadata: {
                                    plugin: applicationName,
                                    ancestry: 'containership.plugin'
                                }
                            },
                        }, (err) => {
                            if(!err) {
                                core.loggers[applicationName].log('verbose', `Created ${applicationName}!`);
                            } else {
                                core.loggers[applicationName].log('error', `Couldnt create ${applicationName}: ${err}`);
                            }
                        });
                    } else {
                        core.loggers[applicationName].log('verbose', `${applicationName} already exists, skipping create!`);
                    }
                } else {
                        core.loggers[applicationName].log('error', `Unexpected error accessing myriad when loading ${applicationName}: ${err}`);
                }
            });
        };

        if(core.cluster.praetor.is_controlling_leader()) {
            addApplication();
        }

        core.cluster.legiond.on('myriad.bootstrapped', () => {
            addApplication();
        });
    },

    reload: function() {}
});
