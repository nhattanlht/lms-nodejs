import mongoose from 'mongoose';
const participantSchema = new mongoose.Schema({
    participant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['student', 'lecturer'],
      required: true
    }
  });

const enrollmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true
  },
  participants: [participantSchema],
  created_by: {
    type: String,
    required: false
  }
},
{
  timestamps: true,
  collection: 'enrollment'
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;