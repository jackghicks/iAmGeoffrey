module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            build: ["dist", "temp"],
            options: {force: true}
        },

        copy: {
            main: {
                files: [
                    // includes files within path and its sub-directories
                    {expand: true, cwd: 'base/', src: ['**'], dest: 'dist/iAmGeoffrey'}
                ]
            }
        },

        jade: {
            compile: {
                options: {
                    data: {
                        debug: false
                    }
                },
                files: {
                    "dist/iAmGeoffrey/game/index.html": ["jade/*.jade"]
                }
            }
        },

        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            clientOnly: {
                src: ['js/client/**/*.js'],
                dest: 'dist/iAmGeoffrey/game/client.min.js'
            },
            shared: {
                src: ['js/shared/**/*.js'],
                dest: 'dist/iAmGeoffrey/game/shared.min.js'
            },
            server: {
                src: ['js/server/**/*.js'],
                dest: 'dist/iAmGeoffrey/game/server.min.js'
            },
            css: {
                src: ['css/**/*.css'],
                dest: 'dist/iAmGeoffrey/game/style.min.css'
            }
        },

        uglify: {
            options: {
                banner: '',
                nameCache: '.grunt-uglify-cache.json'
            },
            build: {
                files: [
                    {expand: true, cwd: 'dist/iAmGeoffrey/game/', src: '*.min.js', dest: 'dist/iAmGeoffrey/game'}]
            }
        },

        cssmin: {
            target: {
                files: {
                    'dist/iAmGeoffrey/game/style.min.css': ['dist/iAmGeoffrey/game/style.min.css']
                }
            }
        },

        compress: {
            uncompressed: {
                options: {
                    archive: 'uncompressed.zip',
                    level: 0
                },
                files: [
                    {src: ['dist/iAmGeoffrey/**'], dest: ''}
                ]
            },
            compressed: {
                options: {
                    archive: 'compressed.zip',
                    level: 9
                },
                files: [
                    {src: ['dist/iAmGeoffrey/**'], dest: ''}
                ]
            }
        },

        watch: {
            cssjs: {
                files: ['**/*.js', '**/*.css'],
                tasks: ['concat', 'uglify', 'cssmin', 'compress'],
                options: {
                    spawn: false,
                },
            },
            jade: {
                files: ['**/*.jade'],
                tasks: ['jade', 'compress'],
                options: {
                    spawn: false,
                },
            }
        },


    });

    //load all the grunt plugins
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jade");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // Default task(s).
    grunt.registerTask('default', ['clean', 'copy', 'jade', 'concat', 'uglify', 'cssmin', 'compress']);
    grunt.registerTask('debug', ['clean', 'copy', 'jade', 'concat', 'cssmin', 'compress']);

    grunt.registerTask('watch', ['watch']);

};