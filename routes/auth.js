const express = require('express');
const { check } = require("express-validator");
const User = require("../models/user");
 
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',[
    check("email").isEmail().withMessage("Please enter a valid email!").normalizeEmail(),
    check("password", "Please enter a password with only numbers and text and at least 5 charachters.").isLength({min:5}).isAlphanumeric().trim()

    
],  authController.postLogin);

router.post('/signup',[
     check("email").isEmail().withMessage("Please enter a valid email!").normalizeEmail().custom((value, {req})=>{
       return  User.findOne({email: value})    // aynı mail ile daha önce hesap açılmış mı diye kontrol eder
   .then(userDoc => {
    if(userDoc){
    return Promise.reject("E-mail exist already, please pick a different one!");
    } 
     });
    }), 
     check("password", "Please enter a password with only numbers and text and at least 5 charachters.").isLength({min:5}).isAlphanumeric().trim(),
     check("confirmPassword").trim().custom((value, {req})=> { if(value!==req.body.password){
        throw new Error("Passwords have to match");
    }
})

     
]
     ,authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;