import dbConnect from "@/lib/db"
import UserModel from "@/model/User"

export async function POST(request:Request)
{
    await dbConnect()
    try {
        const {username, email, password} = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
        })

        if(existingUserVerifiedByUsername)
        {
            return Response.json({
                success: false,
                message: "Username already exists"
            },{
                status: 400
            })
        }

        const existingUserByEmail = await UserModel.findOne({
            email
        })
        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "Email already exists"
                },{
                    status: 400
                })
            }
            else{
                await existingUserByEmail.save()
            }
        }
        else{
            const newUser = new UserModel({
              username,
              email,
              password,
            });
            await newUser.save()
        }


        
        return Response.json({
            success: true,
            message: "User Registered Successfully. Please Sign In."
        },{
            status: 201
        })

    } catch (error) {
        console.log(error)
        return Response.json({
            success: false,
            message: "An error occurred while signing up"
        },{
            status: 500
        })
    }
}