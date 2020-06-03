const models=require('../models');
const Validator = require('../services/validator');
const validator = new Validator();
const session=require('express-session');
const { Op } = require("sequelize");

exports.home=function(req,res,next){
    return models.Books.findAll({where:{id:req.session.userId}}).then(booksData => {
        if(booksData==null){
            res.render("seller",{erro:"NO BOOKS TO SHOW, PLEASE ADD SOME BOOKS"});
        }else{
            res.render('seller',{result:booksData});
        }
    }).catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}

exports.addBookPage=function(req,res,next){
    res.render('addBook');
}

exports.addBook=function(req,res,next){
    //Confirm if we can change it to ISBN from title , to check if same seller can have two books with same title but different ISBN
    return models.Books.findOne({where:{title:req.body.title,id:req.session.userId,isbn:req.body.isbn}}).then(bookInfo => {
        if(bookInfo==null){
            if(req.body.qtybutton < 0 || req.body.qtybutton > 999||req.body.price< 0.01  || req.body.price> 9999.99 || isNaN(req.body.price) || isNaN(req.body.qtybutton)||new Date(req.body.publishedDate)>new Date()) {
                res.render("addBook",{erro:"Please fill according to the field"});
            }else{
                if(req.body.title==="" || req.body.isbn==="" || req.body.price==="" || req.body.publishedDate==="" || req.body.authors==="" || req.body.qtybutton==="" ){
                    res.render("addBook",{erro:"All fields are mandatory"});
                }else{
                    console.log(req.body.publishedDate);
                    return models.Books.create({
                        id:req.session.userId,
                        isbn:req.body.isbn,
                        title:req.body.title,
                        authors:req.body.authors,
                        publicationDate:req.body.publishedDate,
                        quantity:req.body.qtybutton,
                        price:req.body.price,
                    }).then(user=>{
                        res.redirect('sell');
                    })
                    .catch((e) => { err => console.error(err.message);
                        res.render("oopspage");
                    });
                } 
            }
      
        }else{
                res.render("addBook",{erro:"Book for same seller already exists"});
        }
    }).catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}

exports.updateBookPage=function(req,res,next){
    //Change title to ISBN we are sure about it
    // AND check for similar ISBN
    //what is this bookId
    return models.Books.findOne({where:{bookId:req.body.bookId}}).then(booksData => {
        if(booksData==null){
            res.render("seller",{erro:"NO BOOKS TO SHOW"});
        }else{
            let current_datetime = new Date(booksData.publicationDate);
            let pubDate=current_datetime.getFullYear()+1 + "-" + (String(current_datetime.getMonth() + 1).padStart(2,'0')) + "-" + (String(current_datetime.getDate()).padStart(2,'0'));
            res.render('updateBook',{result:booksData,pubDate:pubDate});
        }
    })
    .catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}

exports.updateBook=function(req,res,next){
    //Change title to ISBN we are sure about it
    // AND check for similar ISBN
    // Check for fields cannot be empty

    //Have to update with book id, not title  req.session.userId
    return models.Books.findOne({where:{isbn:req.body.isbn, [Op.not]: [
        { id: [req.session.userId] }
      ]}}).then(bookInfo => {
        if(bookInfo==null){
            if(req.body.qtybutton < 0 || req.body.qtybutton > 999||req.body.price< 0.01  || req.body.price> 9999.99 || isNaN(req.body.price) || isNaN(req.body.qtybutton)||new Date(req.body.publishedDate)>new Date()) {
                res.render("addBook",{erro:"Please fill according to the field"});
            }else{
                if(req.body.title==="" || req.body.isbn==="" || req.body.price==="" || req.body.publishedDate==="" || req.body.authors==="" || req.body.qtybutton===""){
                    res.render("addBook",{erro:"All fields are mandatory"});
                }else{
                    return models.Books.update({
                        isbn:req.body.isbn,
                        title:req.body.title,
                        authors:req.body.authors,
                        publicationDate:req.body.publishedDate,
                        quantity:req.body.qtybutton,
                        price:req.body.price,
                    },{where:{bookId:req.body.bookId}}).then(user=>{
                        return models.Cart.update({
                            title:req.body.title,
                            price:req.body.price,
                        },{where:{bookId:req.body.bookId}}).then(user=>{
                            res.redirect('sell');
                        }).catch((e) => { err => console.error(err.message);
                            res.render("oopspage");
                        });
                    }).catch((e) => { err => console.error(err.message);
                        res.render("oopspage");
                    });
                }
            }      
        }else{
            res.render("addBook",{erro:"Book for same seller already exists"});
        }
    })
    .catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}

exports.deleteBook=function(req,res,next){
    return models.Books.destroy({
        where: {
            bookId:req.body.bookId //Check for this, change it to different input value from UI
        }
    }).then(()=>{
        return models.Cart.update({
            delFlag:true
        },{where:{bookId:req.body.bookId}}).then(user=>{
        res.redirect('sell');
        });
    })
    .catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}
