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

  this.name = encodeURIComponent(this.name);
};
FileInfo.prototype.initUrls = function (req) {
  if (!this.error) {
    var that = this,
        //baseUrl = (options.ssl ? 'https:' : 'http:') + '//' + req.headers.host + options.uploadUrl;
        baseUrl = 'http://' + req.headers.host + '/gallery/';
        this.url = this.deleteUrl = baseUrl + this.name;

        Object.keys(options.imageVersions).forEach(function (version) {
          that[version + 'Url'] = baseUrl + version + '_' +
            that.name;
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
      gid,
      finish = function (req, res) {
          counter -= 1;
          if (!counter) {
              files.forEach(function (fileInfo) {
                  fileInfo.initUrls(handler.req);
              });
              handler.callback({files: files}, req, res);
          }
      };

  // Set the upload dir to a temporary path
  form.uploadDir = options.tmpDir;

  // On receiving a file, register it to a temporary list
  form.on('fileBegin', function (name, file) {
      tmpFiles.push(file.path);
      var fileInfo = new FileInfo(file, handler.req, true);
      fileInfo.safeName();
      map[path.basename(file.path)] = fileInfo;
      files.push(fileInfo);

  // If there is a gallery ID, save it
  }).on('field', function (name, value) {
      if (name === 'gid')
          gid = value;

  // On error delete all the temporary files that were uploaded
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

  // Once the full form is processed, save the files and call the handler
  }).on('end', function () {

      // If there is a gallery id then use it, otherwise we should create a new one
      if (gid) {
        // Check gallery is valid first
      } else {
      }

      // Go through the files we received and move them to gallery
      tmpFiles.forEach(function (file) {
        var fileInfo = map[path.basename(file)];
        fileInfo.size = file.size;
        if (!fileInfo.validate()) {
            fs.unlink(file);
            return;
        }

        // Copy the file to the correct place
        fs.renameSync(file, options.galleryDir + '/' + fileInfo.name);

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
      });

      // Call the finish handler
      finish(req, res);

  }).parse(handler.req);
};

handleResult = function (result, req, res) {
  res.writeHead(200, {
      'Content-Type': req.headers.accept
          .indexOf('application/json') !== -1 ?
                  'application/json' : 'text/plain'
  });
  res.end(JSON.stringify(result));
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
