#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import log, {LogLevelDesc} from 'loglevel';

import {Executor, FindRelatedFiles2, FlushTestCandidates} from "./index";
import {Configuration, InputMode} from "./config";

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
                temp = temp.trim();
                if(temp) {
                    changeSet.add(temp);
                }
            }
            resolve(changeSet);
        });

        stdin.on('error', reject);
    });
}

export async function RunCmdLine(config: Configuration) {
    log.info("Project directory: ", process.cwd());
    log.info("Entry point: ", config.entryPoint);
    log.info("Search Dir: ", config.searchDir);
    if (process.stdin.isTTY) {
        log.info('No stdin');
    } else {
        log.info("Reading input stream..");
        await getChangedFilesFromStream(config).then((changeSet) => {
            log.info("\nModified Candidates..");
            log.info(changeSet);
            log.info("\n\n");

            config.changedFileSet = changeSet;
            const testCandidates: any = FindRelatedFiles2(config);

            log.info("Test Candidates..");
            log.info(testCandidates);
            log.info("\n\n");
            if(config.outputFile) {
                FlushTestCandidates(config, testCandidates);
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

console.log("\nFinding related test files..");
log.setDefaultLevel('info');
Run(getConfig());
