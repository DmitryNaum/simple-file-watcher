#!/usr/bin/env node
const notifier = require('node-notifier');
const hound = require('hound');
const fs = require('fs');
const path = require('path');

var notify = function (file, message) {
    notifier.notify({
        'title': file,
        'message': message,
        icon: path.join(__dirname, 'warning.png')
    });
};

function watchChanges(file) {
    var stat = fs.statSync(file);
    var lastFileSize = stat.size;
    watcher = hound.watch(file);
    watcher.on('change', function (file, stats) {
        fs.open(file, 'r', function (err, fd) {
            var offset = lastFileSize;
            var len = stats.size - lastFileSize;
            var buffer = new Buffer(len);

            lastFileSize = stats.size;
            fs.read(fd, buffer, null, len, offset, function (a, b, buff) {
                notify(file, buff.toString('utf-8'));
            });
        });

    })
}


var files = process.argv.slice(2);
files.forEach(function (fileOrDir) {
    var fileStats = fs.statSync(fileOrDir);
    if (fileStats.isDirectory()) {
        var dirFiles = fs.readdirSync(fileOrDir);
        dirFiles.forEach(function (file) {
            var filePath = path.join(fileOrDir, file);
            watchChanges(filePath);
        })
    } else {
        watchChanges(fileOrDir);
    }
});
