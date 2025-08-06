import { NextResponse } from "next/server";
import LinkModel, { ILink } from "../../../model/Link"; // Adjust the import path as necessary
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import UserModel from "@/model/User";
import dbConnect from "@/lib/db";

export async function GET(request: Request) {
    await dbConnect();
    
    try {
        
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        // Find the link by slug
        const link = await LinkModel.findOne({ slug });

        if (!link) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        if(link.viewType === 'public'){
            return NextResponse.json(link)
        } 

        const session = await getServerSession(authOptions);
        const user = session?.user;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dbUser = await UserModel.findOne({ email: user?.email });

        if (!dbUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (link.viewType === 'private' && link.userId == dbUser._id.toString()){
            return NextResponse.json(link);
        }

        return NextResponse.json({error: "This Link is Private."}, {status: 401 })

    

    } catch (error) {
        console.error("ERROR in GET /api/links", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();

    // Ensure the user is authenticated
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await UserModel.findOne({ email: user?.email });

    if (!dbUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { urls,title, slug, description, viewType } = body;

        if (!urls || !slug) {
            return NextResponse.json({ error: "URLs and slug are required" }, { status: 400 });
        }

        // Create a new link
        const newLink = new LinkModel({
            urls,
            slug,
            title,
            userId: dbUser._id,
            viewType,
            description: description || "",
        });

        await newLink.save();

        return NextResponse.json(newLink, { status: 201 });

    } catch (error) {
        console.error("ERROR in POST /api/links", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    await dbConnect();

    // Ensure the user is authenticated
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await UserModel.findOne({ email: user?.email });

    if (!dbUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug } = body;

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        // Find and delete the link by slug
        const deletedLink = await LinkModel.findOneAndDelete({ slug , userId: dbUser._id });

        if (!deletedLink) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Link deleted successfully" });

    } catch (error) {
        console.error("ERROR in DELETE /api/links", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    // Ensure the user is authenticated
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await UserModel.findOne({ email: user?.email });

    if (!dbUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug, urls, description, viewType } = body;

        if (!slug || !urls) {
            return NextResponse.json({ error: "Slug and URLs are required" }, { status: 400 });
        }

        // Find the link by slug and update it
        const updatedLink = await LinkModel.findOneAndUpdate(
            { slug, userId: dbUser._id },
            { urls, description, viewType },
            { new: true }
        );

        if (!updatedLink) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        return NextResponse.json(updatedLink);

    } catch (error) {
        console.error("ERROR in PUT /api/links", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}