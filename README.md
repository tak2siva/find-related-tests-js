## find-related-tests-js

Sometimes we need not run all unit tests in our project. This library will try to find the related files(i.e import files) of all files changed in current branch.

This library can be an alternate for jest findRelatedTests or jest changedSince with much more flexibility. Here consumers are responsible to map test file for each related source file.

``npm install --save find-related-tests-js``

---

### Usage
  

```
// config.js
// mandatory parameters

module.exports = {
    // To filter the modified candidates
    gitIncludeFilter: file => file.slice(-3) === '.js',

    // Ignore library / unnecessary files from dependency graph. 
    dependencyExcludeFilter: path => path.indexOf('node_modules') === -1,

    // It is users responsibility to map test file for each source file.
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
    }
}

```  


#### Run via command line

To findRelatedTests for staged files in Git

```
git diff --name-only | find-related-tests-js --configPath $PWD/config.js --entryPoint $PWD/App.js --searchDir $PWD/src --gitRoot $PWD --outputFile temp.txt
```

To findRelatedTests for files committed but not pushed 

```
git diff --name-only origin..head | find-related-tests-js --configPath $PWD/config.js --entryPoint $PWD/App.js --searchDir $PWD/src --gitRoot $PWD --outputFile temp.txt
```

If you have not installed this package globally then use ``./node_modules/find-related-tests-js/dist/cli.js`` as executable.


#### Test Runner

Above command will find all related test files and write their path to configured output file.
Run test candidates with required runner 

```yarn jest $(cat temp.txt)```


