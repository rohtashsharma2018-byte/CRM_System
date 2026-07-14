import mongoose from 'mongoose';
import { Lead, CallLog } from './models.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const leads = await Lead.find({}, '_id');
  const leadIds = leads.map(l => l._id.toString());
  const callLogs = await CallLog.find({});
  let deletedCount = 0;
  for (const call of callLogs) {
    if (!leadIds.includes(call.lead_id.toString())) {
      await CallLog.findByIdAndDelete(call._id);
      deletedCount++;
    }
  }
  console.log('Deleted orphaned call logs:', deletedCount);
  mongoose.disconnect();
});
