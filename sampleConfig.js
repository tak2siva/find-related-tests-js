function mapSourceToTestFiles(sourceFile, accumulator) {
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
}

module.exports = {
    entryPoint: '/react/sample/App.js',
    searchDir: '/react/sample',
    dependencyExcludeFilter: path => path.indexOf('node_modules') === -1, // Ignore node module from dep graph
    // It is okay to add same file name in multiple callback
    // result will be unique
    sourceFileModifiedCb: mapSourceToTestFiles,
    directDependencyModifiedCb: mapSourceToTestFiles,
    transitiveDependencyModifiedCb: (sourceFile, accumulator) => {
        // This will be called if any transitive dependency is modified
        // A -> B -> C -> D
        // C & D are transitive dependency for A
    },
    outputFile: '/react/temp.txt',
}
