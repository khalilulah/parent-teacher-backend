const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
