const express=require('express');
const app = express();
const path=require("path");
const mongoose = require('mongoose');
const session=require("express-session");
const methodOverride=require("method-override");
const flash=require("connect-flash");
const studentRoutes=require("./routes/student");
const complaintRoutes=require("./routes/complaint");
const adminRoutes=require("./routes/admin");

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

app.use("/students",studentRoutes);
app.use("/complaints",complaintRoutes);
app.use("/admin",adminRoutes);



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
     res.redirect("/students/login");
  });
});


app.listen(8080, () => {
  console.log('Listening to port');
});