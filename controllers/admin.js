const Complaint=require("../models/complaint");


module.exports.adminLogin=(req,res)=>{
    const {email,password}=req.body;
   if(email==="admin@gmail.com" && password==="admin123"){
    req.session.role="admin";
     req.session.save((err)=>{
      if(err){
        return res.send("Session Error");
      }
     req.flash("success","Admin Login");
     res.redirect("/admin/complaints");
    });
   }else{
     req.flash("error","Invalid Admin Credentials");
     res.redirect("/admin/login");
   }
};

module.exports.showComplaints=async(req,res)=>{
  const { status, search, sort } = req.query;
  let complaints;
  if(status){
    complaints=await Complaint.find({status}).populate("student");
  }else{
    complaints=await Complaint.find().populate("student");
  }

  if(search){
    const searchText=search.toLowerCase();
    complaints=complaints.filter(complaint=>complaint.title?.toLowerCase().includes(searchText)||complaint.roomNumber?.toLowerCase().includes(searchText)||complaint.hostel?.toLowerCase().includes(searchText) ||complaint.student?.name?.toLowerCase().includes(searchText));
  }


  if(sort==="newest"){
  complaints.sort((a,b)=>b.createdAt-a.createdAt);
}

if(sort==="oldest"){
  complaints.sort((a,b)=>a.createdAt-b.createdAt);
}

  const allComplaints=await Complaint.find();
  const categories = ["electrical", "plumbing", "civil", "wifi", "others"];
const categoryCounts = categories.map(category =>
    allComplaints.filter(c => c.category === category).length
);
  const total=allComplaints.length;
  const pending=allComplaints.filter(c=>c.status==="Pending").length;
  const inProgress=allComplaints.filter(c=>c.status==="In Progress").length;
  const resolved=allComplaints.filter(c=>c.status==="Resolved").length;
  const rejected=allComplaints.filter(c=>c.status==="Rejected").length;
  res.render("admin/index", {
    complaints,
    total,
    pending,
    inProgress,
    resolved,
    rejected,
    categories,
    categoryCounts,
    sort
});
};

module.exports.editComplaint=async(req,res)=>{
  const complaint=await Complaint.findById(req.params.id);
  res.render("admin/edit",{complaint});
};

module.exports.updateComplaint=async(req,res)=>{
  const {status}=req.body;
 
  await Complaint.findByIdAndUpdate(
    req.params.id,
    {status}
  );
    req.flash("success","Complaint Updated Successfully");
  res.redirect("/admin/complaints");
};


module.exports.showComplaint = async (req, res) => {
    const complaint = await Complaint.findById(req.params.id)
        .populate("student");

    if (!complaint) {
        return res.send("Complaint not found");
    }

    res.render("admin/details", { complaint });
};