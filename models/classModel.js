const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "5A", "7B"
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Students in the class
  parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Parents linked to the class
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
