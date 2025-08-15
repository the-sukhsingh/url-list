import mongoose from "mongoose";

export interface ILink {
    _id: mongoose.Types.ObjectId;
    urls: string[];
    title: string;
    slug: string;
    keyWord: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LinkSchema = new mongoose.Schema<ILink>({
    urls: { type: [String], required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    keyWord: {type: String, required: true, trim: true, minlength: 3, maxlength: 20},
    description: { type: String, default: "" },
}, {
    timestamps: true,
});

const LinkModel = mongoose.models.Link || mongoose.model<ILink>("Link", LinkSchema);

export default LinkModel;