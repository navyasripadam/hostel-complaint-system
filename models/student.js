const mongoose=require("mongoose");

const studentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["student","admin"],
        default:"student"
    },
    hostel:{
        type:String,
        required:true
    },
    roomNumber:{
        type:String,
        required:true
    }
});

const Student =mongoose.model("Student",studentSchema);

module.exports=Student;