const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const glob = require('glob');
const babelify =  require('babelify');
const babel =  require('gulp-babel');
const browserify = require("browserify");
const source = require('vinyl-source-stream');
const sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src(['./sass/**/*.scss','../node_modules/bootstrap/scss/*.scss'])
      .pipe(sourcemaps.init())
      .pipe(sass({ includePaths : ['sass/'] , outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(concat('style.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('../build/assets/css'));
});

gulp.task('babelify-server', function () {
    gulp.src('server.js')
          .pipe(sourcemaps.init())
          .pipe(babel({
              presets: ['@babel/preset-env']
          }))
          .pipe(concat('server.js'))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest('../build/src'))
});

gulp.task('babelify-routes', function () {
    gulp.src('./routes/*.js')
          .pipe(sourcemaps.init())
          .pipe(babel({
              presets: ['@babel/preset-env']
          }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest('../build/src/routes'))
});

gulp.task('babelify-model', function () {
    gulp.src('./models/*.js')
          .pipe(sourcemaps.init())
          .pipe(babel({
              presets: ['@babel/preset-env']
          }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest('../build/src/models'))
});


gulp.task('babelify-react-components', function () {
    glob('./components/*.js', function(err, files) {
      if(err) done(err);

      var tasks = files.map(function(entry){
          reactify(entry)
      })
    })
});

gulp.task('babelify-react-main', function () {
    glob('./main/*.js', function(err, files) {
      if(err) done(err);

      var tasks = files.map(function(entry){
          reactify(entry)
      })
    })
});

gulp.task('babelify-react', function() {
    gulp.start('babelify-react-components')
    gulp.start('babelify-react-main')
})

function reactify(item) {
  browserify({
    entries: item,
    extensions: [ '.js', '.jsx' ],
    debug: true // Add sourcemaps
  })
  .transform(babelify, {presets: ['@babel/preset-env',"@babel/react"]})
  .bundle()
    .on('error', console.error.bind(console))
  .pipe(source(item))
  .pipe(gulp.dest('../build/assets/js'))
}
