import yargs = require('yargs');
import fs from 'fs';

import { FindRelatedFiles } from "./index";
import {strict} from "assert";

export function getChangedFilesFromStream(config: any) {
    return new Promise<Set<string>>((resolve, reject) => {
        const stdin = process.stdin;
        const cwd = process.cwd();
        let data: string = '';
        let changeSet: Set<string> = new Set();

        stdin.setEncoding('utf8');
        stdin.on('data', function (chunk) {
            data += chunk;
        });

        stdin.on('end', function () {
            console.log(data);
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

console.log('Searching for related test files..');

async function init(argv: any) {
    let config: any;
    if (fs.existsSync(argv.configPath)) {
        console.log('file exists..');
        config = require(argv.configPath);
        console.log("config..", config);
    } else {
        console.log('file does not exists..');
    }
    console.log("Project directory: ", process.cwd());
    if (process.stdin.isTTY) {
        console.log('No stdin');
    } else {
        console.log("Reading input stream..");
        await getChangedFilesFromStream(config).then((changeSet) => {
            console.log("\nModified Candidates: ");
            console.log(changeSet);

            console.log("Entry point file: ", config.entryPoint);
            console.log("Search Dir: ", config.searchDir);
            const res: any = FindRelatedFiles(config.entryPoint, config.searchDir, changeSet);
            console.log("Result..", res);
        });
    }
}

const argv = yargs.options({
    configPath: {type: "string", demandOption: true},
}).argv;

init(argv);