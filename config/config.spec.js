const Config = require('./index');
const expect = require('chai').expect;

const previousEnv = Object.assign({}, process.env);

describe('Config', function () {

    const defaultTestEnv = {
        BUCKET_NAME: 'cf-epic-test',
        CF_API_KEY: 'apiKey',
        CF_BRANCH_TAG_NORMALIZED: 'master',
        CF_BUILD_ID: '65118d2ea9534620832679c9',
        CF_STORAGE_INTEGRATION: 'epicgoogle',
        REPORT_TYPE: '1',
        REPORT_DIR: 'coverage_data/unified_coverage_reports/html',
        REPORT_INDEX_FILE: 'index.html',
    };

    this.timeout(20000);

    afterEach(() => {
        process.env = previousEnv;
    });

    const testEnvVar = (varName, outputGetter, input, expected) =>
        function () {
            process.env = defaultTestEnv;

            if (input) {
                process.env[varName] = input;
            }

            const result = Config.getSingleConfig();

            expect(outputGetter(result)).to.equal(expected);
        };

    it('should set maxUploadSize to value from MAX_UPLOAD_SIZE_MB as number type',
        testEnvVar('MAX_UPLOAD_SIZE_MB', result => result.maxUploadSize, '1234567890', 1234567890));

    it('should set maxUploadSize to 1000 if MAX_UPLOAD_SIZE_MB is not a number',
        testEnvVar('MAX_UPLOAD_SIZE_MB', result => result.maxUploadSize, 'not-a-number', 1000));

    it('should set maxUploadSize to 1000 if MAX_UPLOAD_SIZE_MB is not set',
        testEnvVar('REPORT_INDEX_FILE', result => result.maxUploadSize, 'index.html', 1000));

    it('should set maxUploadSize to the rounded down value of MAX_UPLOAD_SIZE_MB if it is not an integer',
        testEnvVar('MAX_UPLOAD_SIZE_MB', result => result.maxUploadSize, '123.789', 123));

    it('should set retriesForCodefreshAPI to value from CF_API_RETRIES as number type',
        testEnvVar('CF_API_RETRIES', result => result.env.retriesForCodefreshAPI, '5', 5));

    it('should set retriesForCodefreshAPI to 1000 if CF_API_RETRIES is not a number',
        testEnvVar('CF_API_RETRIES', result => result.env.retriesForCodefreshAPI, 'not-a-number', 0));

    it('should set retriesForCodefreshAPI to 1000 if CF_API_RETRIES is not set',
        testEnvVar('REPORT_INDEX_FILE', result => result.env.retriesForCodefreshAPI, 'index.html', 0));

    it('should set retriesForCodefreshAPI to the rounded down value of CF_API_RETRIES if it is not an integer',
        testEnvVar('CF_API_RETRIES', result => result.env.retriesForCodefreshAPI, '123.789', 123));
});
