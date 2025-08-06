import mongoose from "mongoose";
import bcrypt from "bcryptjs";
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, {
    timestamps: true,
});

UserSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    bcrypt.hash(this.password, 10, (err, hash) => {
        if (err) return next(err);
        this.password = hash || this.password; // Ensure password is set even if hashing fails
        next();
    });
})

UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err) return reject(err);
            resolve(!!isMatch);
        });
    });
};


const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;