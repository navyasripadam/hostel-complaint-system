const express=require("express");
const router=express.Router();

const Complaint=require("../models/complaint");
const {isLoggedIn,isComplaintOwner}=require("../middleware");
const { createComplaint,myComplaints,editComplaint,updateComplaint,deleteComplaint} = require("../controllers/complaint");


//to raise a new complaint
router.get("/new",isLoggedIn,(req,res)=>{
  if(!req.session.studentId){
    return res.send("Please Login");
  }
  res.render("complaints/new");
})


//complaints url receive form data 
router.post("/",isLoggedIn,createComplaint);


router.get("/mycomplaints",isLoggedIn,myComplaints);

router.get("/history",isLoggedIn,async(req,res)=>{
  const historyComplaints=await Complaint.find({
    student:req.session.studentId,
    status:{$in:["Resolved","Rejected"]}
  });
  res.render("complaints/history",{historyComplaints});
});

router.get("/:id/edit",isLoggedIn,isComplaintOwner,editComplaint);

router.put("/:id",isLoggedIn,isComplaintOwner,updateComplaint);


router.delete("/:id",isLoggedIn,isComplaintOwner,deleteComplaint);



router.get("/",isLoggedIn,async (req,res)=>{
  const allComplaints=await Complaint.find({
    student:req.session.studentId
  });
 
  res.render("complaints/index",{allComplaints});
});

module.exports=router;