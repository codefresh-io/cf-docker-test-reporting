const expect = require('chai').expect;
const ConfigUtils = require('./ConfigUtils');

const testEnv = Object.assign({}, process.env);

describe('ConfigUtils', function () {

    this.timeout(20000);

    afterEach(() => {
        process.env = testEnv;
    });

    it('Should process more than 100 variables', async () => {
        const env = {
            BUCKET_NAME: 'cf-epic-test',
            CF_API_KEY: 'apiKey',
            CF_BRANCH_TAG_NORMALIZED: 'master',
            CF_BUILD_ID: '65118d2ea9534620832679c9',
            CF_STORAGE_INTEGRATION: 'epicgoogle',
        };
        for (let i = 0; i <= 150; i += 1) {
            env[`REPORT_TYPE.${i}`] = `${i}`;
            env[`REPORT_DIR.${i}`] = `coverage_data/unified_coverage_reports/${i}/html`;
            env[`REPORT_INDEX_FILE.${i}`] = 'index.html';
            env[`MAX_UPLOAD_SIZE_MB.${i}`] = `${i * 10}`;
        }

        const uploadVars = ['REPORT_DIR',
            'REPORT_PATH',
            'REPORT_INDEX_FILE',
            'ALLURE_DIR',
            'CLEAR_TEST_REPORT',
            'REPORT_TYPE',
            'MAX_UPLOAD_SIZE_MB'];

        process.env = env;
        const result = ConfigUtils.getMultiReportUpload(uploadVars);
        expect(result.length).to.equal(151);
    });

});
