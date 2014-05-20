var gulp = require('gulp')
var browserify = require('gulp-browserify')

gulp.task('build', function() {
	gulp.src('main.js')
		.pipe(browserify())
		.pipe(gulp.dest('pkg'))
})

gulp.task('default', ['build'])