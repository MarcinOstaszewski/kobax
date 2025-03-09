'use strict'

import gulp, {src, dest, series } from 'gulp';
import cleanCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import replace from 'gulp-replace';
import injectString from 'gulp-inject-string';
import rename from 'gulp-rename';
import gulpRemoveHtml from 'gulp-remove-html';
import fs from 'fs';

const config = {
  destDir: '../dist',
  cssFiles: ['./styles/normalize.css', './styles/styles.css'],
  jsFiles: './scripts/index.js',
  replace: {
    from: /assets/g,
    to: 'http://www.fronty-meblowe.pl/formularz/wp-content/uploads/2025/03/'
  },
  inject: {
    css: '<!-- inject:styles -->',
    js: '<!-- inject:scripts -->'
  }
}

gulp.task('styles', () => {
  return src(config.cssFiles)
    .pipe(concat('styles.css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.destDir));
});

gulp.task('scripts', () => {
  return src(config.jsFiles)
    .pipe(concat('scripts.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.destDir));
});

gulp.task('inject-inline-css-js-remove-start-end', () => {
  const cssContent = fs.readFileSync(`${config.destDir}/styles.min.css`, 'utf8');
  const jsContent = fs.readFileSync(`${config.destDir}/scripts.min.js`, 'utf8');
  return src('./fronty_giete.html')
    .pipe(replace(config.replace.from, config.replace.to)) // paths to images
    .pipe(injectString.replace(config.inject.css, `<style> ${cssContent} </style>`)) // styles inlined
    .pipe(injectString.replace(config.inject.js, `<script> ${jsContent} </script>`)) // scripts inlined
    .pipe(gulpRemoveHtml())
    .pipe(rename('fronty_giete__kod_WordPressa.html'))
    .pipe(dest(config.destDir))
    .on('finish', () => {
      console.log('>>>>>>>>>> Nowy plik HTML ze stylami i skryptami skompilował się w folderze /dist <<<<<<<<<<');
    });
});

gulp.task('default', series(
  'styles',
  'scripts',
  'inject-inline-css-js-remove-start-end',
));
