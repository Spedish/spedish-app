var Resource = require('resourcejs');
var auth = require('../lib/auth');

module.exports = function(app, route, passport) {

  var Item = app.models.item;
  var Review = app.models.review;
  // Setup the controller for REST;
  Resource(app, '', route, Review)
    .get({
        after: function(req, res, next) {
          if (auth.isResOwner(req, res.resource.item))
            res.resource.item._doc.canEdit = true;
          else {
            res.resource.item._doc.canEdit = false;
          }
          next();
        }
      })
    .post({
      before: function(req, res, next) {
        if (!req.isAuthenticated()) {
          console.error('Unauthenticated user attempted to write a review');
          return res.status(403).json({'error': 'no user currently logged in'}).end();
        }

        Review.findOne({ 'order': req.body.order}, function(err, review) {
          if (err) {
            return res.status(404).json({
              status: 'failure',
              message: "System error"
            });
          }
          if (review) {
            return res.status(409).json({
              status: 'failure',
              message: "A review is already posted by this user."
            });
          }
          // Assign uid
          req.body._uid = req.user.id;

          Item.findById(req.body.item, function(err, item) {
            if (err) return res.status(404).json({
              status: 'failure',
              message: "Item not found."
            });
            //Assign seller id to the review
            req.body._sid = item._uid;
            next();
          });
        });
      },
      after: function(req, res, next) {
        if (res.statusCode == 200) {
          Item.findById(req.body.item, function(err, item) {
            if (err) return res.status(404).json({
              status: 'failure',
              message: "Item not found."
            });
            item.rating_count += req.body.rating;
            item.review_count++;
            item.save(function(err, docs) {
              if (err) return res.status(500).json({
                status: 'failure',
                message: "Update review counts failed."
              });
              console.log('Review counts successfully updated on item!');
            });
          });
        }

        next();
      }
    })
    .put({
        before: function(req, res, next) {
          return auth.isResOwnerResolveChained(req, res, next, req.params.reviewId, app.models.review);
        }
      })
    .patch({
        before: function(req, res, next) {
          return auth.isResOwnerResolveChained(req, res, next, req.params.reviewId, app.models.review);
        }
      })
    .index({
        after: function(req, res, next) {
          // Disable caching for content files
          res.header("Cache-Control", "no-cache, no-store, must-revalidate");
          res.header("Pragma", "no-cache");
          res.header("Expires", 0);

          if(res.resource.item) {
            res.resource.item.forEach(function(item, idx, arr) {
            if (auth.isResOwner(req, item))
              item._doc.canEdit = true;
            else
              item._doc.canEdit = false;
            });
          }
          next();
        }
      })
    .delete({
        before: function(req, res, next) {
          Review.findById(req.params.reviewId, function(err, review) {
            if (err) return res.status(404).json({
              status: 'failure',
              message: "Review not found."
            });
            Item.findById(review.item, function(err, item) {
              if (err) return res.status(404).json({
                status: 'failure',
                message: "Item not found."
              });
              item.rating_count -= review.rating;
              item.review_count--;
              item.save(function(err, docs) {
                if (err) return res.status(500).json({
                  status: 'failure',
                  message: "Update review counts failed."
                });
                console.log('Review counts successfully updated on item!');
              });
            });
          });
          return auth.isResOwnerResolveChained(req, res, next, req.params.reviewId, app.models.review);
        }
      })

  // Return middleware.
  return function(req, res, next) {
      next();
  };
};
