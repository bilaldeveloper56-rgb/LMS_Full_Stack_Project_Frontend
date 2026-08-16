import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: [true, 'Audit event name is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    entityType: {
      type: String,
      default: null,
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common audit queries
auditLogSchema.index({ schoolId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ event: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
