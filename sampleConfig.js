module.exports = {
    entryPoint: '/react/path/App.js',
    searchDir: '/react/path',
    gitRoot: '/react/path', // need to figure out absolute path // required if input is stdin
    inputMode: 'stdin', // 'stdin' || 'config'
    gitIncludeFilter: file => file.indexOf('.js') >= 1,
    dependencyExcludeFilter: path => path.indexOf('node_modules') === -1,
    sourceToTestMapper: function (sourceFile, accumulator) {
        // iterates over git changed file list and related import file list
        if (sourceFile.indexOf('.test.js') >= 1) {
            // Add if this is already a test file
            accumulator.add(sourceFile)
            return
        }

        if (sourceFile.indexOf('.js') >= 1) {
            // Map multiple test files for single source file
            accumulator.add(sourceFile.replace(/\.js/, '.test.js'));
            accumulator.add(sourceFile.replace(/\.js/, '.snapshot.js'));
        }
    },
    outputWrite: function(fs, testCandidateSet) {
        // Write test candidates list to file if required
        // Or console.log in certain format to pipe
        fs.writeFile('/Users/sivakumar/Repos/node/sample/related_test.txt', Array.from(testCandidateSet).join(' '), err => {
            if(err) {
                console.log('output write error: ', err)
            }
        });
    },
    changeSet: [
        '/path/file1.js' // required if inputMode is 'config'
    ]
}
