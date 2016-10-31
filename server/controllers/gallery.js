var path        = require('path');
var fs          = require('fs');
var formidable  = require('formidable');
var nodeStatic  = require('node-static');
var imageMagick = require('imagemagick');
var randStr     = require('randomstring');
var auth        = require('../lib/auth');
var config      = require('config');

var options    = {
  tmpDir: config.get('server.tmpDir'),
  galleryDir: config.get('server.galleryStore'),
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
  this.localPath = '';
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

  // Add a random string to the name
  var ext = path.extname(this.name);
  var basename = path.basename(this.name, ext);
  this.name = basename + '_' + randStr.generate(6) + ext;
};
FileInfo.prototype.initUrls = function (req, gid) {
  if (!this.error) {
    var that = this,
        //baseUrl = (options.ssl ? 'https:' : 'http:') + '//' + req.headers.host + options.uploadUrl;
        baseUrl = 'http://' + req.headers.host + '/gallery/'+ gid + '/';

        this.url = this.deleteUrl = baseUrl + this.name;

        Object.keys(options.imageVersions).forEach(function (version) {
          that[version + 'Url'] = baseUrl + version + '_' +
            that.name;
        });
  }
};

UploadHandler.prototype.post = function (app, req, res) {
  var handler = this,
      form = new formidable.IncomingForm(),
      tmpFiles = [],
      files = [],
      map = {},
      counter = 1,
      gid = undefined,
      finish = function (req, res, gid, order) {
          counter -= 1;
          console.log('Counter: ' + counter);
          if (!counter) {
              files.forEach(function (fileInfo) {
                  fileInfo.initUrls(handler.req, gid);
                  console.log('>>> Local path of thumbnail is: ' + fileInfo.localPath);
                  while(! fs.existsSync(fileInfo.localPath)) { }
              });
              handler.callback({files: files}, req, res, gid, order);
          }
      };

  // Set the upload dir to a temporary path
  form.uploadDir = options.tmpDir;

  // On receiving a file, register it to a temporary list
  form.on('fileBegin', function (name, file) {
      tmpFiles.push(file.path);
      var fileInfo = new FileInfo(file, handler.req, true);
      console.log("New file");
      fileInfo.safeName();
      map[path.basename(file.path)] = fileInfo;
      files.push(fileInfo);

  // If there is a gallery ID, save it
  }).on('field', function (name, value) {
      if (name === 'gid')
        gid = value;
      if (name === 'profile') {
        console.log("Profile mode");
        gid = 'profiles';
      }

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

      var processFiles = function(req, gallery) {
        var gid;
        var order = [];

        if (gallery !== 'profiles') {
          gid = gallery._id;
          if (gallery.order)
            order = gallery.order;
        }

        var uid = auth.getUserId(req);

        // Go through the files we received and move them to gallery
        console.log(tmpFiles);
        tmpFiles.forEach(function (file) {
          var fileInfo = map[path.basename(file)];
          fileInfo.size = file.size;
          if (!fileInfo.validate()) {
              fs.unlink(file);
              return;
          }

          // Copy the file to the correct place
          console.log('Saving for uid ' + uid + ' file ' + file + ' to ' + options.galleryDir + '/' + gid + '/' + fileInfo.name);
          fs.renameSync(file, options.galleryDir + '/' + gid + '/' + fileInfo.name);

          // Newly added file goes to the back of the picture order
          order.push(fileInfo.name);

          // If there are any image versions, create them
          if (options.imageTypes.test(fileInfo.name)) {
              Object.keys(options.imageVersions).forEach(function (version) {
                  counter += 1;
                  console.log('Counter (new resize): ' + counter);
                  var opts = options.imageVersions[version];
                  console.log(version);
                  fileInfo.localPath = options.galleryDir + '/' + gid + '/' + version + '_' + fileInfo.name;
                  imageMagick.resize({
                      width: opts.width,
                      height: opts.height,
                      srcPath: options.galleryDir + '/' + gid + '/' + fileInfo.name,
                      dstPath: fileInfo.localPath
                  }, finish(req, res, gid, undefined));
              });
          }
        });

        if (gallery !== 'profiles') {
          console.log('Gallery order update: ' + order);

          gallery.update({order: order}).then(function() {
            console.log('Gallery update finished: ' + order);
            finish(req, res, gid, order);
          }).catch(function(err) {
            // This error handling is incomplete as we will never return
            console.error(err);
          });
        } else {
          app.models.user.find({_id: uid}, function(err, us) {
            if (err || !us || us.length != 1) {
              console.error('Retrieving gallery failed');
              handler.req.connection.destroy();
            } else {
              console.log('Successfully retrieved user with uid ' + uid);
              us[0].update({profile_image: fileInfo.name}).then(function() {
                console.log('User updated with profile');
                finish(req, res, gid, undefined);
              });
            }
          });
        }
      };

      // There must be a gallery ID at this point
      if (gid != undefined) {
        if (gid !== 'profiles') {
          // Check gallery is valid first
          app.models.gallery.find({_id: gid}, function(err, gs) {
            if (err || !gs || gs.length != 1) {
              console.error('Retrieving gallery failed');
              handler.req.connection.destroy();
            } else {
              console.log('Successfully retrieved gallery with gid ' + gid);

              /*
               * Ideally we want to check the below as well, however the upload UI is using
               * jquery still which will not set cookies on CORS :(
               *
               * The other interfaces are fine since they are coming through AngularJS
               *
              if(!auth.isResOwner(req, gs[0])) {
                res.status(403).json({error: 'This user does not own this gallery'}).end();
              } else {
                processFiles(gs[0]);
              }
              */
              processFiles(req, gs[0]);
            }
          });
        } else {
          // We just need to upload the image to the top level profiles/
          processFiles(req, gid);
        }
      }
  }).parse(handler.req);
};

handleResult = function (result, req, res, gid, order) {
  res.writeHead(200, {
      'Content-Type': req.headers.accept
          .indexOf('application/json') !== -1 ?
                  'application/json' : 'text/plain'
  });

  result.order = order;
  result.gid   = gid;

  res.end(JSON.stringify(result));
};

module.exports = function(app, route, passport) {

  app.post('/'+route, function(req, res) {
    handler = new UploadHandler(req, res, handleResult);

    setNoCacheHeaders(res);
    handler.post(app, req, res);
  });

  app.get('/'+route+'*', function(req, res) {
    if (req.url === '/gallery') {
      setNoCacheHeaders(res);
      res.send('No listing allowed');
    } else {
      var f = req.url.substring(req.url.lastIndexOf('gallery/') + 8);
      console.log('Gallery serving: ' + f);
      var promise = fileServer.serveFile(f, 200, {}, req, res);
      promise.on('error', function(e, res) {
        console.error('Failed to serve file: ' + e);
      });
    }
  });

  app.put('/'+route, function(req, res) {
    if (!req.isAuthenticated()) {
      res.status(403).json({'error': 'user not logged in'});

      return false;
    }

    var g = new app.models.gallery();
    g._uid = req.user.id;
    g.save().then(function(g) {
      console.log('Created gallery with id ' + g.id + 'for uid ' + g._uid);

      gid = g.id;

      fs.mkdirSync(options.galleryDir + '/' + gid);

      result = {'gid': gid};

      res.writeHead(200, {
          'Content-Type': req.headers.accept
              .indexOf('application/json') !== -1 ?
                      'application/json' : 'text/plain'
      });

      res.end(JSON.stringify(result));

    }).catch(function(err) {
      console.error(err);
    });
  });

  app.put('/'+route+'/:gid', function(req, res) {
    gid = req.params.gid;

    app.models.gallery.find({_id: gid}, function(err, gs) {
      if (err || !gs || gs.length != 1) {
        console.error('Retrieving gallery failed');
        handler.req.connection.destroy();
      } else {
        console.log('Successfully retrieved gallery with gid ' + gid);

        var g = gs[0];

        // Does the current user own this resource?
        if(!auth.isResOwner(req, g)) {
          res.status(403).json({error: 'This user does not own this gallery'}).end();
        } else {
          // Update the ordering for the gallery
          console.log(req.body.order);
          g.update({order: req.body.order}).then(function() {
            res.writeHead(200, {
                'Content-Type': req.headers.accept
                    .indexOf('application/json') !== -1 ?
                            'application/json' : 'text/plain'
            });

            res.end(JSON.stringify({order: req.body.order}));
          });
        }
      }
    });
  });

  app.delete('/'+route+'/:gid/:imageName', function(req, res) {
    gid = req.params.gid;
    img = req.params.imageName;

    // Fetch the gallery
    app.models.gallery.find({_id: gid}, function(err, gs) {
      if (err || !gs || gs.length != 1) {
        console.error('Retrieving gallery failed');
        handler.req.connection.destroy();
      } else {
        var g = gs[0];

        if(!auth.isResOwner(req, g)) {
          res.status(403).json({error: 'This user does not own this gallery'}).end();
        } else {
          // Delete the image from the order list (which will stop it from appearing)
          console.log('Successfully retrieved gallery with gid ' + gid);

          var order = g.order;
          var idx = order.indexOf(img);

          if (idx >= 0) {
            order.splice(idx, 1);

            console.log('Removed image: ' + img + ' remaining: ' + order);

            g.update({order: order}).then(function() {
              res.writeHead(200, {
                  'Content-Type': req.headers.accept
                      .indexOf('application/json') !== -1 ?
                              'application/json' : 'text/plain'
              });

              res.end(JSON.stringify({order: order}));
            });
          } else {
            res.status(404).end();
          }
        }
      }
    });
  });

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
