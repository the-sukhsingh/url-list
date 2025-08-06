import { NextResponse } from "next/server";
import UserModel from "@/model/User";
import dbConnect from "@/lib/db";
import Link from "@/model/Link";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

// PUT - Update user information
export async function PUT(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    if (!user || !user.email) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = await UserModel.findOne({ email: user.email });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        const data = await request.json();

        const updatedUser = await UserModel.findByIdAndUpdate(dbUser._id, data, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

// GET - Get user information and Links related to the user

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    if (!user || !user.email) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = await UserModel.findOne({ email: user.email });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        // Get userID from query parameters instead of request body
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID');

        let userId;
        if (userID && userID !== "") {
            userId = userID;
        } else {
            userId = dbUser._id;
        }

        const targetUser = await UserModel.findById(userId).select("-password -__v");

        const links = await Link.find({ userId: userId }).sort({ createdAt: -1 });

        return NextResponse.json({
            user: targetUser,
            links,
        }, { status: 200 });
    } catch (error) {
        console.log("Error is", error)
        return NextResponse.json({ error: "Failed to retrieve user information" }, { status: 500 });
    }
}

// DELETE - Delete user account and all related links
export async function DELETE(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    if (!user || !user.email) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbUser = await UserModel.findOne({ email: user.email });

    if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        // Delete all links associated with the user
        await Link.deleteMany({ userId: dbUser._id });

        // Delete the user account
        await UserModel.findByIdAndDelete(dbUser._id);

        return NextResponse.json({ message: "User account deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user account" }, { status: 500 });
    }
}