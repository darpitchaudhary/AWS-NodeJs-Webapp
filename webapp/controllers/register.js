const models=require('../models');
const Validator = require('../services/validator');
const validator = new Validator();
const bcrypt = require('bcrypt');
const session=require('express-session');

exports.home=function(req,res,next){
    res.render('login');
}

exports.register=function(req,res,next){
    return models.Users.findOne({where:{emailId:req.body.email}}).then(userInfo => {
        if(userInfo==null){
            if (validator.validEmail(req.body.email) && validator.validPassword(req.body.password)) {
                let hash = bcrypt.hashSync(req.body.password,10);
            return models.Users.create({
                emailId:req.body.email,
                password:hash,
                firstName:req.body.firstname,
                lastName:req.body.lastname
            }).then(user=>{
                res.redirect('/');
            });
            }else{
                res.render('login',{erro:"Please Enter valid Email and Password"});
            }        
        }else{
                res.render("login",{erro:"Email already exists"});
        }
    });
}

exports.profilePage=function(req,res,next){
    return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
        if(userInfo==null){
            res.render("login",{erro:"Email Id isnt regsitered"});
        }else{
            res.render('profile',{result:userInfo});
        }
    });
}

exports.loginPage=function(req,res,next){
    res.render('login');
}

exports.login=function(req,res,next){
    return models.Users.findOne({where:{emailId:req.body.email}}).then(userInfo => {
        if(userInfo==null){
            res.render("login",{erro:"Email Id isnt regsitered"});
        }else{
            if(bcrypt.compareSync(req.body.password, userInfo.password)) {
                req.session.userLoggedIn=true;
                req.session.emailId=req.body.email;
                res.render('profile',{result:userInfo});
               } else {
                res.render("login",{erro:"Email Id and password do not match"});
               }
        }
    });
}

exports.changeNames=function(req,res,next){
    if(req.body.firstname ==null || req.body.lastname ==null){
        return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
            if(userInfo==null){
                res.render("login",{erro:"Email Id isnt regsitered"});
            }else{
                res.render('profile',{result:userInfo,erro:"EMPTY FIRSTNAME OR LASTNAME"});
            }
        });
    }else{
        if(req.body.firstname ==="" || req.body.lastname ===""){
            return models.Users.findOne({where:{emailId:req.session.emailId}}).then(userInfo => {
                if(userInfo==null){
                    res.render("login",{erro:"Email Id isnt regsitered"});
                }else{
                    res.render('profile',{result:userInfo,erro:"EMPTY FIRSTNAME OR LASTNAME"});
                }
            });
        }else{
            return models.Users.update({firstName:req.body.firstname,lastName:req.body.lastname},{where:{emailId:req.session.emailId}}).then(function(rowsUpdated) {
                res.redirect('/profilePage');
            });
        }
    }
}

exports.passwordChangePage=function(req,res,next){
    res.render('passwordChange');
}

exports.changePassword=function(req,res,next){
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
    req.session.destroy(err=>{
        if(err){
            res.send("Please perform this action properly");
        }
        res.clearCookie("sid");
        res.redirect("/login");
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