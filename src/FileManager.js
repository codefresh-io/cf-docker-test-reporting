'use strict';

/* eslint consistent-return: 0 */

const BasicTestReporter = require('./reporter/BasicTestReporter');
const recursiveReadSync = require('recursive-readdir-sync');
const Exec = require('child_process').exec;
const config = require('../config');
const fs = require('fs');

const basicTestReporter = new BasicTestReporter();
const FIND_RESOURCE_SIZE = /^[\d.,]+/;
const KILOBYTES_IN_MEGABYTE = 1024;
const DECIMAL_SYSTEM = 10;
const FULL_USER_PERMISSION = '0744';

class FileManager {
    static getDirOrFileSize(pathToResource) {
        return new Promise((res) => {
            Exec(`du -sk ${pathToResource}`, (err, response) => {
                const match = response.trim().match(FIND_RESOURCE_SIZE);

                if (!match) {
                    res(null);
                }

                res(parseInt(match.toString().trim(), DECIMAL_SYSTEM) / KILOBYTES_IN_MEGABYTE);
            });
        });
    }

    static _getFilesForUpload({ srcDir, uploadFile, isUploadFile }) {
        if (!isUploadFile) {
            return recursiveReadSync(srcDir);
        } else {
            return [uploadFile];
        }
    }

    static removeTestReportDir() {
        let folderForRemove;

        const isUpload = basicTestReporter.isUploadMode(config.requiredVarsForUploadMode);

        if (!isUpload || (process.env.CLEAR_TEST_REPORT && process.env.REPORT_DIR)) {
            folderForRemove = process.env.REPORT_DIR || config.env.sourceReportFolderName;
        }

        if (folderForRemove) {
            return new Promise((res) => {
                console.log('Start removing test report folder');
                Exec(`rm -rf ${folderForRemove}`, (err) => {
                    if (err) {
                        console.error(`Cant remove report folder "${folderForRemove}", cause: 
                        ${err.message ? err.message : 'unknown error'}`);
                    } else {
                        console.log(`Test report folder "${folderForRemove}" has been removed`);
                    }

                    res(true);
                });
            });
        }

        return Promise.resolve();
    }

    static removeDir(path) {
        return new Promise((res, rej) => {
            Exec(`rm -rf ${path}`, (err) => {
                if (err) {
                    rej(err);
                }

                res(path);
            });
        });
    }

    static createDir(path, opts = {}, flags = {}) {
        return Promise.resolve()
            .then(() => {
                if (opts.force) {
                    return FileManager.removeDir(path);
                }
            })
            .then(() => {
                return new Promise((res, rej) => {
                    fs.mkdir(path, Object.assign({ mode: FULL_USER_PERMISSION }, flags), (err) => {
                        if (err) {
                            rej(err);
                        }

                        res(path);
                    });
                });
            });
    }

    static renameDir(from, to, opts = {}) {
        return Promise.resolve()
            .then(() => {
                if (opts.force) {
                    return FileManager.removeDir(to);
                }
            })
            .then(() => {
                return new Promise((res, rej) => {
                    fs.rename(from, to, (err) => {
                        if (err) {
                            rej(err);
                        }

                        res(to);
                    });
                });
            });
    }
}

module.exports = FileManager;
