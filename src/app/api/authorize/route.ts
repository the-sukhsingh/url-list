import dbConnect from "@/lib/db";
import LinkModel from "@/model/Link";

export async function GET(request: Request) {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const slug = searchParams.get('slug');
    if (!key || !slug) {
        return new Response('Key and slug are required', { status: 400 });
    }

    const link = await LinkModel.findOne({ slug, keyWord: key });

    if (!link) {
        return new Response('Unauthorized', { status: 401 });
    }

    return new Response(JSON.stringify(link), { status: 200 });

}