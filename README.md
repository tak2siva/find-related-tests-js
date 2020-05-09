## find-related-tests-js

Sometimes we need not to run all unit tests in our project. This library will try to find the related files(i.e import files) of all files changed in current branch.

This library can be an alternate for jest findRelatedTests or jest changedSince with much more flexibility. Here consumers are responsible to map test file for each related source file.  