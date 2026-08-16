import mongoose from 'mongoose';

const gradeEntrySchema = new mongoose.Schema(
  {
    grade: { type: String, required: true, trim: true },
    minPercentage: { type: Number, required: true, min: 0, max: 100 },
    maxPercentage: { type: Number, required: true, min: 0, max: 100 },
    gradePoint: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const gradingScaleSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Grading scale name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    grades: {
      type: [gradeEntrySchema],
      default: [
        { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 4.0, description: 'Outstanding' },
        { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.7, description: 'Excellent' },
        { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.0, description: 'Good' },
        { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gradePoint: 2.0, description: 'Satisfactory' },
        { grade: 'D', minPercentage: 50, maxPercentage: 59.99, gradePoint: 1.0, description: 'Pass' },
        { grade: 'F', minPercentage: 0, maxPercentage: 49.99, gradePoint: 0.0, description: 'Fail' },
      ],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
  }
);

gradingScaleSchema.index(
  { schoolId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

gradingScaleSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const GradingScale = mongoose.model('GradingScale', gradingScaleSchema);

export default GradingScale;
