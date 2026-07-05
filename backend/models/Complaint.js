const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ComplaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
      default: 'Submitted',
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [
      {
        type: String, // URLs to files or image uploads
      },
    ],
    timeline: [TimelineSchema],
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique sequential or random numeric Complaint ID before validate
ComplaintSchema.pre('validate', async function (next) {
  if (!this.complaintId) {
    // Format: COM-YYYYMMDD-XXXX (4-digit random)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    this.complaintId = `COM-${dateStr}-${randDigits}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
