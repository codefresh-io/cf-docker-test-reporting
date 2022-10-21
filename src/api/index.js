const rp = require('request-promise');

class CodefreshAPI {

    static async sendRequest(config, opts) {
        if (config.env.retriesForCodefreshAPI) {
            let error;
            for (let i = 0; i < config.env.retriesForCodefreshAPI; i += 1) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const result = await rp(opts);
                    return result;
                } catch (e) {
                    error = e;
                }
            }
            throw error;
        }
        return rp(opts);
    }

    static async createAnnotation({ config, value }) {
        // this query use proxy ability to replace :account_id to currentAccountID
        // this ability use because we don`t know accountId
        const createAnnotationOpts = {
            uri: `${config.apiHost}/api/annotations`,
            headers: {
                'Authorization': config.env.apiKey
            },
            method: 'post',
            body: {
                entityId: config.env.buildId,
                entityType: 'build',
                key: config.annotationName,
                value,
            },
            json: true,
        };

        return this.sendRequest(config, createAnnotationOpts);
    }

    static async getProcessById({ id, config }) {
        const opts = {
            uri: `${config.apiHost}/api/workflow/${id}/process`,
            headers: {
                'Authorization': config.env.apiKey
            }
        };

        let process;

        try {
            const processRes = await this.sendRequest(config, opts);
            process = JSON.parse(processRes);
        } catch (e) {
            throw new Error('Error during getting process info');
        }

        if (!process) {
            throw new Error('Error, process info is not defined');
        }

        return process;
    }
}

module.exports = CodefreshAPI;
