/* eslint-disable comma-dangle, no-var */
const gulp = require('gulp');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const htmllint = require('gulp-htmllint');
const gutil = require('gulp-util');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');
const babel = require('gulp-babel');
const strip = require('gulp-strip-comments');
const eslint = require('gulp-eslint');

gulp.task('concatinate-html', () =>
  gulp.src('src/partials/**/*.html')
  .pipe(templateCache({
    module: 'dunner',
    transformUrl: url => url.replace(/[\w-]+\//g, ''),
  })).pipe(gulp.dest('src/js'))
);

gulp.task('concatinate-src-js', () =>
  gulp.src([
    'src/js/routes.js',
    'src/js/templates.js',
    'src/js/route-change-handlers.js',
    'src/js/factories/*',
    'src/js/directives/*',
    'src/js/filters/*',
    'src/js/controllers/*',
  ]).pipe(concat('main.js'))
  .pipe(gulp.dest('src'))
);

gulp.task('lint-js', () =>
  gulp.src([
    'gulpfile.js',
    'server.js',
    'src/js/**/*.js',
    '!src/js/templates.js',
    'api/**/*.js',
    'models/**/*.js',
    'test/**/*.js',
  ]).pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
);

function htmlLintReporter(filepath, issues) {
  if (issues.length > 0) {
    issues.forEach((issue) => {
      gutil.log(gutil.colors.white(`${filepath} [${issue.line},${issue.column}]: `)
      + gutil.colors.red(`(${issue.code}) ${issue.msg}`));
    });
    process.exitCode = 1;
  }
}

gulp.task('lint-html', () =>
  gulp.src(['src/**/*.html', '../heroku/public/index.html'])
  .pipe(htmllint({ failOnError: true }, htmlLintReporter))
);

gulp.task('sass-to-css', () =>
  gulp.src('src/sass/main.scss')
  .pipe(sass().on('error', sass.logError)) // sass -> css
  .pipe(autoprefixer({ // add vendor prefixes
    browsers: ['last 2 versions']
  })).pipe(gulp.dest('src'))
  .pipe(browserSync.reload({ stream: true }))
);

gulp.task('lint-sass', () =>
  gulp.src('src/sass/**/*.scss')
  .pipe(sassLint({
    rules: {
      'no-important': 0,
      'no-ids': 0
    }
  })).pipe(sassLint.format())
  .pipe(sassLint.failOnError())
);

gulp.task('browser-sync', ['nodemon'], () =>
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    port: 5000,
    open: false
  })
);

gulp.task('nodemon', (callback) => {
  var callbackCalled = false;
  return nodemon({ script: './server.js' }).on('start', () => {
    if (!callbackCalled) {
      callbackCalled = true;
      callback();
    }
  });
});

/* Build Tasks */

gulp.task('build-css', ['minify-css'], () =>
  gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
    '../heroku/public/main.css',
    'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css'
  ]).pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(concat('dunner.min.css'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('../heroku/public/css'))
);

gulp.task('minify-css', () =>
  gulp.src('src/main.css')
  .pipe(cleanCSS({ keepSpecialComments: 0 }))
  .pipe(gulp.dest('../heroku/public'))
);

gulp.task('build-js', ['babel-minify-js'], () =>
  gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/angular/angular.min.js',
    'bower_components/angular-route/angular-route.min.js',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    '../heroku/public/main.js',
    'bower_components/moment/min/moment.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
    'bower_components/underscore/underscore-min.js'
  ]).pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(strip())
  .pipe(concat('dunner.min.js'))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('../heroku/public/js'))
);

gulp.task('babel-minify-js', () =>
  gulp.src('src/main.js')
  .pipe(babel({
    presets: ['es2015']
  })).pipe(uglify())
  .pipe(gulp.dest('../heroku/public'))
);

gulp.task('watch', () => {
  gulp.watch('src/partials/**/*.html', ['concatinate-html']);
  gulp.watch('src/sass/**/*.scss', ['sass-to-css']);
  gulp.watch('src/js/**/*.js', ['concatinate-src-js']);
});

gulp.task('default', ['browser-sync', 'watch']);
