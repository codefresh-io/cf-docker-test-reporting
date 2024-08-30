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

    it('should set maxUploadSize to value from MAX_UPLOAD_SIZE_MB as number type', async () => {
        process.env = {
            ...defaultTestEnv,
            MAX_UPLOAD_SIZE_MB: '1234567890'
        };

        const result = Config.getSingleConfig();

        expect(result.maxUploadSize).to.equal(1234567890);
    });

    it('should set maxUploadSize to 1000 if MAX_UPLOAD_SIZE_MB is not a number', async () => {
        process.env = {
            ...defaultTestEnv,
            MAX_UPLOAD_SIZE_MB: 'not-a-number'
        };

        const result = Config.getSingleConfig();

        expect(result.maxUploadSize).to.equal(1000);
    });

    it('should set maxUploadSize to 1000 if MAX_UPLOAD_SIZE_MB is not set', async () => {
        process.env = {
            ...defaultTestEnv,
            REPORT_INDEX_FILE: 'index.html',
        };

        const result = Config.getSingleConfig();

        expect(result.maxUploadSize).to.equal(1000);
    });

    it('should set maxUploadSize to the rounded down value of MAX_UPLOAD_SIZE_MB if it is not an integer', async () => {
        process.env = {
            ...defaultTestEnv,
            MAX_UPLOAD_SIZE_MB: '123.789'
        };

        const result = Config.getSingleConfig();

        expect(result.maxUploadSize).to.equal(123);
    });
});
