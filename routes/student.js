const express=require("express");
const router=express.Router();

const Student=require("../models/student");
const bcrypt=require("bcrypt");
const {
    registerStudent,
    loginStudent,
    showProfile
} = require("../controllers/student");

router.get("/register",(req,res)=>{
  res.render("students/register");
});

router.post("/register",registerStudent);

router.get("/login",(req,res)=>{
    res.render("students/login");
});



router.post("/login",loginStudent);

module.exports=router;

router.get("/profile",showProfile);
