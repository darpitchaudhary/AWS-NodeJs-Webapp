var express = require('express');
var router = express.Router();
let seller=require('../controllers/seller');
let buyer=require('../controllers/buyer');
const session=require('express-session');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
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
router.post('/addBook', seller.addBook);
router.post('/updateBookPage', seller.updateBookPage);
router.post('/updateBook', seller.updateBook);
router.post('/deleteBook', seller.deleteBook);

router.get('/buy', buyer.home);
router.post('/addToCart', buyer.addToCart);
router.get('/viewCartPage', buyer.cartPage);
router.post('/cartDelete', buyer.cartDelete);
module.exports = router;
