const express=require('express');
const app = express();
const path=require("path");
const mongoose = require('mongoose');
const Complaint=require("./models/complaint");
const Student=require("./models/student");
const bcrypt=require("bcrypt");
const session=require("express-session");
const methodOverride=require("method-override");
const complaintSchema=require("./schema");
const flash=require("connect-flash");
const { resourceLimits } = require('worker_threads');
const adminController = require("./controllers/admin");
const { isLoggedIn } = require("./middleware");

main()
.then(()=>{
  console.log("DB Connected");
})
.catch((err)=>{
  console.log(err);
});

async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/hostelComplaintDB");
}


app.set('view engine','ejs');
app.set("views",path.join(__dirname,"views"));


app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));


app.use(session({
  secret:"mysecretkey",
  resave:false,
  saveUninitialized:false
})
);

app.use(flash());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
});

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



app.get("/mycomplaints",isLoggedIn,async(req,res)=>{
  // console.log(req.session.studentId);
  // console.log(req.session);
   const allComplaints=await Complaint.find({
    student:req.session.studentId
  });
  //  console.log(allComplaints);
  // console.log(res.locals.success);
    res.render("complaints/mycomplaints",{allComplaints});
    
});

app.get("/profile",isLoggedIn,(req,res)=>{
  if(!req.session.studentId){
    return res.send("Please Login");
  }
  res.send("Welcome Student");
});

app.get("/logout",(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      return res.send("Error logging out");
    }
    req.flash("success","Logout Successful");
     res.redirect("/students/login");
  })
});


//to raise a new complaint
app.get("/complaints/new",isLoggedIn,(req,res)=>{
  if(!req.session.studentId){
    return res.send("Please Login");
  }
  res.render("complaints/new");
})


//complaints url receive form data 
app.post("/complaints",isLoggedIn,async (req,res)=>{
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
    res.redirect("/mycomplaints");
});



app.get("/complaints",async (req,res)=>{
  const allComplaints=await Complaint.find({
    student:req.session.studentId
  });
 
  res.render("complaints/index",{allComplaints});
});

app.get("/students/register",(req,res)=>{
  res.render("students/register");
});

app.post("/students/register",async (req,res)=>{
    const {name,email,password,hostel,roomNumber}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    const student=new Student({
      name,
      email,
      password:hashedPassword,
      hostel,
      roomNumber
    });
    await student.save();
     req.flash("success","Registration Successful");
     res.redirect("/students/login");
});

app.get("/students/login",(req,res)=>{
    res.render("students/login");
});

app.post("/students/login",async(req,res)=>{
    const {email,password}=req.body;
    const student=await Student.findOne({email});
    if(!student){
       req.flash("error","Student not found");
     res.redirect("/students/login");
    }

   const isMatch=await bcrypt.compare(password,student.password);
   if(isMatch){
     req.session.studentId=student._id;
    req.session.role=student.role;
    console.log(req.session);
     req.session.save((err)=>{
      if(err){
        return res.send("Session Error");
      }
     req.flash("success","Login Successful");
     res.redirect("/mycomplaints");
    });
   }else{
     req.flash("error","Invalid Password");
     res.redirect("/students/login");
   }
});



app.get("/complaints/:id/edit",isLoggedIn,isComplaintOwner,async(req,res)=>{
  const{id}=req.params;
  const complaint=await Complaint.findById(id);
  res.render("complaints/edit",{complaint});
});

app.put("/complaints/:id",isLoggedIn,isComplaintOwner,async(req,res)=>{
   const {error}=complaintSchema.validate(req.body);

    if(error){
      return res.send(error.details[0].message);
    }
  const{id}=req.params;
  await Complaint.findByIdAndUpdate(id,req.body);
   req.flash("success","Complaint Updated Successfully");
   console.log(req.session);
  res.redirect("/mycomplaints");
})


app.delete("/complaints/:id",isLoggedIn,isComplaintOwner,async(req,res)=>{
   const{id}=req.params;
  await Complaint.findByIdAndDelete(id);
  req.flash("success","Complaint Deleted Successfully");
  res.redirect("/mycomplaints");
})


app.get("/admin/complaints", isLoggedIn, isAdmin, adminController.showComplaints);

app.put("/admin/complaints/:id", isLoggedIn, isAdmin, adminController.updateComplaint);

app.get("/admin/complaints/:id/edit", isLoggedIn, isAdmin, adminController.editComplaint);


app.get("/admin/login",(req,res)=>{
  res.render("admin/login");
})


app.post("/admin/login",(req,res)=>{
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
});




app.listen(8080, () => {
  console.log('Listening to port');
});