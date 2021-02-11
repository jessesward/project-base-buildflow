"use strict";

const gulp = require("gulp"),
    fs = require("fs"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    notify = require("gulp-notify"),
    postcss = require("gulp-postcss"),
    minify = require("gulp-minify"),
    rename = require('gulp-rename'),
    browserSync = require("browser-sync").create(),
    browserify = require('browserify'),
    babel = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    tailwindcss = require('tailwindcss');

gulp.task("sass", () => {
    return gulp
        .src("resources/scss/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(
            postcss([
                tailwindcss('./tailwind.config.js'),
                require("autoprefixer")({
                    browserlist: [
                        "last 2 versions"
                    ],
                    grid: true
                })
            ])
        )
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./public/css"))
        .pipe(notify({
            message: "Sass Complied",
            onLast: true
        }));
});


const jsSRC = 'site.js';
const jsFOLDER = './resources/js/';
const jsDIST = 'public/js/';
const jsWatch = './resources/js/**/*.js';
const getFiles = function (folder, type) {
    const files = [];
    fs.readdirSync(folder).forEach(file => {
        if (file.split('.').pop() === type) {
            files.push(file);
        }
    });
    return files;
}
const jsFILES = getFiles(jsFOLDER, 'js');


gulp.task("js", (done) => {
    jsFILES.map(entry => {
        return browserify({
                entries: [jsFOLDER + entry]
            })
            .transform(babel, {
                global: true,
                presets: ["@babel/preset-env"],
                plugins: ['@babel/plugin-transform-modules-commonjs']
            })
            .bundle()
            .pipe(source(entry))
            .pipe(rename({
                extname: '.js'
            }))
            .pipe(buffer())
            .pipe(sourcemaps.init({
                loadMaps: true
            }))
            .pipe(
                minify({
                    noSource: true,
                    ext: {
                        min: ".js"
                    }
                })
            )
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(jsDIST));
    });
    done();
});

gulp.task(
    "watch",
    gulp.series("sass", "js", () => {
        browserSync.init({
            proxy: "http://localhost"
        });
        gulp.watch("resources/scss/**/*.scss", gulp.series("sass")).on(
            "change",
            browserSync.reload,
            notify("SCSS File Changed").write("")
        );
        gulp.watch("resources/js/**/*.js", gulp.series("js")).on(
            "change",
            browserSync.reload,
            notify("JS File Changed").write("")
        );
        gulp.watch(["resources/views/**/*.html", "resources/views/**/*.php"]).on(
            "change", () => {
                browserSync.reload();
                notify("Template File Changed").write("");
            });
    })
);

gulp.task("build", gulp.series("sass", "js"));