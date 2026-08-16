import mongoose from 'mongoose';
import { CONVERSATION_TYPE, CONVERSATION_TYPE_VALUES } from '../../constants/index.js';

const conversationParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    participants: {
      type: [conversationParticipantSchema],
      required: true,
      validate: [(val) => val.length >= 2, 'Conversation must have at least 2 participants'],
    },
    type: {
      type: String,
      enum: {
        values: CONVERSATION_TYPE_VALUES,
        message: 'Invalid conversation type: {VALUE}',
      },
      default: CONVERSATION_TYPE.DIRECT,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    lastMessage: {
      content: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      sentAt: { type: Date, default: null },
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

conversationSchema.index({ schoolId: 1, 'participants.userId': 1, updatedAt: -1 });

conversationSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
