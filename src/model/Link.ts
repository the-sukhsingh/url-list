import mongoose from "mongoose";

export interface ILink {
    _id: mongoose.Types.ObjectId;
    urls: string[];
    title: string;
    slug: string;
    userId: mongoose.Types.ObjectId ;
    viewType:  "public" | "private";
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LinkSchema = new mongoose.Schema<ILink>({
    urls: { type: [String], required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    viewType: { type: String, enum: ["public", "private"], default: "public" },
    description: { type: String, default: "" },
}, {
    timestamps: true,
});

const LinkModel = mongoose.models.Link || mongoose.model<ILink>("Link", LinkSchema);

export default LinkModel;