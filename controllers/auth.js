const bcrypt = require("bcryptjs"); //passwordu hashlemek için, şifrelemek için
const { validationResult } = require("express-validator"); 

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if(message.length > 0){
    message = message[0];
    }else{
      message = null;
    }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false,
    errorMessage: message,
    oldInput:{
      email: "",
      password: "",
    }
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if(message.length > 0){
    message = message[0];
    }else{
      message = null;
    }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput:{
      email: "",
      password: "",
      confirmPassword: "",
    }
  });
};

exports.postLogin = (req, res, next) => { // kayıtlı kullanıcı girişini sağlar
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
   console.log(errors.array())
   return res.status(422).render('auth/login', {
     path: '/login',
     pageTitle: 'Login',
     isAuthenticated: false,
     errorMessage: errors.array()[0].msg,
     oldInput:{
      email: email,
      password: password,
    }
   });
  }

  User.findOne({email: email}) // o email ile kayıtlı kullanıcı varsa getirir
    .then(user =>{
      if(!user){
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: false,
          errorMessage: "Invalid email or password!",
          oldInput:{
           email: email,
           password: password, // geçersiz email ise hata mesajıyla birlikte login sayfasına döndürür
          },
      });
    }
      bcrypt.compare(password, user.password) //üst kısımda kontrol edilen email kayıtlı ise,  şifrenin doğruluğunu kontrol eder
      .then(doMatch => {
        if(doMatch){ //şifre doğru ise session oluşturur, sonrasında anasayfaya yönlendirir
          req.session.isLoggedIn = true;
      req.session.user = user;
     return req.session.save(err => {
        console.log(err);
       res.redirect("/"); 
      });
         
        }
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: false,
          errorMessage: "Invalid email or password!",
          oldInput:{
           email: email,
           password: password, // geçersiz email ise hata mesajıyla birlikte login sayfasına döndürür
          },
      });
      })
        .catch(err=>{
        console.log(err);
        res.redirect("/login");
      });
    }
    )
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
   const email = req.body.email;
   const password = req.body.password;
   const errors = validationResult(req);
   if(!errors.isEmpty()){
    console.log(errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput:{
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      }
    });
   }

   
    bcrypt.hash(password, 12)
  .then(hashedPassword => {const user = new User({ 
    email: email,
    password: hashedPassword,
    cart: {items: []},
   })
   return user.save();
 }) 
   .then(result => {           
    res.redirect("/login");  //kayıt oldu ise login sayfasına yönlendirir
   })  
   .catch(err=>console.log(err))
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};
