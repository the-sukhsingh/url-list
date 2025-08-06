import dbConnect from "@/lib/db";
import LinkModel from "@/model/Link";
import {z} from 'zod';

export async function GET(request: Request)
{
    await dbConnect()
    try {
        
        const {searchParams} = new URL(request.url)

        const queryParams = {
            slug: searchParams.get('slug')
        }
        const result = z.object({
            slug: z.string().min(2).max(100)
        }).safeParse(queryParams)

        if(!result.success){
            const slugError = result.error.message
            return Response.json({
                success: false,
                message: slugError
            },{
                status: 400
            })
        }

        const {slug} = result.data
        const existingLink = await LinkModel.findOne({
            slug: slug
        })

        if(existingLink){
            return Response.json({
                success: false,
                message: "Slug already exists"
            },{
                status: 400
            })
        }

        return Response.json({
            success: true,
            message: "Slug is unique"
        },{
            status: 200
        })

    } catch (error) {
        console.error("ERROR in check-slug-unique GET", error)
        return Response.json({
            success: false,
            message: "Internal server error"
        },{
            status: 500
        })
        
    }
}