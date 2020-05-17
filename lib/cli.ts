#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import log, {LogLevelDesc} from 'loglevel';

import {FindRelatedFiles, Executor, FindRelatedFiles2} from "./index";
import {Configuration, InputMode} from "./config";
import {PostOrder} from "./explorer";

export function getChangedFilesFromStream(config: any) {
    return new Promise<Set<string>>((resolve, reject) => {
        const stdin = process.stdin;
        let data: string = '';
        let changeSet: Set<string> = new Set();

        stdin.setEncoding('utf8');
        stdin.on('data', function (chunk) {
            data += chunk;
        });

        stdin.on('end', function () {
            log.debug("\nGit diff --name-only: ", data);
            for (let temp of data.toString().split("\n")) {
                if (config.gitIncludeFilter(temp)) {
                    changeSet.add(config.gitRoot + '/' + temp);
                }
            }
            resolve(changeSet);
        });

        stdin.on('error', reject);
    });
}

export async function RunCmdLine(config: Configuration) {
    log.info("Project directory: ", process.cwd());
    if (process.stdin.isTTY) {
        log.info('No stdin');
    } else {
        log.info("Reading input stream..");
        await getChangedFilesFromStream(config).then((changeSet) => {
            log.info("\nModified Candidates..");
            log.info(changeSet);
            log.info("\n\n");

            log.info("Entry point: ", config.entryPoint);
            log.info("Search Dir: ", config.searchDir);
            config.changedFileSet = changeSet;
            const res: any = FindRelatedFiles2(config);
            log.info("Test Candidates..");
            log.info(res);
            log.info("\n\n");
            if(config.outputFile) {
                log.info("Writing test candidates to ", config.outputFile);
                fs.writeFile(config.outputFile, Array.from(res).join(' '), err => {
                    if(err) {
                        console.log('output write error: ', err)
                    }
                });
            }
        });
    }
}


function getConfig() : Configuration {
    const argv = yargs.options({
        configPath: {type: "string", demandOption: true},
        logLevel: {type: "string", default: "info"},
        entryPoint: {type: "string"},
        searchDir: {type: "string"},
        gitRoot: {type: "string"},
        outputFile: {type: "string"}
    }).argv;
    log.setDefaultLevel(argv.logLevel as LogLevelDesc);
    log.debug("Config file path: ", argv.configPath);
    log.debug("Config args: ", argv);

    let config: any;
    if (fs.existsSync(argv.configPath)) {
        log.debug('Config file exists');
        config = require(argv.configPath);
        config = {...config, ...argv};
        log.debug("Config Object: ", config);
    } else {
        log.error('Config file does not exists or wrong path: ', argv.configPath);
        throw new Error('Unable to load config file');
    }

    return new Configuration(config);
}

function Run(config: Configuration) {
    if(config.inputMode == InputMode.config) {
        Executor(config);
        return;
    } else {
        RunCmdLine(config);
    }
}

console.log('Searching for related test files..');
log.setDefaultLevel('info');
Run(getConfig());
// console.log(getConfig());