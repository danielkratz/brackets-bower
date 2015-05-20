/*
 * Copyright (c) 2014 Narciso Jaramillo. All rights reserved.
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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4,
maxerr: 50, browser: true */
/*global define, brackets */

define(function (require, exports, module) {
    "use strict";

    var _              = brackets.getModule("thirdparty/lodash"),
        PackageManager = require("src/bower/PackageManager");

    /**
     * @constructor
     */
    function BowerProject(name, rootPath, packageManager) {
        /** @private */
        this._name = name;
        /** @private */
        this._rootPath = rootPath;
        /** @private */
        this._packageManager = packageManager;
        /** @private */
        this._activeDir = null;
        /** @private */
        this._shortActiveDir = null;
        /** @private */
        this._packages = {};

        /** @private */
        this._activeBowerJson = null;
    }

    Object.defineProperty(BowerProject.prototype, "name", {
        get: function () {
            return this._name;
        }
    });

    Object.defineProperty(BowerProject.prototype, "rootPath", {
        get: function () {
            return this._rootPath;
        }
    });

    Object.defineProperty(BowerProject.prototype, "activeDir", {
        set: function (activeDir) {
            this._activeDir = activeDir;

            // calculate shortPath
            if (this._activeDir === this._rootPath) {
                this._shortActiveDir = "";
            } else {
                this._shortActiveDir = this._activeDir.slice(this._rootPath.length);
            }
        },
        get: function () {
            return this._activeDir;
        }
    });

    Object.defineProperty(BowerProject.prototype, "shortActiveDir", {
        get: function () {
            return this._shortActiveDir;
        }
    });

    Object.defineProperty(BowerProject.prototype, "activeBowerJson", {
        set: function (activeBowerJson) {
            this._activeBowerJson = activeBowerJson;
        },
        get: function () {
            return this._activeBowerJson;
        }
    });

    BowerProject.prototype.getPath = function () {
        return (this._activeDir || this._rootPath);
    };

    /**
     * Set the packages.
     * @param {Array} packagesArray
     */
    BowerProject.prototype.setPackages = function (packagesArray) {
        this._packages = {};

        this.addPackages(packagesArray);
    };

    /**
     * Add project packages.
     * @param {Array} packagesArray
     */
    BowerProject.prototype.addPackages = function (packagesArray) {
        var that = this,
            packagesInstalled = [],
            packagesUpdated = [],
            result;

        packagesArray.forEach(function (pkg) {
            if (that._packages[pkg.name]) {
                packagesUpdated.push(pkg);
            } else {
                packagesInstalled.push(pkg);
            }

            that._packages[pkg.name] = pkg;
        });

        result = {
            installed: packagesInstalled,
            updated: packagesUpdated
        };

        this._packageManager.notifyDependenciesAdded(result);

        return result;
    };

    /**
     * Remove packages by its name.
     * @param {Array} names
     */
    BowerProject.prototype.removePackages = function (names) {
        var that = this,
            removedPkgs = [];

        names.forEach(function (name) {
            var pkg = that._packages[name];

            if (pkg) {
                removedPkgs.push(pkg);

                delete that._packages[name];
            }
        });

        this._packageManager.notifyDependenciesRemoved(removedPkgs);
    };

    /**
     * Get the package by the given name;
     * @param {string} name
     * @return {object}
     */
    BowerProject.prototype.getPackageByName = function (name) {
        return this._packages[name];
    };

    /**
     * Get the current packages array.
     * @private
     * @returns {Array} packages
     */
    BowerProject.prototype.getPackagesArray = function () {
        var packagesArray = [];

        _.forEach(this._packages, function (pkg, pkgName) {
            packagesArray.push(pkg);
        });

        return packagesArray;
    };

    /**
     * Update the given package.
     * @param {Package} pkg
     */
    BowerProject.prototype.updatePackage = function (pkg) {
        this._packages[pkg.name] = pkg;

        this._packageManager.notifyDependencyUpdated(pkg);
    };

    /**
     * Check if the project has dependencies.
     * @return {boolean}
     */
    BowerProject.prototype.hasPackages = function () {
        return (Object.keys(this._packages).length !== 0);
    };

    /**
     * Check if the given package is installed for the project.
     * @return {boolean}
     */
    BowerProject.prototype.hasPackage = function (name) {
        var pkg = this._packages[name];

        return (pkg && pkg.isInstalled());
    };

    /**
     * Check if there is some uninstalled package. An uninstalled package
     * is the one that is defined in the bower.json but is not installed
     * in the libraries folder.
     * @return {boolean}
     */
    BowerProject.prototype.hasUninstalledPackages = function () {
        var hasUninstalled = _.some(this._packages, function (pkg) {
            return pkg.isMissing();
        });

        return hasUninstalled;
    };

    /**
     * Check if there is some extraneous package. An extraneous package is the
     * one that is installed (available at the libraries folder) but is not
     * defined in the bower.json file.
     * @return {boolean}
     */
    BowerProject.prototype.hasExtraPackages = function () {
        var hasExtraneous = _.some(this._packages, function (pkg) {
            return pkg.isNotTracked();
        });

        return hasExtraneous;
    };

    /**
     * Get the project uninstalled packages.
     * @return {Array}
     */
    BowerProject.prototype.getUninstalledPackages = function () {
        return _.filter(this._packages, function (pkg) {
            return pkg.isMissing();
        });
    };

    /**
     * Get the project extraneous packages.
     * @return {Array}
     */
    BowerProject.prototype.getExtraneousPackages = function () {
        return _.filter(this._packages, function (pkg) {
            return pkg.extraneous;
        });
    };

    BowerProject.prototype.getBowerJsonDependencies = function () {
        var deps = null;

        if (this._activeBowerJson) {
            deps = this._activeBowerJson.getAllDependencies();
        }

        return deps;
    };

    BowerProject.prototype.notifyBowerJsonChanged = function () {
        var that = this,
            isAnyModification,
            projectPkg,
            currentPackages = that.getPackagesArray();

        PackageManager.listProjectDependencies().then(function (packagesArray) {

            if (currentPackages.length !== packagesArray.length) {
                that.setPackages(packagesArray);
            } else {
                isAnyModification = _.some(packagesArray, function (pkg) {
                    projectPkg = that.getPackageByName(pkg.name);

                    return !projectPkg.isEqualTo(pkg);
                });

                if (isAnyModification) {
                    that.setPackages(packagesArray);
                }
            }
        });
    };

    module.exports = BowerProject;
});
