const Complaint=require("../models/complaint");
function isLoggedIn(req,res,next){
  if(!req.session.studentId && req.session.role!=="admin"){
    return res.send("Please Login First");
  }
  next();
}


function isAdmin(req,res,next){
  if(req.session.role!=="admin"){
    return res.redirect("/students/login");
  }
  next();
}

async function isComplaintOwner(req,res,next){
    let {id}=req.params;
    const complaint=await Complaint.findById(id);
    if(complaint.student.equals(req.session.studentId)){
      next();
    }else{
      req.flash("error","You are not authorized to edit this complaint.");
      return res.redirect("/mycomplaints");
    }
}


module.exports={isLoggedIn,isAdmin,isComplaintOwner};