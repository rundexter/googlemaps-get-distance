var _ = require('lodash'),
    GoogleMapsAPI = require('googlemaps'),
    util = require('./util.js');

var pickInputs = {
        'origins': { key: 'origins', validate: { req: true } },
        'destinations': { key: 'destinations', validate: { req: true } },
        'avoid': 'avoid',
        'language': 'language',
        'units': 'units',
        'traffic_model': 'traffic_model',
        'transit_mode': 'transit_mode',
        'transit_routing_preference': 'transit_routing_preference'
    },

    pickOutputs = {
        'status': {
            keyName: 'rows',
            fields: {
                '-': {
                    keyName: 'elements',
                    fields: ['status']
                }
            }
        },
        'distance': {
            keyName: 'rows',
            fields: {
                '-': {
                    keyName: 'elements',
                    fields: ['distance']
                }
            }
        },
        'duration': {
            keyName: 'rows',
            fields: {
                '-': {
                    keyName: 'elements',
                    fields: ['duration']
                }
            }
        },
        'duration_in_traffic': {
            keyName: 'rows',
            fields: {
                '-': {
                    keyName: 'elements',
                    fields: ['duration_in_traffic']
                }
            }
        },
        'fare': {
            keyName: 'rows',
            fields: {
                '-': {
                    keyName: 'elements',
                    fields: ['fare']
                }
            }
        }
    };

module.exports = {

    /**
     * Get auth data.
     *
     * @param step
     * @param dexter
     * @returns {*}
     */
    authOptions: function (step, dexter) {
        var authData = {};

        if (dexter.environment('google_server_key')) {
            authData.key = dexter.environment('google_server_key');
        } else if (dexter.environment('google_client_id') && dexter.environment('google_private_key')) {
            authData.google_client_id = dexter.environment('google_client_id');
            authData.google_private_key = dexter.environment('google_private_key');
        }

        return _.isEmpty(authData)? false : authData;
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth = this.authOptions(step, dexter),
            inputs = util.pickInputs(step, pickInputs),
            validateError = util.checkValidateErrors(inputs, pickInputs);

        if (!auth)
            return this.fail('A [google_server_key] (or [google_client_id,google_private_key] for enterprise) environment variable need for this module.');

        if (validateError)
            return this.fail(validateError);

        var gmAPI = new GoogleMapsAPI(auth);
        gmAPI.distance(util.pickInputs(step, pickInputs), function(err, result) {
            if (err)
                this.fail(err);
            if (result.error_message)
                this.fail(result.error_message);
            else
                this.complete(util.pickOutputs(result, pickOutputs));
        }.bind(this));
    }
};
