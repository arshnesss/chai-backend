import mongoose, { Schema } from "mongoose"; 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Importing pagination plugin

// Define the schema for storing video details
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // Cloudinary URL for storing the video file
            required: true // This field is mandatory
        },
        thumbnail: {
            type: String, // URL for the video thumbnail
            required: true
        },
        title: {
            type: String, // Title of the video
            required: true
        },
        description: {
            type: String, // Video description
            required: true
        },
        duration: {
            type: Number, // Duration of the video in seconds
            required: true
        },
        views: {
            type: Number, // Count of views on the video
            default: 0 // Default value is 0
        },
        isPublished: {
            type: Boolean, // Whether the video is published or not
            default: true // Default is set to published (true)
        },
        owner: {
            type: Schema.Types.ObjectId, // Reference to the user who uploaded the video
            ref: "User" // Links to the "User" model
        }
    },
    {
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
)

// Apply the pagination plugin to the schema
videoSchema.plugin(mongooseAggregatePaginate);

// Export the Video model for use in other parts of the application
export const Video = mongoose.model("Video", videoSchema);
