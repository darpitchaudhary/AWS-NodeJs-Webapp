var express = require('express');
var router = express.Router();
let register=require('../controllers/register');
const session=require('express-session');

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

router.get('/', checkLogin, register.home);
router.post('/register', register.register);
router.get('/login',checkLogin, register.loginPage);
router.post('/login', register.login);
router.post('/update',redirectLogin, register.update);
router.get('/profilePage', redirectLogin, register.profilePage);
router.post('/changeNames', redirectLogin, register.changeNames);
router.get('/passwordChangePage', redirectLogin, register.passwordChangePage);
router.post('/changePassword', redirectLogin, register.changePassword);
router.get('/logout', redirectLogin, register.logout);
router.get('/passwordResetLink', register.passwordResetLink);
router.post('/passwordReset', register.passwordReset);

module.exports = router;
