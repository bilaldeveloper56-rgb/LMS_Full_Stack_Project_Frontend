import mongoose from 'mongoose';

const messageAttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true, default: '' },
    sizeBytes: { type: Number, default: 0 },
  },
  { _id: false }
);

const messageReadRecipientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender user ID is required'],
      index: true,
    },
    senderRole: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [4000, 'Content cannot exceed 4000 characters'],
    },
    attachments: {
      type: [messageAttachmentSchema],
      default: [],
    },
    isReadBy: {
      type: [messageReadRecipientSchema],
      default: [],
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

messageSchema.index({ schoolId: 1, conversationId: 1, createdAt: 1 });

messageSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
