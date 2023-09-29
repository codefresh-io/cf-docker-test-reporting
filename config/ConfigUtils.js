const _ = require('lodash');

const FIND_VAR_INDEX = /\d+$/;
const FIND_VAR_INDEX_WITH_DOT = /\.\d+$/;

class ConfigUtils {
    static buildApiHost() {
        return _.get(process.env, 'CF_URL', 'https://g.codefresh.io');
    }

    static getBucketName() {
        /**
         * return only bucket name without subpath
         */
        const bucketNameSplitted = String(process.env.BUCKET_NAME).split('/');
        return bucketNameSplitted[0];
    }

    static getBucketSubPath() {
        /**
         * bucketName can contain path that must be root of where report will be uploaded
         * return subpath extracted from bucket
         */
        const bucketNameSplitted = String(process.env.BUCKET_NAME).split('/');
        const bucketSubPath = bucketNameSplitted.slice(1).join('/');
        return bucketSubPath ? `${bucketSubPath}/` : bucketSubPath;
    }

    static getMultiReportUpload(uploadVars) {
        /**
         * getMultiReportUpload - must return array of objects if array vars exists or undefined
         * uploadVars - env vars related to upload resource
         */
        const resultVars = [];

        Object.keys(process.env).forEach((envVar) => {
            uploadVars.forEach((uploadVar) => {
                /**
                 * findArrayVar - check if var have number at the end, such variables uses for define array
                 */
                const findArrayVar = new RegExp(`^${uploadVar}.\\d+$`);

                if (findArrayVar.test(envVar)) {
                    const index = envVar.match(FIND_VAR_INDEX)[0];

                    if (!resultVars[index]) {
                        resultVars[index] = {};
                    }

                    resultVars[index][envVar.replace(FIND_VAR_INDEX_WITH_DOT, '')] = process.env[envVar];
                }
            });
        });

        const compactResultVars = _.compact(resultVars);

        compactResultVars.forEach((env, index) => {
            /**
             * REPORT_WRAP_DIR - name of folder in which will be uploaded files
             * by existing this var reporter know that multireports uploads now
             */
            env.REPORT_WRAP_DIR = index;
        });

        return compactResultVars.length ? compactResultVars : undefined;
    }
}

module.exports = ConfigUtils;
