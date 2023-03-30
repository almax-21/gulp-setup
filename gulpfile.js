"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const fileinclude = require('gulp-file-include');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const svgSprite = require('gulp-svg-sprite');
const browserSync = require("browser-sync").create();
const del = require("del");

gulp.task("clean", () => {
  return del("dist");
});

gulp.task('svgSprite', () => {
  return gulp.src('src/img/*.svg')
      .pipe(svgSprite({
              mode: {
                  stack: {
                      sprite: "../sprite.svg"
                  }
              },
          }
      ))
      .pipe(gulp.dest('src/img/'));
});

gulp.task("copy assets", () => {
  return gulp.src([
    "src/fonts/**",
    "src/img/**",
    "src/*.ico"
  ], {
    base: "src"
  })
  .pipe(gulp.dest("dist"));
});

gulp.task("html", () => {
  return gulp.src(["src/*.html"], { base: "src" })
  .pipe(fileinclude({ prefix: '@', basepath: '@file' }))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("dist"));
});

gulp.task("css", () => {
  return gulp.src("src/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("dist/css"))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task("build", gulp.series(
  "clean",
  "copy assets",
  "html",
  "css",
  "js"
  ));

gulp.task("server", () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("src/scss/**/*.scss", gulp.series("css"));
  gulp.watch("src/**/*.html", gulp.series("html", "refresh"));
  gulp.watch("src/js/*.js", gulp.series("js", "refresh"));
});

gulp.task("refresh", (done) => {
  browserSync.reload();
  done();
});

gulp.task("start", gulp.series("build", "server"));
