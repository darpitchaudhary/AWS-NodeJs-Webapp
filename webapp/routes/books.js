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

var upload = multer({
                        storage: multerS3({
                        s3: s3,
                        bucket: bucket,
                        acl:'public-read',
                        metadata: function (req, file, cb) {
                                cb(null,{fieldName: file.fieldname});
                        },
                                key: function (req, file, cb) {
                                cb(null, file.originalname);
                        }
  })
});

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
router.post('/uploadMultipleImages',upload.single('photo'), seller.uploadMultipleImages);
router.post('/addBook', seller.addBook);
router.post('/updateBookPage', seller.updateBookPage);
router.post('/updateBook', seller.updateBook);
router.post('/deleteBook', seller.deleteBook);
router.post('/deleteImage', seller.deleteImage);


router.get('/buy', buyer.home);
router.post('/addToCart', buyer.addToCart);
router.get('/viewCartPage', buyer.cartPage);
router.post('/cartDelete', buyer.cartDelete);
router.post('/viewImagesPage', buyer.viewImagesPage);
module.exports = router;
