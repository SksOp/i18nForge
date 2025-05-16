import { NextResponse } from "next/server";
import { AIAPI } from "../Handler/ai.expose";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
/** AI TRANSLATION API */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { key, value, language } = await req.json();
        const result = await AIAPI.translation(key, value, language);
        return NextResponse.json({ result });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}
