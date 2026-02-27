import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventCategory: { type: String, required: true },
  eventTitle: { type: String, required: true },
  timestamp: { type: Number }
});

export default mongoose.model("Registration", registrationSchema);