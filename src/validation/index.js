'use strict';

const fs = require('fs');
const config = require('../../config');
const FileManager = require('../FileManager');
const _ = require('lodash');

class Validator {
    static async validateUploadDir(pathToDir) {
        if (!fs.existsSync(pathToDir)) {
            throw new Error('Error: Directory for upload does not exist. \n' +
            'Ensure that "working_directory" was specified for this step and it contains the directory for upload');
        }

        if (!fs.readdirSync(pathToDir).length) {
            throw new Error('Error: Directory for upload is empty');
        }

        if (config.uploadMaxSize < await FileManager.getDirOrFileSize(pathToDir)) {
            throw new Error(`Error: Directory for upload is to large, max size is ${config.uploadMaxSize} MB`);
        }

        return true;
    }

    // invokes only when user want to upload one file
    static async validateUploadFile(pathToFile) {
        if (!fs.existsSync(pathToFile)) {
            throw new Error('Error: FIle for upload does not exist. \n' +
            'Ensure that "working_directory" was specified for this step and it contains the file for upload');
        }

        if (config.uploadMaxSize < await FileManager.getDirOrFileSize(pathToFile)) {
            throw new Error(`Error: File for upload is to large, max size is ${config.uploadMaxSize} MB`);
        }

        return true;
    }

    static validateUploadResource({ isUploadFile, uploadIndexFile, dirForUpload }) {
        if (isUploadFile) {
            return this.validateUploadFile(uploadIndexFile);
        } else {
            return this.validateUploadDir(dirForUpload);
        }
    }

    static validateExtraData(extraData) {
        const signature = {
            pipelineId: { type: 'string', required: true },
            branch: { type: 'string', required: true },
        };

        if (!_.isObject(extraData)) {
            throw new Error('Error, extraData must be object');
        }

        Object.keys(signature).forEach((key) => {
            if (extraData[key] && typeof extraData[key] !== signature[key].type) {
                throw new Error(`Error validate extra data, field ${key} have wrong type`);
            }

            if (signature[key].required && !extraData[key]) {
                throw new Error(`Error validate extra data, field ${key} is required`);
            }
        });
    }
}

module.exports = Validator;