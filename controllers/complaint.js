const Complaint=require("../models/complaint");
const Student=require("../models/student");
const complaintSchema=require("../schema");



module.exports.createComplaint=async (req,res)=>{
    const {error}=complaintSchema.validate(req.body);

    if(error){
      return res.send(error.details[0].message);
    }
    const student = await Student.findById(req.session.studentId);
    const complaint=new Complaint({
      ...req.body,
      student:req.session.studentId,
      hostel:student.hostel,
      roomNumber:student.roomNumber
    });
    await complaint.save();
    req.flash("success","Complaint Submitted Successfully");
    res.redirect("/complaints/mycomplaints");
};


module.exports.myComplaints=async(req,res)=>{
  // console.log(req.session.studentId);
  // console.log(req.session);
   const allComplaints=await Complaint.find({
    student:req.session.studentId
  });
  //  console.log(allComplaints);
  // console.log(res.locals.success);
    res.render("complaints/mycomplaints",{allComplaints});
    
};

module.exports.editComplaint=async(req,res)=>{
  const{id}=req.params;
  const complaint=await Complaint.findById(id);
  res.render("complaints/edit",{complaint});
};

module.exports.updateComplaint=async(req,res)=>{
   const {error}=complaintSchema.validate(req.body);

    if(error){
      return res.send(error.details[0].message);
    }
  const{id}=req.params;
  await Complaint.findByIdAndUpdate(id, {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category
});
   req.flash("success","Complaint Updated Successfully");
   console.log(req.session);
  res.redirect("/complaints/mycomplaints");
};

module.exports.deleteComplaint=async(req,res)=>{
   const{id}=req.params;
  await Complaint.findByIdAndDelete(id);
  req.flash("success","Complaint Deleted Successfully");
  res.redirect("/complaints/mycomplaints");
};