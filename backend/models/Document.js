import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        pageNumber: {
            type: Number,
            default: 0
        },
        chunkIndex: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        title: {
            type: String,
            required: [true, 'Please provide a document title'],
            trim: true
        },

        fileName: {
            type: String,
            required: true
        },

        filePath: {
            type: String, // public URL
            required: true
        },

        localPath: {
            type: String // filesystem path
        },

        fileSize: {
            type: Number,
            required: true
        },

        extractedText: {
            type: String,
            default: ''
        },

        chunks: [chunkSchema],

        status: {
            type: String,
            enum: ['processing', 'ready', 'failed'],
            default: 'processing'
        },

        lastAccessed: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// 🔥 Optimized index for dashboard queries
documentSchema.index({ userId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
