/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, browser: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, describe, it, expect, beforeEach, afterEach, beforeFirst, afterLast, waitsForDone, waitsForFail,
runs, $, brackets, waitsForDone */

define(function (require, exports, module) {
    "use strict";

    var SpecRunnerUtils = brackets.getModule("spec/SpecRunnerUtils");

    describe("BracketsBower - Metadata", function () {
        var tempDir = SpecRunnerUtils.getTempDirectory(),
            testWindow;

        beforeFirst(function () {
            runs(function () {
                var folderPromise = new $.Deferred();

                SpecRunnerUtils.createTestWindowAndRun(this, function (w) {
                    testWindow = w;
                    folderPromise.resolve();
                });

                waitsForDone(folderPromise, "waiting for test project to be opened");
            });
        });

        beforeEach(function () {
            runs(function () {
                SpecRunnerUtils.createTempDirectory();
                SpecRunnerUtils.loadProjectInTestWindow(tempDir);
            });
        });

        afterEach(function () {
            runs(function () {
                SpecRunnerUtils.removeTempDirectory();
            });
        });

        afterLast(function () {
            runs(function () {
                SpecRunnerUtils.closeTestWindow();
            });
        });

        describe("BowerJson", function () {
            var BowerJson = require("src/bower/metadata/BowerJson"),
                Package = require("src/bower/PackageFactory")._Package;

            it("should create a BowerJson object with default content", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    content;

                runs(function () {
                    var promise = bowerJson.create();

                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();

                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                runs(function () {
                    expect(bowerJson.AbsolutePath).not.toBeNull();
                    expect(bowerJson.AbsolutePath).toBeDefined();
                    expect(bowerJson.ProjectPath).not.toBeNull();
                    expect(bowerJson.ProjectPath).toBeDefined();

                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(0);
                    expect(Object.keys(content.devDependencies).length).toBe(0);
                });
            });

            it("should create a BowerJson object with the given content (only dependencies)", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    pkg2 = new Package("dep2"),
                    packages = [],
                    content;

                pkg1.version = "1.0.0";
                pkg2.version = "1.1.0";

                packages.push(pkg1);
                packages.push(pkg2);

                runs(function () {
                    var promise = bowerJson.create(packages);

                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();

                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                runs(function () {
                    expect(bowerJson.AbsolutePath).not.toBeNull();
                    expect(bowerJson.AbsolutePath).toBeDefined();
                    expect(bowerJson.ProjectPath).not.toBeNull();
                    expect(bowerJson.ProjectPath).toBeDefined();

                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).not.toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(2);

                    expect(content.dependencies[pkg1.name]).toBe(pkg1.version);
                    expect(content.dependencies[pkg2.name]).toBe(pkg2.version);
                });
            });

            it("should create a BowerJson object with the given content (only devDependencies)", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    pkg2 = new Package("dep2"),
                    packages = [],
                    content;

                pkg1.version = "1.0.0";
                pkg1.isDevDependency = true;
                pkg2.version = "1.1.0";
                pkg2.isDevDependency = true;

                packages.push(pkg1);
                packages.push(pkg2);

                runs(function () {
                    var promise = bowerJson.create(packages);

                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();

                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                runs(function () {
                    expect(bowerJson.AbsolutePath).not.toBeNull();
                    expect(bowerJson.AbsolutePath).toBeDefined();
                    expect(bowerJson.ProjectPath).not.toBeNull();
                    expect(bowerJson.ProjectPath).toBeDefined();

                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.devDependencies).length).toBe(2);

                    expect(content.devDependencies[pkg1.name]).toBe(pkg1.version);
                    expect(content.devDependencies[pkg2.name]).toBe(pkg2.version);
                });
            });

            it("should create a BowerJson object with the given content (dependencies and devDependencies)", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    pkg2 = new Package("dep2"),
                    pkg3 = new Package("dep3"),
                    pkg4 = new Package("dep4"),
                    pkg5 = new Package("dep5"),
                    packages = [],
                    content;

                pkg1.version = "1.0.0";
                pkg2.version = "1.1.0";
                pkg3.version = "1.0.0";
                pkg4.version = "1.1.0";
                pkg5.version = "1.1.0";

                pkg1.isDevDependency = false;
                pkg2.isDevDependency = true;
                pkg3.isDevDependency = false;
                pkg4.isDevDependency = true;
                pkg5.isDevDependency = true;

                packages.push(pkg1);
                packages.push(pkg2);
                packages.push(pkg3);
                packages.push(pkg4);
                packages.push(pkg5);

                runs(function () {
                    var promise = bowerJson.create(packages);

                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();

                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                runs(function () {
                    expect(bowerJson.AbsolutePath).not.toBeNull();
                    expect(bowerJson.AbsolutePath).toBeDefined();
                    expect(bowerJson.ProjectPath).not.toBeNull();
                    expect(bowerJson.ProjectPath).toBeDefined();

                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(2);
                    expect(Object.keys(content.devDependencies).length).toBe(3);

                    expect(content.dependencies[pkg1.name]).toBe(pkg1.version);
                    expect(content.devDependencies[pkg2.name]).toBe(pkg2.version);
                    expect(content.dependencies[pkg3.name]).toBe(pkg3.version);
                    expect(content.devDependencies[pkg4.name]).toBe(pkg4.version);
                    expect(content.devDependencies[pkg5.name]).toBe(pkg5.version);
                });
            });

            it("should update the version for a dependency when it exists", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    newVersion = "2.0.0",
                    packages = [],
                    content;

                pkg1.version = "1.0.0";

                packages.push(pkg1);

                // create bower.json content
                runs(function () {
                    var promise = bowerJson.create(packages);
                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).not.toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(1);

                    expect(content.dependencies[pkg1.name]).toBe(pkg1.version);
                });

                // update package version in bower.json
                runs(function () {
                    var promise = bowerJson.updatePackageVersion(pkg1.name, newVersion);
                    waitsForDone(promise, "package version updated in bower.json");
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).not.toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(1);

                    expect(content.dependencies[pkg1.name]).toBe(newVersion);
                });
            });

            it("should update the version for a devDependency when it exists", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    newVersion = "2.0.0",
                    packages = [],
                    content;

                pkg1.version = "1.0.0";
                pkg1.isDevDependency = true;

                packages.push(pkg1);

                // create bower.json content
                runs(function () {
                    var promise = bowerJson.create(packages);
                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.devDependencies).length).toBe(1);

                    expect(content.devDependencies[pkg1.name]).toBe(pkg1.version);
                });

                // update package version in bower.json
                runs(function () {
                    var promise = bowerJson.updatePackageVersion(pkg1.name, newVersion);
                    waitsForDone(promise, "package version updated in bower.json");
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.devDependencies).length).toBe(1);

                    expect(content.devDependencies[pkg1.name]).toBe(newVersion);
                });
            });

            it("should not update the version for a dependency when it doesn't exists", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    nonDepName = "nonDep",
                    nonDepVersion = "2.0.0",
                    packages = [],
                    content;

                pkg1.version = "1.0.0";

                packages.push(pkg1);

                // create bower.json content
                runs(function () {
                    var promise = bowerJson.create(packages);
                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).not.toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(1);

                    expect(content.dependencies[pkg1.name]).toBe(pkg1.version);
                });

                // update package version in bower.json
                runs(function () {
                    var promise = bowerJson.updatePackageVersion(nonDepName, nonDepVersion);
                    waitsForFail(promise, "package version not updated in bower.json");
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).not.toBeDefined();
                    expect(Object.keys(content.dependencies).length).toBe(1);

                    expect(content.dependencies[pkg1.name]).toBe(pkg1.version);
                    expect(content.dependencies[pkg1.name]).not.toBe(nonDepVersion);
                });
            });

            it("should update the version for a devDependency it exists", function () {
                var bowerJson = new BowerJson(tempDir + "/", "test-app"), // TODO check this
                    pkg1 = new Package("dep1"),
                    nonDepName = "nonDep",
                    nonDepVersion = "2.0.0",
                    packages = [],
                    content;

                pkg1.version = "1.0.0";
                pkg1.isDevDependency = true;

                packages.push(pkg1);

                // create bower.json content
                runs(function () {
                    var promise = bowerJson.create(packages);
                    waitsForDone(promise, "bower.json file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.devDependencies).length).toBe(1);

                    expect(content.devDependencies[pkg1.name]).toBe(pkg1.version);
                });

                // update package version in bower.json
                runs(function () {
                    var promise = bowerJson.updatePackageVersion(nonDepName, nonDepVersion);
                    waitsForFail(promise, "package version not updated in bower.json");
                });

                runs(function () {
                    var deferred = new $.Deferred();
                    bowerJson.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                // check
                runs(function () {
                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.name).toBe("test-app");
                    expect(content.dependencies).toBeDefined();
                    expect(content.devDependencies).toBeDefined();
                    expect(Object.keys(content.devDependencies).length).toBe(1);

                    expect(content.devDependencies[pkg1.name]).toBe(pkg1.version);
                    expect(content.devDependencies[pkg1.name]).not.toBe(nonDepVersion);
                });
            });
        });

        describe("BowerRc", function () {
            var BowerRc = require("src/bower/metadata/BowerRc");

            it("should create a BowerJson object with default content", function () {
                var bowerRc = new BowerRc(tempDir + "/", "test-app"), // TODO check this
                    content;

                runs(function () {
                    var promise = bowerRc.create();

                    waitsForDone(promise, ".bowerrc file created", 3000);
                });

                runs(function () {
                    var deferred = new $.Deferred();

                    bowerRc.read().then(function (res) {
                        content = JSON.parse(res);
                        deferred.resolve();
                    }).fail(function (err) {
                        deferred.reject(err);
                    });

                    waitsForDone(deferred.promise(), "read content");
                });

                runs(function () {
                    expect(bowerRc.AbsolutePath).not.toBeNull();
                    expect(bowerRc.AbsolutePath).toBeDefined();
                    expect(bowerRc.ProjectPath).not.toBeNull();
                    expect(bowerRc.ProjectPath).toBeDefined();

                    expect(content).not.toBeNull();
                    expect(content).toBeDefined();

                    expect(content.directory).toBeDefined();
                    expect(content.directory).toBe("bower_components/");
                });
            });
        });
    });
});