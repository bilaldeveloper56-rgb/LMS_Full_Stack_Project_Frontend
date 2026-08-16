import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: [true, 'Academic session ID is required'],
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
      maxlength: [100, 'Section name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Section code is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'Section code cannot exceed 50 characters'],
    },
    capacity: {
      type: Number,
      required: [true, 'Section capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 40,
    },
    room: {
      type: String,
      trim: true,
      default: null,
      maxlength: [50, 'Room cannot exceed 50 characters'],
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
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
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        return ret;
      },
    },
  }
);

// Indexes
sectionSchema.index({ schoolId: 1, classId: 1, academicSessionId: 1, code: 1 }, { unique: true });
sectionSchema.index({ schoolId: 1, classId: 1, academicSessionId: 1, name: 1 });
sectionSchema.index({ schoolId: 1, classId: 1, isActive: 1 });
sectionSchema.index({ schoolId: 1, classTeacherId: 1 });

// Soft-delete query filter
sectionSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Section = mongoose.model('Section', sectionSchema);
export default Section;
