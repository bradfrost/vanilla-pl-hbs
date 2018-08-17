/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/
var gulp = require('gulp'),
  path = require('path'),
  browserSync = require('browser-sync').create(),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  svgSprite = require('gulp-svg-sprites'),
  scssToJson = require("scsstojson"),
  argv = require('minimist')(process.argv.slice(2)),
  chalk = require('chalk'),
  copy = require('gulp-copy'),
  autoprefixer = require('gulp-autoprefixer'),
  gulpRemoveHtml = require('gulp-remove-html');

/**
 * Normalize all paths to be plain, paths with no leading './',
 * relative to the process root, and with backslashes converted to
 * forward slashes. Should work regardless of how the path was
 * written. Accepts any number of parameters, and passes them along to
 * path.resolve().
 *
 * This is intended to avoid all known limitations of gulp.watch().
 *
 * @param {...string} pathFragment - A directory, filename, or glob.
*/
function normalizePath() {
  return path
    .relative(
      process.cwd(),
      path.resolve.apply(this, arguments)
    )
    .replace(/\\/g, "/");
}

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['build']);
});

/******************************************************
 * SASS
******************************************************/
gulp.task('pl-sass', function(){
  return gulp.src(path.resolve(paths().source.css, '**/*.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.resolve(paths().public.css)));
});

/******************************************************
 * SCSS TO JSON
 ******************************************************/
gulp.task("scsstojson", function (done) {
  var items = [
    {
      src: "./source/css/scss/abstracts/_variables.scss",
      dest: "./source/_patterns/00-atoms/01-global/00-brand-colors.json",
      lineStartsWith: "$color-brand-",
      allowVarValues: false
    },
    {
      src: "./source/css/scss/abstracts/_variables.scss",
      dest:
        "./source/_patterns/00-atoms/01-global/00-neutral-colors.json",
      lineStartsWith: "$color-neutral-",
      allowVarValues: false
    },
    {
      src: "./source/css/scss/abstracts/_variables.scss",
      dest:
        "./source/_patterns/00-atoms/01-global/00-utility-colors.json",
      lineStartsWith: "$color-utility-",
      allowVarValues: false
    },
    {
      src: "./source/css/scss/abstracts/_variables.scss",
      dest: "./source/_patterns/00-atoms/01-global/02-font-families.json",
      lineStartsWith: "$font-family-",
      allowVarValues: false
    },
    {
    src: "./source/css/scss/abstracts/_variables.scss",
    dest: "./source/_patterns/00-atoms/01-global/02-font-sizes.json",
    lineStartsWith: "$font-size-",
    allowVarValues: false
    }
  ];

  scssToJson(items, {}, function () {
    done();
  });
});

/******************************************************
* AUTOPREFIXER
******************************************************/
gulp.task('prefix', () =>
gulp.src('./public/css/style.css')
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false,
  grid: true
    }))
    .pipe(gulp.dest('./public/css/'))
);

/******************************************************
 * SVG SPRITE
******************************************************/
gulp.task('svg-sprite', function () {
  return gulp.src('source/icons/*.svg')
    .pipe(svgSprite({
      mode: 'symbols',
      cssFile: "../../css/svg-sprite.css",
      preview: {
          symbols: '../source/_patterns/00-atoms/images/icons.mustache'
      },
      svg: {
        symbols: 'icons.svg'
      }
    }))
    .pipe(gulp.dest('public'));
});

/******************************************************
 * CONCATENATE AND MINIFY
******************************************************/
gulp.task('concat-and-minify', function(done) {
  // main app js file
  gulp.src('./source/js/*.js')
  .pipe(uglify())
  .pipe(concat("production.min.js"))
  .pipe(gulp.dest('./public/js/'));

  // create 1 vendor.js file from all vendor plugin code
  gulp.src('./source/js/vendor/**/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('./public/js'));

  done();
});

/******************************************************
 * REMOVE PATTERN LAB STYLES FROM STYLE GUIDE SITE
 * Uses Deject tags to remove the <head> HTML files within
******************************************************/

gulp.task('strip', function () {
  return gulp.src('./public/patterns/**/*.rendered.html')
    .pipe(gulpRemoveHtml())
    .pipe(gulp.dest('../style-guide/patterns'));
});


/******************************************************
 * COPY TASKS - stream assets from source to destination
******************************************************/
// JS copy
gulp.task('pl-copy:js', function () {
  return gulp.src('**/*.js', {cwd: normalizePath(paths().source.js)} )
    .pipe(gulp.dest(normalizePath(paths().public.js)));
});

// Images copy
gulp.task('pl-copy:img', function () {
  return gulp.src('**/*.*',{cwd: normalizePath(paths().source.images)} )
    .pipe(gulp.dest(normalizePath(paths().public.images)));
});

// SVG CSS copy
gulp.task("pl-copy:svg-css", function () {
  return gulp
    .src("svg-sprite.css", {
      cwd: normalizePath(paths().source.css)
    })
    .pipe(gulp.dest(normalizePath(paths().public.css)));
});

// Favicon copy
gulp.task('pl-copy:favicon', function () {
  return gulp.src('favicon.ico', {cwd: normalizePath(paths().source.root)} )
    .pipe(gulp.dest(normalizePath(paths().public.root)));
});

// Fonts copy
gulp.task('pl-copy:font', function () {
  return gulp.src('*', {cwd: normalizePath(paths().source.fonts)})
    .pipe(gulp.dest(normalizePath(paths().public.fonts)));
});

// Pattern scaffolding copy
gulp.task("pl-copy:pattern-scaffolding", function () {
  return gulp
    .src("pattern-scaffolding.css", {
      cwd: normalizePath(paths().source.css)
    })
    .pipe(gulp.dest(normalizePath(paths().public.css)));
});

// Styleguide Copy everything but css
gulp.task('pl-copy:styleguide', function () {
  return gulp.src(normalizePath(paths().source.styleguide) + '/**/!(*.css)')
    .pipe(gulp.dest(normalizePath(paths().public.root)))
    .pipe(browserSync.stream());
});

// Styleguide Copy and flatten css
gulp.task('pl-copy:styleguide-css', function () {
  return gulp.src(normalizePath(paths().source.styleguide) + '/**/*.css')
    .pipe(gulp.dest(function (file) {
      //flatten anything inside the styleguide into a single output dir per http://stackoverflow.com/a/34317320/1790362
      file.path = path.join(file.base, path.basename(file.path));
      return normalizePath(path.join(paths().public.styleguide, '/css'));
    }))
    .pipe(browserSync.stream());
});

// This is the task that exports the results from Pattern Lab
// into the Jekyll style guide that lives outside of this repository
gulp.task('copy:export-to-styleguide', function (done) {

    // Export public/patterns directory to style guide's includes
    // This is used to include the actual code into the code samples
    gulp.src(['public/patterns/**/*', '!public/patterns/**/*.rendered.html'])
        .pipe(gulp.dest('../style-guide/_includes/patterns'));

    // Export public/patterns directory to style guide patterns directory
    // This is used to pipe the live patterns into the iframe
    gulp.src(['public/patterns/**/*', '!public/patterns/**/*.rendered.html'])
        .pipe(gulp.dest('../style-guide/patterns'));

    // Export css directory to style guide css directory
    gulp.src('public/css/**/*')
        .pipe(gulp.dest('../style-guide/css'));

    // Export js directory to style guide js directory
    gulp.src('public/js/**/*')
        .pipe(gulp.dest('../style-guide/js'));

    // Export icons to style guide root directory
    gulp.src('public/icons.svg')
        .pipe(gulp.dest('../style-guide'));

    // Export images directory to style guide images directory
    gulp.src('public/images/**/*')
        .pipe(gulp.dest('../style-guide/images'));

    // Export images directory to style guide images directory
    gulp.src('public/images/**/*')
        .pipe(gulp.dest('../style-guide/images'));

    done();
});

/******************************************************
 * PATTERN LAB CONFIGURATION - API with core library
******************************************************/
//read all paths from our namespaced config file
var config = require('./patternlab-config.json'),
  patternlab = require('patternlab-node')(config);

function paths() {
  return config.paths;
}

function getConfiguredCleanOption() {
  return config.cleanPublic;
}

/**
 * Performs the actual build step. Accomodates both async and sync
 * versions of Pattern Lab.
 * @param {function} done - Gulp done callback
 */
function build(done) {
  const buildResult = patternlab.build(() => {}, getConfiguredCleanOption());

  // handle async version of Pattern Lab
  if (buildResult instanceof Promise) {
    return buildResult.then(done);
  }

  // handle sync version of Pattern Lab
  done();
  return null;
}

gulp.task('pl-assets', gulp.series(
  'pl-copy:img',
  'pl-copy:favicon',
  'svg-sprite',
  'pl-copy:font',
  gulp.series('pl-sass', 'prefix', 'scsstojson', function(done){done();}), //CSS tasks
  'pl-copy:styleguide',
  'pl-copy:styleguide-css',
  'pl-copy:svg-css',
  'concat-and-minify'
));

gulp.task('patternlab:version', function (done) {
  patternlab.version();
  done();
});

gulp.task('patternlab:help', function (done) {
  patternlab.help();
  done();
});

gulp.task('patternlab:patternsonly', function (done) {
  patternlab.patternsonly(done, getConfiguredCleanOption());
});

gulp.task('patternlab:liststarterkits', function (done) {
  patternlab.liststarterkits();
  done();
});

gulp.task('patternlab:loadstarterkit', function (done) {
  patternlab.loadstarterkit(argv.kit, argv.clean);
  done();
});

gulp.task('patternlab:build', gulp.series('pl-assets', 'svg-sprite', build));

gulp.task('patternlab:installplugin', function (done) {
  patternlab.installplugin(argv.plugin);
  done();
});

/******************************************************
 * SERVER AND WATCH TASKS
******************************************************/
// watch task utility functions
function getSupportedTemplateExtensions() {
  var engines = require('./node_modules/patternlab-node/core/lib/pattern_engines');
  return engines.getSupportedFileExtensions();
}
function getTemplateWatches() {
  return getSupportedTemplateExtensions().map(function (dotExtension) {
    return normalizePath(paths().source.patterns, '**', '*' + dotExtension);
  });
}

/**
 * Reloads BrowserSync.
 * Note: Exits more reliably when used with a done callback.
 */
function reload(done) {
  browserSync.reload();
  done();
}

/**
 * Reloads BrowserSync, with CSS injection.
 * Note: Exits more reliably when used with a done callback.
 */
function reloadCSS(done) {
  browserSync.reload('*.css');
  done();
}

/**
 * Reloads BrowserSync, with JS injection.
 * Note: Exits more reliably when used with a done callback.
 */
function reloadJS(done) {
  browserSync.reload('*.js');
  done();
}

function watch() {
  const watchers = [
    {
      name: 'CSS',
      paths: [normalizePath(paths().source.css, '**', '*.scss')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('pl-sass', 'prefix', reloadCSS)
    },
    {
      name: 'SVG Sprite CSS',
      paths: [normalizePath(paths().source.css, 'svg-sprite.css')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('pl-copy:svg-css', reloadCSS)
    },
    {
      name: 'Pattern Scaffolding CSS',
      paths: [normalizePath(paths().source.css, 'pattern-scaffolding.css')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series("pl-copy:pattern-scaffolding", reloadCSS)
    },
    {
      name: 'Images',
      paths: [normalizePath(paths().source.images, '**', '*')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('pl-copy:img')
    },
    {
      name: 'Icons',
      paths: [normalizePath(paths().source.icons, '**', '*.svg')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('svg-sprite')
    },
    {
      name: 'JavaScript',
      paths: [normalizePath(paths().source.js, '**', '*.js')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('concat-and-minify', reloadJS)
    },
    {
      name: 'Styleguide Files',
      paths: [normalizePath(paths().source.styleguide, '**', '*')],
      config: { awaitWriteFinish: true },
      tasks: gulp.series('pl-copy:styleguide', 'pl-copy:styleguide-css', reloadCSS)
    },
    {
      name: 'Source Files',
      paths: [
        normalizePath(paths().source.patterns, '**', '*.json'),
        normalizePath(paths().source.patterns, '**', '*.md'),
        normalizePath(paths().source.data, '**', '*.json'),
        normalizePath(paths().source.fonts, '**', '*'),
        normalizePath(paths().source.images, '**', '*'),
        normalizePath(paths().source.icons, '**', '*'),
        normalizePath(paths().source.meta, '**', '*'),
        normalizePath(paths().source.annotations, '**', '*')
      ].concat(getTemplateWatches()),
      config: { awaitWriteFinish: true },
      tasks: gulp.series(build, reload)
    }
  ];

  watchers.forEach(watcher => {
    console.log('\n' + chalk.bold('Watching ' + watcher.name + ':'));
    watcher.paths.forEach(p => console.log('  ' + p));
    gulp.watch(watcher.paths, watcher.config, watcher.tasks);
  });
  console.log();
}

gulp.task('patternlab:connect', gulp.series(function (done) {
  browserSync.init({
    server: {
      baseDir: normalizePath(paths().public.root)
    },
    snippetOptions: {
      // Ignore all HTML files within the templates folder
      blacklist: ['/index.html', '/', '/?*']
    },
    notify: {
      styles: [
        'display: none',
        'padding: 15px',
        'font-family: sans-serif',
        'position: fixed',
        'font-size: 1em',
        'z-index: 9999',
        'bottom: 0px',
        'right: 0px',
        'border-top-left-radius: 5px',
        'background-color: #1B2032',
        'opacity: 0.4',
        'margin: 0',
        'color: white',
        'text-align: center'
      ]
    }
  }, function () {
    done();
  });
}));

/******************************************************
 * COMPOUND TASKS
******************************************************/
gulp.task('default', gulp.series('patternlab:build'));
gulp.task('patternlab:watch', gulp.series('patternlab:build', 'svg-sprite', watch));
gulp.task('patternlab:serve', gulp.series('patternlab:build', 'svg-sprite', 'patternlab:connect', watch));
gulp.task('style-guide-export', gulp.series('patternlab:build', 'svg-sprite', 'copy:export-to-styleguide', 'strip'));
