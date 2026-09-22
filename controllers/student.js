const Student=require("../models/student");
const bcrypt=require("bcrypt");

module.exports.registerStudent=async(req,res)=>{
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
}


module.exports.loginStudent=async(req,res)=>{
     const {email,password}=req.body;
    const student=await Student.findOne({email});
    if(!student){
       req.flash("error","Student not found");
      return res.redirect("/students/login");
    }

   const isMatch=await bcrypt.compare(password,student.password);
   if(isMatch){
     req.session.studentId=student._id;
    req.session.role=student.role;
     req.session.save((err)=>{
      if(err){
        return res.send("Session Error");
      }
     req.flash("success","Login Successful");
     res.redirect("/complaints/mycomplaints");
    });
   }else{
     req.flash("error","Invalid Password");
     res.redirect("/students/login");
   }
};

