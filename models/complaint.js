const mongoose = require('mongoose');
const complaintSchema=new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true,
    },

    title:{
        type:String,
       required:true,
    },
    description:{
         type:String,
         required:true,
    },
    category:{
         type:String,
         required:true,
    },
    roomNumber:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["Pending","In Progress","Resolved"],
        default:"Pending",
    },
 },
 {
    timestamps:true,
 }
);

const Complaint=mongoose.model("Complaint",complaintSchema);

module.exports=Complaint;