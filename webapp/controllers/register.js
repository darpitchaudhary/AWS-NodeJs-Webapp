const models=require('../models');
const Validator = require('../services/validator');
const validator = new Validator();
const bcrypt = require('bcrypt');
const session=require('express-session');
const logger = require('../config/winston');
const SDC = require('statsd-client'), sdc = new SDC({host: 'localhost', port: 8125});

exports.home=function(req,res,next){
    let beginTime = Date.now();
    res.render('login');
    let endTime = Date.now();
    let elapsedTime = endTime - beginTime;
    sdc.timing('Home Page API', elapsedTime);
}

exports.register=function(req,res,next){
    let beginTime = Date.now();
    return models.Users.findOne({where:{emailId:req.body.email}}).then(userInfo => {
        if(req.body.firstname==null || req.body.lastname==null){
            res.render("login",{erro:"All fields are mandatory"});
        }
        if(userInfo==null){
            if(req.body.firstname==="" || req.body.lastname===""){
                res.render("login",{erro:"All fields are mandatory"});
            }else{
                if (validator.validEmail(req.body.email) && validator.validPassword(req.body.password) && validator.validName(req.body.firstname) && validator.validName(req.body.lastname)) {
                    let hash = bcrypt.hashSync(req.body.password,10);
                return models.Users.create({
                    emailId:req.body.email,
                    password:hash,
                    firstName:req.body.firstname,
                    lastName:req.body.lastname
                }).then(user=>{
                    logger.info("User Registered");
                    res.redirect('/');
                    let endTime = Date.now();
                    let elapsedTime = endTime - beginTime;
                    sdc.timing('User Registeration API', elapsedTime);
                });
                }else{
                    res.render('login',{erro:"Please Enter valid Email and Password Or your name has all numbers"});
                }
            }       
        }else{
                res.render("login",{erro:"Email already exists"});
        }
    });
}

exports.profilePage=function(req,res,next){
    let beginTime = Date.now();
    return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
        if(userInfo==null){
            res.render("login",{erro:"Email Id isnt regsitered"});
            let endTime = Date.now();
            let elapsedTime = endTime - beginTime;
            sdc.timing('Profile Page API', elapsedTime);
        }else{
            res.render('profile',{result:userInfo});
            let endTime = Date.now();
            let elapsedTime = endTime - beginTime;
            sdc.timing('Profile Page API', elapsedTime);
        }
    });
}

exports.loginPage=function(req,res,next){
    let beginTime = Date.now();
    res.render('login');
    let endTime = Date.now();
    let elapsedTime = endTime - beginTime;
    sdc.timing('Login Page API', elapsedTime);
}

exports.login=function(req,res,next){
    let beginTime = Date.now();
    return models.Users.findOne({where:{emailId:req.body.email}}).then(userInfo => {
        if(userInfo==null){
            res.render("login",{erro:"Email Id isnt regsitered"});
        }else{
            if(bcrypt.compareSync(req.body.password, userInfo.password)) {
                req.session.userLoggedIn=true;
                req.session.emailId=req.body.email;
                req.session.userId=userInfo.id;
                res.render('profile',{result:userInfo});
                let endTime = Date.now();
                let elapsedTime = endTime - beginTime;
                sdc.timing('User Authentication API', elapsedTime);
               } else {
                res.render("login",{erro:"Email Id and password do not match"});
               }
        }
    });
}

exports.changeNames=function(req,res,next){
    let beginTime = Date.now();
    if(req.body.firstname ==null || req.body.lastname ==null){
        return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
            if(userInfo==null){
                res.render("login",{erro:"Email Id isnt regsitered"});
            }else{
                res.render('profile',{result:userInfo,erro:"EMPTY FIRSTNAME OR LASTNAME"});
            }
        });
    }else{
        if(req.body.firstname ==="" || req.body.lastname ==="" || !validator.validName(req.body.firstname) || !validator.validName(req.body.lastname)){
            return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
                if(userInfo==null){
                    res.render("login",{erro:"Email Id isnt regsitered"});
                }else{
                    res.render('profile',{result:userInfo,erro:"EMPTY FIRSTNAME OR LASTNAME OR NAME CONTAINS ALL NUMBERS"});
                }
            });
        }else{
            return models.Users.update({firstName:req.body.firstname,lastName:req.body.lastname},{where:{emailId:req.session.emailId}}).then(function(rowsUpdated) {
                res.redirect('/profilePage');
                let endTime = Date.now();
                let elapsedTime = endTime - beginTime;
                sdc.timing('User Authentication API', elapsedTime);
            });
        }
    }
}

exports.passwordChangePage=function(req,res,next){
    let beginTime = Date.now();
    res.render('passwordChange');
    let endTime = Date.now();
    let elapsedTime = endTime - beginTime;
    sdc.timing('Password Change Page', elapsedTime);
}

exports.changePassword=function(req,res,next){
    let beginTime = Date.now();
    if(req.body.password ==null || req.body.newpassword ==null ){
        res.render("passwordChange",{erro:"EMPTY PASSWORD"});
    }else{
        if(req.body.password ==="" || req.body.newpassword ===""){
            res.render("passwordChange",{erro:"EMPTY PASSWORD"});
        }else{
            return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
                if(userInfo==null){
                    res.render("login",{erro:"Something Went Wrong"});
                }else{
                    if(bcrypt.compareSync(req.body.password, userInfo.password)) {
                        if (validator.validPassword(req.body.newpassword)){
                            let usernewpassword = bcrypt.hashSync(req.body.newpassword,10);
                            return models.Users.update({password:usernewpassword},{where:{emailId:req.session.emailId}}).then(function(rowsUpdated) {
                                res.redirect('/logout');
                                let endTime = Date.now();
                                let elapsedTime = endTime - beginTime;
                                sdc.timing('Password Change API', elapsedTime);
                            });
                        }else{
                            res.render("passwordChange",{erro:"Password is not of Proper Format"});
                        }
                       } else {
                        res.render("passwordChange",{erro:"Password do not match"});
                       }
                }
            });
        }
    }
}

exports.logout=function(req,res,next){
    let beginTime = Date.now();
    req.session.destroy(err=>{
        if(err){
            res.send("Please perform this action properly");
        }
        res.clearCookie("sid");
        res.redirect("/login");
        let endTime = Date.now();
        let elapsedTime = endTime - beginTime;
        sdc.timing('Logout API', elapsedTime);
    })
}

//Not used deprecate it
exports.update=function(req,res,next){
    if(req.body.firstname ==null || req.body.lastname ==null){
        res.send("EMPTY FIRSTNAME OR LASTNAME");
    }else{
        return models.Users.findOne({where:{emailId:req.body.email,password:req.body.password}}).then(userInfo => {
            if(userInfo==null){
                res.render("login",{erro:"Do not have those credentials"});
            }else{
                res.render("viewInfo",{result:userInfo});
                //To a new page where edit functionality is also implemented
            }
        });
    }
}