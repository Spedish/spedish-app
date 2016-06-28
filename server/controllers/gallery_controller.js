var path        = require('path');
var fs          = require('fs');
var formidable  = require('formidable');
var nodeStatic  = require('node-static');
var imageMagick = require('imagemagick');

var options    = {
  tmpDir: '/tmp/t',
  galleryDir: '/tmp/gallery',
  maxSize: 5000000, // 5MB
  minSize: 1000, // 1KB
  imageTypes: /\.(gif|jpe?g|png)$/i,
  imageVersions: {
    'thumbnail': {
      width: 128,
      height: 128
    }
  }
};

fileServer = new nodeStatic.Server(options.galleryDir);

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
  if (options.minSize && options.minSize > this.size) {
    this.error = 'File is too small';
  } else if (options.maxSize && options.maxSize < this.size) {
    this.error = 'File is too big: ' + options.maxSize;
  }

  return !this.error;
};
FileInfo.prototype.safeName = function () {
  // Prevent directory traversal and creating hidden system files:
  this.name = path.basename(this.name).replace(/^\.+/, '');
};
FileInfo.prototype.initUrls = function (req) {
  if (!this.error) {
    var that = this,
        //baseUrl = (options.ssl ? 'https:' : 'http:') + '//' + req.headers.host + options.uploadUrl;
        baseUrl = 'http://' + req.headers.host + '/gallery/';
        this.url = this.deleteUrl = baseUrl + encodeURIComponent(this.name);

        Object.keys(options.imageVersions).forEach(function (version) {
          if (fs.existsSync(
            options.galleryDir + '/' + version + '_' + that.name
          )) {
            that[version + 'Url'] = baseUrl + version + '_' +
              encodeURIComponent(that.name);
          }
        });
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
  form.uploadDir = options.tmpDir;
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

      // Copy the file to the correct place
      fs.renameSync(file.path, options.galleryDir + '/' + fileInfo.name);

      // If there are any image versions, create them
      if (options.imageTypes.test(fileInfo.name)) {
          Object.keys(options.imageVersions).forEach(function (version) {
              counter += 1;
              var opts = options.imageVersions[version];
              console.log(version);
              imageMagick.resize({
                  width: opts.width,
                  height: opts.height,
                  srcPath: options.galleryDir + '/' + fileInfo.name,
                  dstPath: options.galleryDir + '/' + version + '_' +
                      fileInfo.name
              }, finish(req, res));
          });
      }
  }).on('aborted', function () {
      console.error('Aborted, removing file');

      tmpFiles.forEach(function (file) {
          fs.unlink(file);
      });
  }).on('error', function (e) {
      console.log(e);
  }).on('progress', function (bytesReceived, bytesExpected) {
      if (bytesReceived > options.maxPostSize) {
          console.error('File upload size exceeded, terminating connection');
          handler.req.connection.destroy();
      }
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
