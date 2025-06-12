import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

// interface Comment {
//     id: string;
//     userId: string;
//     projectId: string;
//     comment: string;
//     key: string;
//     repo: string;
// }

// export async function POST(request: Request) {
//     try {
//         const session = await getServerSession(authOptions);
//         // console.log(session);
//         if (!session?.accessToken) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         const body: Comment = await request.json();
//         const { comment, key, repo } = body;

//         const res = await prisma.comment.create({
//             data: {
//                 userId: session.user.id,
//                 projectId: body.projectId,
//                 comment: body.comment,
//             }
//         })

//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }
