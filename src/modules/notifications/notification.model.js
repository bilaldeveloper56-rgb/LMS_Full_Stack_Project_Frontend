import mongoose from 'mongoose';
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_TYPE_VALUES,
  NOTIFICATION_SEVERITY,
  NOTIFICATION_SEVERITY_VALUES,
} from '../../constants/index.js';

const notificationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE_VALUES,
        message: 'Invalid notification type: {VALUE}',
      },
      default: NOTIFICATION_TYPE.SYSTEM,
      index: true,
    },
    severity: {
      type: String,
      enum: {
        values: NOTIFICATION_SEVERITY_VALUES,
        message: 'Invalid notification severity: {VALUE}',
      },
      default: NOTIFICATION_SEVERITY.INFO,
    },
    linkUrl: {
      type: String,
      trim: true,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
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

notificationSchema.index({ schoolId: 1, recipientUserId: 1, isRead: 1, createdAt: -1 });

notificationSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
