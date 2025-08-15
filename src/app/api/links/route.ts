import { NextResponse } from "next/server";
import LinkModel from "../../../model/Link"; // Adjust the import path as necessary
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
        let link = await LinkModel.findOne({ slug });

        if (!link) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        link.keyWord = "No You Cant get it this way..."

        return NextResponse.json(link)

    } catch (error) {
        console.error("ERROR in GET /api/links", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { urls,title, slug, description, keyWord } = body;
        console.log(urls, title, slug, description, keyWord);
        if (!urls || !slug) {
            return NextResponse.json({ error: "URLs and slug are required" }, { status: 400 });
        }

        // Create a new link
        const newLink = new LinkModel({
            urls,
            slug,
            title,
            keyWord,
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

    try {
        const body = await request.json();
        const { slug, keyWord } = body;

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        // Find and delete the link by slug and keyWord
        const deletedLink = await LinkModel.findOneAndDelete({ slug, keyWord });

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
    await dbConnect();

    try {
        const body = await request.json();
        const { slug, urls, description, keyWord, title, key, originalSlug } = body;

        if (!originalSlug || !urls || !key) {
            return NextResponse.json({ error: "Original slug, URLs, and authorization key are required" }, { status: 400 });
        }

        // First verify authorization
        const existingLink = await LinkModel.findOne({ slug: originalSlug, keyWord: key });
        if (!existingLink) {
            return NextResponse.json({ error: "Unauthorized or link not found" }, { status: 401 });
        }

        // Update the link
        const updateData: any = {
            urls,
            description: description || "",
            keyWord,
            title: title || existingLink.title
        };

        // Only update slug if it's different from original
        if (slug && slug !== originalSlug) {
            // Check if new slug is available
            const existingSlugLink = await LinkModel.findOne({ slug });
            if (existingSlugLink) {
                return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
            }
            updateData.slug = slug;
        }

        const updatedLink = await LinkModel.findOneAndUpdate(
            { slug: originalSlug, keyWord: key },
            updateData,
            { new: true }
        );

        if (!updatedLink) {
            return NextResponse.json({ error: "Failed to update link" }, { status: 404 });
        }

        return NextResponse.json(updatedLink);

    } catch (error) {
        console.error("ERROR in PUT /api/links", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}