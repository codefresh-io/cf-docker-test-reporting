'use strict';

const path = require('path');
const _ = require('lodash');
const ConfigUtils = require('./ConfigUtils');

/**
 * arrayVars - customer can define array of this vars for upload multiple reports, for example REPORT_DIR.0
 */
const UPLOAD_ARRAY_VARS = [
    'REPORT_DIR',
    'REPORT_PATH',
    'REPORT_INDEX_FILE',
    'ALLURE_DIR',
    'CLEAR_TEST_REPORT',
    'REPORT_TYPE',
    'MAX_UPLOAD_SIZE_MB'
];

const INFO = 'info';
const DEBUG = 'debug';
const ERROR = 'error';

const logLevels = {
    INFO,
    DEBUG,
    ERROR,
};

const logLevelsMap = {
    [INFO]: INFO,
    [DEBUG]: DEBUG,
    [ERROR]: ERROR,
};

class Config {
    static getSingleConfig() {

        const normalisedEnv = {};

        UPLOAD_ARRAY_VARS.forEach((uploadVar) => {
            if (process.env[uploadVar]) {
                console.log('scme single varName', uploadVar, _.camelCase(uploadVar), process.env[uploadVar]);
                normalisedEnv[_.camelCase(uploadVar)] = process.env[uploadVar];
            }
        });

        return this.getConfig(normalisedEnv);
    }

    static getMultipleConfig() {
        const environments = ConfigUtils.getMultiReportUpload(UPLOAD_ARRAY_VARS);

        const result = environments.map((env) => {
            const normalisedEnv = {};

            Object.keys(env).forEach((varName) => {
                console.log('scme multi varName', varName, _.camelCase(varName), env[varName]);
                normalisedEnv[_.camelCase(varName)] = env[varName];
            });

            return Config.getConfig(normalisedEnv);
        });

        return result;
    }

    static isMultiUpload() {
        return !!ConfigUtils.getMultiReportUpload(UPLOAD_ARRAY_VARS);
    }

    static getConfig(env = {}) {
        const {
            reportDir,
            reportIndexFile,
            allureDir,
            clearTestReport,
            reportType,
            reportWrapDir,
            reportPath,
            maxUploadSizeMb
        } = env;
        const apiHost = ConfigUtils.buildApiHost();
        const _reportWrapDir = _.isNumber(reportWrapDir) ? String(reportWrapDir) : '';
        console.log('scme maxUploadSizeMb', maxUploadSizeMb);
        const _maxUploadSizeMb = _.isNumber(maxUploadSizeMb) ? maxUploadSizeMb : 1000;
        console.log('scme _maxUploadSizeMb', _maxUploadSizeMb);
        /**
         * field uploadMaxSize set by SingleReportRunner, value in MB
         */
        return {
            googleStorageConfig: {
                projectId: 'local-codefresh',
                keyFilename: path.resolve(__dirname, 'google.storage.config.json')
            },
            amazonKeyFileName: path.resolve(__dirname, 'amazon.storage.config.json'),
            azureBlobKeyFileName: path.resolve(__dirname, 'azure.blob.storage.config.json'),
            azureKeyFileName: path.resolve(__dirname, 'azure.file.storage.config.json'),
            resultReportFolderName: `allure-report${_reportWrapDir ? `.${_reportWrapDir}` : ''}`,
            requiredVarsForUploadMode: {
                REPORT_DIR: reportDir,
                REPORT_INDEX_FILE: reportIndexFile
            },
            uploadRetryCount: 3,
            uploadParallelLimit: 200,
            basicLinkOnReport: `${apiHost}/api/testReporting/`,
            apiHost,
            allureHistoryDir: 'history',
            annotationName: 'cf_test_reporter_link',
            reportsIndexDir: `${path.dirname(require.resolve('../_reportsIndex_'))}`,
            uploadArrayVars: UPLOAD_ARRAY_VARS,
            maxUploadSize: _maxUploadSizeMb,
            env: {
                // bucketName - only bucket name, with out subdir path
                bucketName: ConfigUtils.getBucketName(),
                // bucketSubPath - parsed path to sub folder inside bucket
                bucketSubPath: ConfigUtils.getBucketSubPath(),
                // originBucketName - origin value that can contain subdir need to use it in some cases
                originBucketName: process.env.BUCKET_NAME,
                apiKey: process.env.CF_API_KEY,
                buildId: process.env.CF_BUILD_ID,
                volumePath: process.env.CF_VOLUME_PATH,
                branchNormalized: process.env.CF_BRANCH_TAG_NORMALIZED,
                storageIntegration: process.env.CF_STORAGE_INTEGRATION,
                logLevel: logLevelsMap[process.env.REPORT_LOGGING_LEVEL] || INFO,
                retriesForCodefreshAPI: Number(process.env.CF_API_RETRIES) || 0,
                sourceReportFolderName: (allureDir || 'allure-results').trim(),
                reportDir: ((reportDir || '').trim()) || undefined,
                reportPath: ((reportPath || '').trim()).replace(/\/$/, ''),
                reportIndexFile: ((reportIndexFile || '').trim()) || undefined,
                reportWrapDir: _reportWrapDir,
                reportType: _.isString(reportType) ? reportType.replace(/[<>]/g, 'hackDetected') : 'default',
                allureDir,
                clearTestReport
            },
            stepName: process.env.CF_STEP_NAME,
            buildDataSignature: {
                pipelineId: { type: 'string', required: true }
            },
            logLevels
        };
    }
}

module.exports = Config;
