import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [100, 'Class name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Class code is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'Class code cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    displayOrder: {
      type: Number,
      default: 0,
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
classSchema.index({ schoolId: 1, academicSessionId: 1, code: 1 }, { unique: true });
classSchema.index({ schoolId: 1, academicSessionId: 1, name: 1 });
classSchema.index({ schoolId: 1, academicSessionId: 1, isActive: 1 });
classSchema.index({ schoolId: 1, displayOrder: 1 });

// Soft-delete query filter
classSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Class = mongoose.model('Class', classSchema);
export default Class;
