import dbConnect from "@/lib/db";
import UserModel from "@/model/User";
import {z} from 'zod';

export async function GET(request: Request)
{
    await dbConnect()
    try {
        
        const {searchParams} = new URL(request.url)

        const queryParams = {
            username: searchParams.get('username')
        }
        const result = z.object({
            username: z.string().min(2).max(100)
        }).safeParse(queryParams)

        if(!result.success){
            const usernameError = result.error.message
            return Response.json({
                success: false,
                message: usernameError
            },{
                status: 400
            })
        }

        const {username} = result.data
        const existingUser = await UserModel.findOne({
            username,
        })

        if(existingUser){
            return Response.json({
                success: false,
                message: "Username already exists"
            },{
                status: 400
            })
        }

        return Response.json({
            success: true,
            message: "Username is unique"
        },{
            status: 200
        })

    } catch (error) {
        console.error("ERROR in check-username-unique GET", error)
        return Response.json({
            success: false,
            message: "Internal server error"
        },{
            status: 500
        })
        
    }
}