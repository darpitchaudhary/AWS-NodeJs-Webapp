var express = require('express');
var router = express.Router();
let seller=require('../controllers/seller');
let buyer=require('../controllers/buyer');
const session=require('express-session');
const aws = require('aws-sdk');
const bucket = process.env.S3_BUCKET_NAME;
var multer  = require('multer');
const multerS3 = require('multer-s3');
var s3 = new aws.S3({ /* ... */ });
const logger = require('../config/winston');
const SDC = require('statsd-client'), sdc = new SDC({host: 'localhost', port: 8125});
var begin_s3_timer;
var upload = multer({
                        storage: multerS3({
                        s3: s3,
                        bucket: bucket,
                        acl:'public-read',
                        metadata: function (req, file, cb) {
                                cb(null,{fieldName: Date.now()+"-"+file.fieldname});
                        },
                                key: function (req, file, cb) {
                                cb(null, Date.now()+"-"+file.originalname);
                        }
  })
});

var begin_time = function(req, res, next) {
  logger.info('Starting timer for s3 upload check');
  begin_s3_timer =Date.now();
  next();
};


var end_time = function(req, res, next) {
  let end_s3_timer = Date.now();
  let elapsedTime  = end_s3_timer - begin_s3_timer; 
  sdc.timing('Time to Upload to S3', elapsedTime);
  logger.info('Ending timer for s3 upload');
  next();
};

const redirectLogin=(req,res,next)=>{
  if(req.session.userLoggedIn==null){
      res.redirect("/");
  }else{
      next();
  }
}

const checkLogin=(req,res,next)=>{
  if(req.session.userLoggedIn==null){
      next();
  }else{
      res.redirect('/profilePage');
  }
}

router.get('/sell', seller.home);
router.get('/addBookPage', seller.addBookPage);
router.post('/uploadImagePage', seller.uploadImagePage);
router.post('/uploadMultipleImages',begin_time, upload.single('photo'), end_time, seller.uploadMultipleImages);
router.post('/addBook', seller.addBook);
router.post('/updateBookPage', seller.updateBookPage);
router.post('/updateBook', seller.updateBook);
router.post('/deleteBook', seller.deleteBook);
router.post('/deleteImage', seller.deleteImage);
router.post('/viewImageSeller', seller.viewImageSeller);
router.post('/deleteImageIndividual', seller.deleteImageIndividual);

router.get('/buy', buyer.home);
router.post('/addToCart', buyer.addToCart);
router.get('/viewCartPage', buyer.cartPage);
router.post('/cartDelete', buyer.cartDelete);
router.post('/viewImagesPage', buyer.viewImagesPage);
router.post('/viewImagesFromAllSellers', buyer.viewImagesFromAllSellers);
module.exports = router;
