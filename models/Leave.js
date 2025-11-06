import mongoose from "mongoose";
import { Schema } from "mongoose";

const leaveSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    leaveType: { type: String, enum: ['sick', 'annual', 'casual'], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedDate: { type: Date, default: Date.now },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
