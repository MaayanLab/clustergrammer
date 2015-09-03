module.exports = function(grunt) {
    
    var src_files = [
        '../src/_open.js',
        '../src/Utils.js',
        '../src/Config.js',
        '../src/Colors.js',
        '../src/Dendrogram.js',
        '../src/Matrix.js',
        '../src/Search.js',
        '../src/Viz.js',
        '../src/Reorder.js',
        '../src/zoom.js',
        '../src/main.js',
        '../src/_close.js'
    ];
    
    grunt.initConfig({
        concat: {
            default: {
                src: src_files,
                dest: '../d3_clustergram.js'
            }
        },
        watch: {
            files: src_files,
            tasks: ['build']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('build', ['concat']);
};
