var gulp = require('gulp'),
plugins = require('gulp-load-plugins')({ camelize: true });
var browserSync = require('browser-sync').create();

var paths = {
	src: {
        pug: 'views/*.pug',
		js: 'gulp/js/*.js',
		vendor: 'gulp/js/vendor/**/*.js',
		scss: 'gulp/scss/app.scss',
		scssWatch: 'gulp/scss/**/*.scss'
	},
	dest: {
		js: 'assets/js/',
		scss: 'assets/css/'
	}
};

function errorLog(error) {
    console.log(error.message);
    this.emit('end');
}

gulp.task('browser-sync', function() {
    browserSync.init( {
        proxy: "localhost:3000",
    } );
});

gulp.task('browser-reload', function() {
	browserSync.reload();
});

gulp.task('sass', function() {
	return gulp.src( paths.src.scss )
		.pipe( plugins.sass( { outputStyle: 'compressed' } ) )
		.on('error', errorLog)
		.pipe( plugins.autoprefixer( 'last 4 versions' ) )
		.pipe( gulp.dest( paths.dest.scss ) )
        .pipe( browserSync.stream() );
});

gulp.task('vendor', function(){
	return gulp.src( paths.src.vendor )
		.pipe( plugins.concat( 'vendor.min.js' ) )
		.pipe( plugins.uglify() )
		.on('error', errorLog)
		.pipe( gulp.dest( paths.dest.js ) );
});

gulp.task('js', function() {
	return gulp.src( paths.src.js )
		.pipe( plugins.concat( 'app.min.js' ) )
		.pipe( plugins.uglify() )
		.on('error', errorLog)
		.pipe( gulp.dest( paths.dest.js ) )
        .pipe( browserSync.stream() );
});

gulp.task('clearCache', function(done) {
	return plugins.cache.clearAll(done);
});

gulp.task('watch', function(){
    gulp.watch( paths.src.pug, ['browser-reload']);
	gulp.watch( paths.src.scssWatch, ['sass']);
	gulp.watch( paths.src.js, ['js']);
	gulp.watch( paths.src.vendor, ['vendor']);
});

gulp.task('default', ['sass', 'js', 'vendor', 'watch', 'browser-sync']);
