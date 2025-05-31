import prisma from "@/lib/prisma";
import { addDays } from "date-fns";
import { emailTemplate } from "../email/email.template";
import { PrismaClient } from "@prisma/client";
import { EmailService } from "../email/email.core";

const rawPrisma = new PrismaClient();

export class ColabService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    private generateColabLink(projectId: string, token: string) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/colab/${projectId}?token=${token}`;
    }

    private generateToken(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    public async inviteCollaborator(projectId: string, email: string, senderName: string) {
        try {
            const project = await rawPrisma.project.findUnique({
                where: { id: projectId },
                include: {
                    user: true
                }
            });

            if (!project) {
                throw new Error("Project not found");
            }

            const token = this.generateToken();
            const expiresAt = addDays(new Date(), 7);
            const colabLink = this.generateColabLink(projectId, token);

            const emailArray = email.split(',').map(e => e.trim());

            const result = await rawPrisma.$transaction(async (tx) => {
                try {
                    const user = await tx.user.findFirst({
                        where: { email }
                    });

                    let contributorUserId = project.userId; // Default to project owner
                    if (user) {
                        contributorUserId = user.id;
                    }

                    const contributor = await tx.contributorToProject.create({
                        data: {
                            projectId,
                            userId: contributorUserId,
                            email,
                            colabLink,
                            expiresAt,
                            status: "pending"
                        }
                    });

                    try {
                        await this.emailService.sendEmail(
                            email,
                            `You've been invited to collaborate on ${project.name}`,
                            emailTemplate(project.name, colabLink, senderName)
                        );
                    } catch (error) {
                        console.error("Error sending email:", error);
                        throw new Error("Failed to send invitation email");
                    }

                    return contributor;

                } catch (error) {
                    console.error("Transaction error:", error);
                    throw new Error("Failed to create collaboration invitation");
                }
            });

            return {
                success: true,
                contributor: result
            };

        } catch (error: any) {
            console.error("inviteCollaborator error:", error);
            throw new Error(error.message || "Failed to invite collaborator");
        }
    }


    public async verifyColabLink(projectId: string, token: string) {
        const project = await rawPrisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new Error("Project not found");
        }

        const contributor = await rawPrisma.contributorToProject.findFirst({
            where: {
                projectId,
                colabLink: { contains: token } as any,
                expiresAt: { gte: new Date() }
            }
        });

        if (!contributor) {
            throw new Error("Invalid or expired collaboration link");
        }

        return {
            success: true,
            contributor,
            project
        };
    }

    public async activateCollaborator(contributorId: string, userId: string) {
        const contributor = await rawPrisma.contributorToProject.findUnique({
            where: { id: contributorId }
        });

        if (!contributor) {
            throw new Error("Contributor not found");
        }

        await rawPrisma.contributorToProject.update({
            where: { id: contributorId },
            data: {
                userId,
                status: "active"
            } as any // Type assertion to bypass schema validation for now
        });

        return {
            success: true
        };
    }
}