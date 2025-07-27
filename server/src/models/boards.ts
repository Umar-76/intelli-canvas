import mongoose, { Schema } from 'mongoose';

const ElementSchema = new Schema({
  type: { 
    type: String, 
    enum: ['sticky-note', 'text', 'shape', 'drawing', 'image'],
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: Number,
    height: Number
  },
  content: String,
  style: {
    color: String,
    fontSize: Number,
    fontFamily: String
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const BoardSchema = new Schema({
  title: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  elements: {type: [ElementSchema], default: []},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Board', BoardSchema);