const models=require('../models');
const Validator = require('../services/validator');
const validator = new Validator();
const session=require('express-session');
const { Op } = require("sequelize");
const bucket = process.env.S3_BUCKET_NAME;
const aws = require('aws-sdk');
let s3 = new aws.S3();
const path = require('path');
const logger = require('../config/winston');
const SDC = require('statsd-client'), sdc = new SDC({host: 'localhost', port: 8125});

exports.home=function(req,res,next){
    let beginTime = Date.now();
    let dbQueryStart = Date.now();
    return models.Books.findAll({where:{id:req.session.userId}}).then(booksData => {
        let dbQueryEnd = Date.now();
        let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
        sdc.timing('Seller Home Page Query', dbQueryelapsedTime);
        if(booksData==null){
            res.render("seller",{erro:"NO BOOKS TO SHOW, PLEASE ADD SOME BOOKS"});
        }else{
            logger.info("Seller Page Displayed");
            res.render('seller',{result:booksData});
            let endTime = Date.now();
            let elapsedTime = endTime - beginTime;
            sdc.timing('Seller Home Page API', elapsedTime);
        }
    })
    .catch((e) => { err => console.error(err.message);
        console.log(e);
        console.log(err);
        res.render("oopspage");
    });
}


exports.addBookPage=function(req,res,next){
    let beginTime = Date.now();
    logger.info("Books Page Displayed");
    res.render('addBook');
    let endTime = Date.now();
    let elapsedTime = endTime - beginTime;
    sdc.timing('Add Book Page API', elapsedTime);
}

exports.addBook=function(req,res,next){
    let beginTime = Date.now();
                        //Confirm if we can change it to ISBN from title , to check if same seller can have two books with same title but different ISBN
            return models.Books.findOne({where:{id:req.session.userId,isbn:req.body.isbn}}).then(bookInfo => {
                if(bookInfo==null){
                    if(req.body.qtybutton < 0 || req.body.qtybutton > 999||req.body.price< 0.01  || req.body.price> 9999.99 || isNaN(req.body.price) || isNaN(req.body.qtybutton)||new Date(req.body.publishedDate)>new Date()) {
                        res.render("addBook",{erro:"Please fill according to the field"});
                    }else{
                        if(req.body.title==="" || req.body.isbn==="" || req.body.price==="" || req.body.publishedDate==="" || req.body.authors==="" || req.body.qtybutton==="" ){
                            res.render("addBook",{erro:"All fields are mandatory"});
                        }else{
                            // console.log(req.body.publishedDate);
                            let dbQueryStart = Date.now();
                            return models.Books.create({
                                id:req.session.userId,
                                seller_id:req.session.userId,
                                isbn:req.body.isbn,
                                title:req.body.title,
                                authors:req.body.authors,
                                publicationDate:req.body.publishedDate,
                                quantity:req.body.qtybutton,
                                price:req.body.price,
                            }).then(user=>{
                                let dbQueryEnd = Date.now();
                                let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
                                sdc.timing('Add Book Query', dbQueryelapsedTime);
                                res.redirect('sell');
                                let endTime = Date.now();
                                let elapsedTime = endTime - beginTime;
                                sdc.timing('Add Book Functionality API', elapsedTime);
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
    let beginTime = Date.now();
    logger.info("Update Book Page Displayed");
    return models.Books.findOne({where:{bookId:req.body.bookId}}).then(booksData => {
        if(booksData==null){
            res.render("seller",{erro:"NO BOOKS TO SHOW"});
        }else{
            let current_datetime = new Date(booksData.publicationDate);
            let pubDate=current_datetime.getFullYear()+1 + "-" + (String(current_datetime.getMonth() + 1).padStart(2,'0')) + "-" + (String(current_datetime.getDate()).padStart(2,'0'));
            res.render('updateBook',{result:booksData,pubDate:pubDate});
            let endTime = Date.now();
            let elapsedTime = endTime - beginTime;
            sdc.timing('Update Book Page API', elapsedTime);
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
    let beginTime = Date.now();
    logger.info("Book Updated");
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
                    let dbQueryStart = Date.now();
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
                            let dbQueryEnd = Date.now();
                            let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
                            sdc.timing('Update Book Query', dbQueryelapsedTime);
                            res.redirect('sell');
                            let endTime = Date.now();
                            let elapsedTime = endTime - beginTime;
                            sdc.timing('Update Book Functionality API', elapsedTime);
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
    let beginTime = Date.now();
    return models.Image.findAll({where:{book_Img_id:req.body.bookId}})
    .then((imgRes)=>{
        if(imgRes[0]==null){
            let dbQueryStart = Date.now();
            return models.Image.destroy({
                where: {
                    book_Img_id:req.body.bookId //Check for this, change it to different input value from UI
                }
            }).then(()=>{
                return models.Books.destroy({
                    where: {
                        bookId:req.body.bookId //Check for this, change it to different input value from UI
                    }
                }).then(()=>{
                    return models.Cart.update({
                        delFlag:true
                    },{where:{bookId:req.body.bookId}}).then(user=>{
                    let dbQueryEnd = Date.now();
                    let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
                    sdc.timing('S3 Delete All Images Book', dbQueryelapsedTime);
                    res.redirect('sell');
                    let endTime = Date.now();
                    let elapsedTime = endTime - beginTime;
                    sdc.timing('Delete Book Functionality API', elapsedTime);
                    });
                })
                .catch((e) => { err => console.error(err.message);
                    res.render("oopspage");
                });
            })
            .catch((e) => { err => console.error(err.message);
                res.render("oopspage");
            });
        }else{
            let dbQueryStart = Date.now();
            imgRes.forEach(element => {
                var imgPath=element.imageName.split("/");
                var objectName=imgPath[imgPath.length-1];
                let params = {
                    Bucket: bucket,
                    Key: objectName
                };
                s3.deleteObject(params, function (err, data) {
                    if(err){
                        res.render("oopspage");
                    }else{
                        return models.Image.destroy({
                            where: {
                                book_Img_id:req.body.bookId //Check for this, change it to different input value from UI
                            }
                        }).then(()=>{
                            return models.Books.destroy({
                                where: {
                                    bookId:req.body.bookId //Check for this, change it to different input value from UI
                                }
                            }).then(()=>{
                                return models.Cart.update({
                                    delFlag:true
                                },{where:{bookId:req.body.bookId}}).then(user=>{
                                let dbQueryEnd = Date.now();
                                let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
                                sdc.timing('S3 Delete All Images Book', dbQueryelapsedTime);
                                res.redirect('sell');
                                let endTime = Date.now();
                                let elapsedTime = endTime - beginTime;
                                sdc.timing('Delete Book Functionality API', elapsedTime);
                                });
                            })
                            .catch((e) => { err => console.error(err.message);
                                res.render("oopspage");
                            });
                        })
                        .catch((e) => { err => console.error(err.message);
                            res.render("oopspage");
                        });
                    }
                });
            });
        }
    })
}

exports.uploadImagePage=function(req,res,next){
    let beginTime = Date.now();
    res.render("uploadImage",{bookId:req.body.bookId});
    let endTime = Date.now();
    let elapsedTime = endTime - beginTime;
    sdc.timing('Upload Image Page API', elapsedTime);
}

//Change it to new
exports.uploadMultipleImages=function(req,res,next){
    let beginTime = Date.now();
    if (!req.file){
        res.render("oopspage"); //show some error
    }else{
        let dbQueryStart = Date.now();
        return models.Image.create({
            imageName:req.file.location,
            book_Img_id:req.body.bookId,
        }).then(user=>{
            let dbQueryEnd = Date.now();
            let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
            sdc.timing('Image Upload Query', dbQueryelapsedTime);
            res.redirect('sell');
            let endTime = Date.now();
            let elapsedTime = endTime - beginTime;
            sdc.timing('Upload Image Functionality API', elapsedTime);
        })
        .catch((e) => { err => console.error(err.message);
                console.log(e);
            res.render("oopspage");
        });
    }
}

exports.viewImageSeller=function(req,res,next){
    let beginTime = Date.now();
    return models.Image.findAll({where:{book_Img_id:req.body.bookId}}).then(imgData => {
        if(imgData==null){
            res.render("viewSellImage",{erro:"NO Images TO SHOW"});
        }else{
            res.render("viewSellImage",{result:imgData});
            let endTime = Date.now();
            let elapsedTime = endTime - beginTime;
            sdc.timing('View Seller Images API', elapsedTime);
        }
    }).catch((e) => { err => console.error(err.message);
        console.log(e);
        res.render("oopspage");
    });
}


exports.deleteImage=function(req,res,next){
    let beginTime = Date.now();
    return models.Image.findAll({where:{book_Img_id:req.body.bookId}})
    .then((imgRes)=>{
        if(imgRes[0]==null){
            res.redirect('sell');
        }else{
            imgRes.forEach(element => {
                var imgPath=element.imageName.split("/");
                var objectName=imgPath[imgPath.length-1];
                let params = {
                    Bucket: bucket,
                    Key: objectName
                };
                s3.deleteObject(params, function (err, data) {
                    if(err){
                        res.render("oopspage");
                    }else{
                        return models.Image.destroy({
                            where: {
                                book_Img_id:req.body.bookId //Check for this, change it to different input value from UI
                            }
                        }).then(()=>{
                            res.redirect('sell');
                        })
                        .catch((e) => { err => console.error(err.message);
                            res.render("oopspage");
                        });
                    }
                });
            });
        }
        let endTime = Date.now();
        let elapsedTime = endTime - beginTime;
        sdc.timing('Delete Seller Images API', elapsedTime);
    })
}

exports.deleteImageIndividual=function(req,res,next){
    let beginTime = Date.now();
    return models.Image.findAll({where:{imageId:req.body.imageId}})
    .then((imgRes)=>{
        // res.send(imgRes);
        if(imgRes[0]==null){
            res.redirect('sell');
        }else{
            imgRes.forEach(element => {
                var imgPath=element.imageName.split("/");
                var objectName=imgPath[imgPath.length-1];
                let params = {
                    Bucket: bucket,
                    Key: objectName
                };
                s3.deleteObject(params, function (err, data) {
                    if(err){
                        res.render("oopspage");
                    }else{
                        let dbQueryStart = Date.now();
                        return models.Image.destroy({
                            where: {
                                imageId:req.body.imageId //Check for this, change it to different input value from UI
                            }
                        }).then(()=>{
                            let dbQueryEnd = Date.now();
                            let dbQueryelapsedTime = dbQueryEnd - dbQueryStart;
                            sdc.timing('S3 Delete', dbQueryelapsedTime);
                            res.redirect('sell');
                        })
                        .catch((e) => { err => console.error(err.message);
                            res.render("oopspage");
                        });
                    }
                });
            });
        }
        let endTime = Date.now();
        let elapsedTime = endTime - beginTime;
        sdc.timing('Delete Seller Images Individual API', elapsedTime);
    })
}
