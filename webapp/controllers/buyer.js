const models=require('../models');
const Validator = require('../services/validator');
const validator = new Validator();
const session=require('express-session');
const { Op } = require("sequelize");
const bucket = process.env.S3_BUCKET_NAME;
const aws = require('aws-sdk');
let s3 = new aws.S3();
const SDC = require('statsd-client'), sdc = new SDC({host: 'localhost', port: 8125});

exports.home=function(req,res,next){
    sdc.increment('Book Listing Counter');
    let beginTime = Date.now();
    return models.Books.findAll({where:{[Op.not]: [
        { 
        id: [req.session.userId]}
      ], quantity: {
        [Op.gt]: 0 // square brackets are needed for property names that aren't plain strings
      }
    },
      order: [
        ['price', 'ASC'],
        ['quantity', 'ASC'],
    ]}).then(booksData => {
        if(booksData==null){
            res.render("buyer",{erro:"NO BOOKS TO SHOW"});
        }else{
            res.render('buyer',{result:booksData});
            let endTime = Date.now();
            var elapsedTime = endTime - beginTime;
            sdc.timing('Display Home Buyer Page', elapsedTime);
        }
    })
    .catch((e) => { err => console.error(err.message);
        res.render("oopspage");
        let endTime = Date.now();
        var elapsed = endTime - beginTime;
        sdc.timing('Display Home OOPS Page', elapsed);
    });
}

exports.addToCart=function(req,res,next){
    // console.log("Quanitty:"+req.body.qtybutton);

//Change it to site's inventory from sellers inventory
//check if the entry for the userid and bookid exists in the database
//if yes then update it 
//if no then create an entry
//get the quantity of items added to the cart
//check if that much quantity is there 
//update the books table quantity by removing subtracting it from previous quantity
//insert that entry to the cart table
//reditect to buy 
return models.Cart.findOne({where:{bookId:req.body.bookId,id:req.session.userId}}).then(cartData => {
    if(cartData==null){   // in the above where condition add OrderFlag ==0 condition
        //Create a new entry
        return models.Books.findOne({where:{bookId:req.body.bookId}}).then(booksData => {
            if(booksData.quantity<req.body.qtybutton){
                // console.log("QUANTITY:"+booksData.quantity);
                // console.log("HELLO 1");
                // res.send('buyer'); //Put some error
                res.render("oopspage",{erro:"Add Less Quantity"});
            }else{
                let quanto=booksData.quantity-req.body.qtybutton;
                // console.log("Quanto:"+quanto);
                if(quanto>=0){
                    return models.Cart.create({
                        cartOneTimeId:1, //Handle this
                        bookId:req.body.bookId,
                        bookForeignId:req.body.bookId,
                        id:req.session.userId,
                        buyer_id:req.session.userId,
                        title:booksData.title,
                        quantity:req.body.qtybutton,
                        price:parseInt(booksData.price) //Calculate the prize //Update this prize if the seller updates
                    }).then(user=>{
                        // console.log("HELLO 2");
                        let quant=booksData.quantity-req.body.qtybutton;
                        return models.Books.update({quantity:quant},{where:{bookId:req.body.bookId}}).then(function(rowsUpdated) {
                            res.redirect('buy');
                        });
                    });
                }else{
                    // console.log("HELLO 3");
                    res.render("oopspage",{erro:"Add Less Quantity"}); //error - Do not have that much quantity in database
                }
            }
        }).catch((e) => { err => console.error(err.message);
            res.render("oopspage");
        })
    }else{
        // Books
        // Update the previous entry
        return models.Books.findOne({where:{bookId:req.body.bookId}}).then(booksDataFind => {
            if(booksDataFind.quantity<req.body.qtybutton){
                // console.log("HELLO 3");
                // res.render('buyer'); //Put some error
                // res.send('cannot update with that quantity');
                res.render("oopspage",{erro:"Add Less Quantity"});
            }else{
                // console.log("HELLO 4");
                //get previous vale in cart and add this one
                return models.Cart.findOne({where:{bookId:req.body.bookId,id:req.session.userId,cartOneTimeId:1}}).then(cartQuantity=>{
                    let cQ=parseInt(cartQuantity.quantity)+parseInt(req.body.qtybutton);
                    return models.Cart.update({ quantity:cQ},{where:{cartOneTimeId:1,bookId:req.body.bookId,id:req.session.userId}}).then(function(rowsUpdated){
                        let quant=parseInt(booksDataFind.quantity)-parseInt(req.body.qtybutton);
                            return models.Books.update({quantity:quant},{where:{bookId:req.body.bookId}}).then(function(rowsUpdated) {
                                // res.render('buyer');
                                res.redirect('buy');
                            });
                    });
                });
            }
        }).catch((e) => { err => console.error(err.message);
            res.render("oopspage");
        });
    }
});
}

exports.cartPage=function(req,res,next){
    //Check for book in inventory, if it has been deleted then show the message
    //Update the price accordingly
    // So when user login in back he shouwl be able to view his own cart
    //Calculate the prize too for the cart individual item on the fly

    return models.Cart.findAll({where:{id:req.session.userId,cartOneTimeId:1}}).then(cartData => {
        if(cartData==null){
            res.render("cart",{erro:"NO BOOKS TO SHOW"});
        }else{
                let total=0;
                cartData.forEach(dt => {
                    if(dt.delFlag==false){
                        total+=dt.quantity*dt.price;
                    }
                  });
                res.render('cart',{result:cartData,total:total});
        }
    }).catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}

// Add a delete functionality
//while deleting a book update the quantity in the books table

exports.cartDelete=function(req,res,next){
    //Check for book in inventory, if it has been deleted then show the message
    //Update the price accordingly
    // So when user login in back he shouwl be able to view his own cart
    //Calculate the prize too for the cart individual item on the fly
    return models.Cart.findOne({where:{id:req.session.userId,cartOneTimeId:1,bookId:req.body.bookId}}).then(cartData => {
        let bookCartQuantity=cartData.quantity;
        return models.Cart.destroy({
            where: {
                bookId:req.body.bookId,
                id:req.session.userId,
                cartOneTimeId:1
                 //Check for this, change it to different input value from UI
            }
        }).then(()=>{
            return models.Books.findOne({where:{bookId:req.body.bookId}})
            .then(bookDt=>{
                if(bookDt==null){
                    res.redirect('buy');
                }else{
                    return models.Books.update({
                        quantity:parseInt(bookDt.quantity)+parseInt(bookCartQuantity),
                    },{where:{bookId:req.body.bookId}}).then(user=>{
                        res.redirect('buy');
                    });
                }
            });
            }
        ).catch((e) => { err => console.error(err.message);
            res.render("oopspage");
        });
    }).catch((e) => { err => console.error(err.message);
        res.render("oopspage");
    });
}


// exports.viewImagesPage=function(req,res,next){
//     return models.Image.findAll({where:{book_Img_id:req.body.bookId}}).then(imgData => {
//         if(imgData==null){
//             res.render("viewImage",{erro:"NO Images TO SHOW"});
//         }else{
//             var params = {Bucket: bucket, Key: imgData[0].imageName}
//             // s3.getObject(params, function(err, data) {
//             //     if (err) console.log(err, err.stack); // an error occurred
//             //     else     res.send(data);           // successful response
//             //   });
//             var file = require('fs').createWriteStream(__dirname+'/im/'+imgData[0].imageName);
//             s3.getObject(params).createReadStream().pipe(file);
//             res.render("viewImage",{result:imgData});
//         }
//     }).catch((e) => { err => console.error(err.message);
//         res.render("oopspage");
//     });
// }
// exports.viewImagesPage=function(req,res,next){
//     return models.Image.findAll({where:{book_Img_id:req.body.bookId}}).then(imgData => {
//         if(imgData==null){
//             res.render("viewImage",{erro:"NO Images TO SHOW"});
//         }else{
//             imgData.forEach(element =>{
//                 var params = {Bucket: bucket, Key: element.imageName};
//                 s3.getObject(params, function(err, data) {
//                 if (err) console.log(err, err.stack); // an error occurred
//                 else{
//                     var file = require('fs').createWriteStream('public/uploads/images/'+imgData[0].imageName);
//                     var s3Stream=s3.getObject(params).createReadStream();  
//                     s3Stream.pipe(file).on('error', function(err) {
//                     // capture any errors that occur when writing data to the file
//                     console.error('File Stream:', err);
//                     }).on('close', function() {
//                     console.log('Done.');
                    
//                     });     
//                 }           // successful response
//             }); });
//             res.render("viewImage",{result:imgData});
//         }
//     }).catch((e) => { err => console.error(err.message);
//         console.log(e);
//         res.render("oopspage");
//     });
// }

exports.viewImagesPage=function(req,res,next){
    return models.Image.findAll({where:{book_Img_id:req.body.bookId}}).then(imgData => {
        if(imgData==null){
            res.render("viewImage",{erro:"NO Images TO SHOW"});
        }else{
            res.render("viewImage",{result:imgData});
        }
    }).catch((e) => { err => console.error(err.message);
        console.log(e);
        res.render("oopspage");
    });
}

exports.viewImagesFromAllSellers=function(req,res,next){
    return models.Books.findAll({where:{bookId:req.body.bookId}}).then(bookData => {
        if(bookData==null){
                // console.log("Here 1");
            res.render("viewImage",{erro:"NO Images TO SHOW"});
        }else{
            return models.Books.findAll({where:{title:bookData[0].title}}).then(booksCommon => {
                if(booksCommon==null){
                        // console.log("Here 2");
                    res.render("viewImage",{erro:"NO Images TO SHOW"});
                }else{
                        // console.log("Here 3");
                    //dsfsdf booksCommon[0].bookId
                    var arr=[]
                    booksCommon.forEach(element=>{
                        arr.push(element.bookId);
                    });
                        console.log(arr);
                    return models.Image.findAll({where:{book_Img_id:{[Op.in]:arr}}}).then(finalData=>{
                        // console.log("Here 4");
//                        res.send(finalData);
                        res.render("viewImage",{result:finalData});
                    }).catch((e) => { err => console.error(err.message);
                        console.log(e);
                        res.render("oopspage");
                    });
                }
            }).catch((e) => { err => console.error(err.message);
                console.log(e);
                res.render("oopspage");
            });
        }
    }).catch((e) => { err => console.error(err.message);
        console.log(e);
        res.render("oopspage");
    });
}