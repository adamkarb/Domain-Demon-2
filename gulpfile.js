var gulp = require('gulp');
var shell = require('gulp-shell');

// Run gulp to launch app
gulp.task('default', shell.task([
    'electron electron.js'
]));
