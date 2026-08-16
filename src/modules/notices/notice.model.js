import mongoose from 'mongoose';
import {
  NOTICE_PRIORITY,
  NOTICE_PRIORITY_VALUES,
  TARGET_AUDIENCE,
  TARGET_AUDIENCE_VALUES,
} from '../../constants/index.js';

const noticeAttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true, default: '' },
    sizeBytes: { type: Number, default: 0 },
  },
  { _id: false }
);

const noticeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: {
        values: NOTICE_PRIORITY_VALUES,
        message: 'Invalid priority: {VALUE}',
      },
      default: NOTICE_PRIORITY.NORMAL,
    },
    targetAudience: {
      type: String,
      enum: {
        values: TARGET_AUDIENCE_VALUES,
        message: 'Invalid target audience: {VALUE}',
      },
      default: TARGET_AUDIENCE.ALL,
      index: true,
    },
    targetClassIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    targetSectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    attachments: {
      type: [noticeAttachmentSchema],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
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

noticeSchema.index({ schoolId: 1, isPublished: 1, targetAudience: 1, isPinned: -1, createdAt: -1 });

noticeSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;
