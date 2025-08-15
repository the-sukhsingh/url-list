import dbConnect from "@/lib/db";
import LinkModel from "@/model/Link";

export async function GET(request: Request) {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const slug = searchParams.get('slug');
    console.log(key)
    if (!key || !slug) {
        return new Response('Unauthorized', { status: 401 });
    }

    const link = await LinkModel.findOne({ slug });

    if (!link) {
        return new Response('Unauthorized', { status: 401 });
    }

    return new Response(JSON.stringify(link), { status: 200 });

}