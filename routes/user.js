const express = require("express")
const session = require("express-session")
const router = express.Router()
const { body, validationResult } = require('express-validator');
const {createUser,login,changePassword} = require("../controller/Controller")

const options_session = { 
	name:"cookie of session",
	secret: "secretKey", 
    saveUninitialized:false,
    cookie: { path:"/login",maxAge: null },
    resave: true 
}
router.use(session(options_session))

//validamos las caracteristicas de los datos introducidos, y luego registramos
 router.post("/register", body('username').isEmail(),body('password').isLength({ min: 5 }),(req,res)=>{

	const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json("registration error");
    }
    else{	
    	createUser(req.body,router).then(m => res.json(m))
    }
})

router.get("/login",(req,res)=>{
	login(req.body,req).then(m =>res.json(m))
})

router.post("/login/changePassword",(req,res)=>{
		req.session.destroy()
		changePassword(req.body).then(m => res.json(m))
})

module.exports = router






