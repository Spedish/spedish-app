var path       = require('path');
var fs         = require('fs');
var formidable = require('formidable');
var nodeStatic = require('node-static');

fileServer = new nodeStatic.Server('/tmp/');

var nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/;

nameCountFunc = function (s, index, ext) {
  return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
};

setNoCacheHeaders = function(res) {
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Disposition', 'inline; filename="files.json"');
};

UploadHandler = function (req, res, callback) {
  this.req = req;
  this.res = res;
  this.callback = callback;
};

FileInfo = function (file) {
  this.name = file.name;
  this.size = file.size;
  this.type = file.type;
  this.deleteType = 'DELETE';
};

FileInfo.prototype.validate = function () {
/*
  if (options.minFileSize && options.minFileSize > this.size) {
    this.error = 'File is too small';
  } else if (options.maxFileSize && options.maxFileSize < this.size) {
    this.error = 'File is too big';
  } else if (!options.acceptFileTypes.test(this.name)) {
    this.error = 'Filetype not allowed';
  }
*/
  return !this.error;
};
FileInfo.prototype.safeName = function () {
  // Prevent directory traversal and creating hidden system files:
  this.name = path.basename(this.name).replace(/^\.+/, '');
  // Prevent overwriting existing files:
  /*
  while (_existsSync(options.uploadDir + '/' + this.name)) {
    this.name = this.name.replace(nameCountRegexp, nameCountFunc);
  }
  */
};
FileInfo.prototype.initUrls = function (req) {
  if (!this.error) {
    var that = this,
        //baseUrl = (options.ssl ? 'https:' : 'http:') + '//' + req.headers.host + options.uploadUrl;
        baseUrl = 'http://' + req.headers.host + '/gallery/';
        this.url = this.deleteUrl = baseUrl + encodeURIComponent(this.name);
        /*
        Object.keys(options.imageVersions).forEach(function (version) {
          if (_existsSync(
            options.uploadDir + '/' + version + '/' + that.name
          )) {
            that[version + 'Url'] = baseUrl + version + '/' +
              encodeURIComponent(that.name);
          }
        });
        */
  }
};

UploadHandler.prototype.post = function (req, res) {
  var handler = this,
      form = new formidable.IncomingForm(),
      tmpFiles = [],
      files = [],
      map = {},
      counter = 1,
      redirect,
      finish = function (req, res) {
          counter -= 1;
          if (!counter) {
              files.forEach(function (fileInfo) {
                  fileInfo.initUrls(handler.req);
              });
              handler.callback({files: files}, redirect, req, res);
          }
      };
  form.uploadDir = '/tmp';
  form.on('fileBegin', function (name, file) {
      tmpFiles.push(file.path);
      var fileInfo = new FileInfo(file, handler.req, true);
      fileInfo.safeName();
      map[path.basename(file.path)] = fileInfo;
      files.push(fileInfo);
  }).on('field', function (name, value) {
      if (name === 'redirect') {
          redirect = value;
      }
  }).on('file', function (name, file) {
      var fileInfo = map[path.basename(file.path)];
      fileInfo.size = file.size;
      if (!fileInfo.validate()) {
          fs.unlink(file.path);
          return;
      }
      //fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);
      fs.renameSync(file.path, '/tmp/' + fileInfo.name);
      /*
      if (options.imageTypes.test(fileInfo.name)) {
          Object.keys(options.imageVersions).forEach(function (version) {
              counter += 1;
              var opts = options.imageVersions[version];
              imageMagick.resize({
                  width: opts.width,
                  height: opts.height,
                  srcPath: options.uploadDir + '/' + fileInfo.name,
                  dstPath: options.uploadDir + '/' + version + '/' +
                      fileInfo.name
              }, finish);
          });
      }
      */
  }).on('aborted', function () {
      tmpFiles.forEach(function (file) {
          fs.unlink(file);
      });
  }).on('error', function (e) {
      console.log(e);
  }).on('progress', function (bytesReceived, bytesExpected) {
      /*
      if (bytesReceived > options.maxPostSize) {
          handler.req.connection.destroy();
      }
      */
  }).on('end', function () {
      finish(req, res);
  }).parse(handler.req);
};

handleResult = function (result, redirect, req, res) {
  if (redirect) {
      res.writeHead(302, {
          'Location': redirect.replace(
              /%s/,
              encodeURIComponent(JSON.stringify(result))
          )
      });
      res.end();
  } else {
      res.writeHead(200, {
          'Content-Type': req.headers.accept
              .indexOf('application/json') !== -1 ?
                      'application/json' : 'text/plain'
      });
      res.end(JSON.stringify(result));
  }
}

module.exports = function(app, route) {

  app.post('/'+route, function(req, res) {
    handler = new UploadHandler(req, res, handleResult);

    setNoCacheHeaders(res);
    handler.post(req, res);
  });

  app.get('/'+route+'*', function(req, res) {
    if (req.url === '/gallery') {
      setNoCacheHeaders(res);
      res.send('No listing allowed');
    } else {
      var f = req.url.substring(req.url.lastIndexOf('/') + 1);
      console.error(f);
      fileServer.serveFile(f, 200, {}, req, res);
    }
  });

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
