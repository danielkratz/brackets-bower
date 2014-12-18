/*global module */

module.exports = function (grunt) {
    "use strict";

    // load grunt tasks automatically
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
            "<%= grunt.template.today('yyyy-mm-dd') %>\n */\n",

        jshint: {
            all: {
                src: [
                    "**/*.js",
                    "!**/node_modules/**/*.js",
                ],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        },

        zip: {
            extension: {
                src: [
                    "nls/**",
                    "node/**",
                    "src/**",
                    "LICENSE",
                    "*.js",
                    "*.json",
                    "*.css",
                    "*.md"
                ],
                dest: "brackets-bower.zip"
            }
        }
    });

    grunt.registerTask("package", ["jshint", "zip"]);
};
