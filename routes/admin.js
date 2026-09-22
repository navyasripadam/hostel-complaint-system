const express=require("express");
const router=express.Router();
const { adminLogin,showComplaints,editComplaint,updateComplaint} = require("../controllers/admin");


const Complaint=require("../models/complaint");
const {isLoggedIn,isAdmin}=require("../middleware");

router.get("/login",(req,res)=>{
  res.render("admin/login");
})



router.post("/login",adminLogin);



router.get("/complaints",isLoggedIn,isAdmin,showComplaints);


router.get("/complaints/:id/edit",editComplaint);




router.put("/complaints/:id",isLoggedIn,isAdmin,updateComplaint);



module.exports=router;


