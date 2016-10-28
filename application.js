var ContainershipPlugin = require('containership.plugin');
var _ = require('lodash');
var request = require('request');

module.exports = new ContainershipPlugin({
    name: 'tide',

    initialize: function(core) {
        var applicationName = 'ntpd';
        core.logger.register(applicationName);

        const addApplication = () => {
            request({
                baseUrl: `http://localhost:${core.options['api-port']}`,
                url: `/v1/applications/${applicationName}`,
                method: 'POST',
                json: {
                    id: applicationName,
                    image: "containership/ntp:latest",
                    cpus: 0.1,
                    memory: 16,
                    privileged: true,
                    tags: {
                        constraints: {
                            per_host: 1
                        }
                    },
                }
            }, (err, res) => {
                if(!err) {
                    core.loggers[applicationName].log("verbose", `Created ${applicationName}: ${JSON.stringify(res)}`);
                } else {
                    core.loggers[applicationName].log("verbose", `Couldn't create ${applicationName}: ${JSON.stringify(err)}`);

                }
            });
        }

        if(core.api) {
            if(core.cluster.praetor.is_controlling_leader()) {
                addApplication();
            }

            core.cluster.legiond.on("promoted", () => {
                addApplication();
            });
        }
    },

    reload: function() {}
});
