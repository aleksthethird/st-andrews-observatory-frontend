var gulp = require('gulp');
var browserify = require('gulp-browserify');
var react = require('gulp-react');

gulp.task('build', function() {
	gulp.src('src/main.js')
		.pipe(browserify())
		.pipe(gulp.dest('./pkg'));
});

gulp.task('mvc', function() {
	gulp.src('src/mvc.jsx')
		.pipe(react())
		.pipe(browserify({
			extensions : '.jsx'
		}))
		.pipe(gulp.dest('./pkg'));
});

gulp.task('move', function() {
	gulp.src(['src/*.html', 'src/*.css', 'src/lib/*/*/*/*/*'])
		.pipe(gulp.dest('./pkg'));
});

gulp.task('default', ['build', 'move', 'mvc' ]);