module.exports = function(grunt) {
  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma-unit.conf.js'
      }
    }
  });
  grunt.loadNpmTasks('grunt-karma');
};
