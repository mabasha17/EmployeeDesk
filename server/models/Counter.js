import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Static method to get the next sequence for a given counter
counterSchema.statics.getNextSequence = async function (counterId) {
  const result = await this.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
