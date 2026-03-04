import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'recruiter'],
        required: true
    },
    profile:{
      bio:{type:string},
      skills:{type:[string]},
      resume:{type:string},  // URL to resume file
      resumeOriginalName:{type:string},
      company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, //only for recruiters
      profilephoto:{
        type:string,
        default:""
      }
    }
  }, {timestamps:true});
  export const user = mongoose.model('user', userSchema);