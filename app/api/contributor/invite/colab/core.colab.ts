import prisma from "@/lib/prisma";
import { addDays } from "date-fns";
import { emailTemplate } from "../email/email.template";
import { PrismaClient } from "@prisma/client";

// Get a raw PrismaClient for operations where Accelerate is causing type issues
const rawPrisma = new PrismaClient();

// Temporary workaround for email service while setting up environment
class MockEmailService {
    async sendEmail(to: string, subject: string, html: string): Promise<any> {
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
        // Log first 100 chars of HTML to verify template is being used
        console.log(`HTML content (truncated): ${html.substring(0, 100)}...`);
        return Promise.resolve({ messageId: 'mock-id-' + Date.now() });
    }
}

export class ColabService {
    private emailService: MockEmailService;

    constructor() {
        this.emailService = new MockEmailService();
    }

    private generateColabLink(projectId: string, token: string) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/colab/${projectId}?token=${token}`;
    }

    private generateToken(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    public async inviteCollaborator(projectId: string, email: string, senderName: string) {
        const project = await rawPrisma.project.findUnique({
            where: { id: projectId },
            include: {
                user: true
            }
        });

        if (!project) {
            throw new Error("Project not found");
        }

        // Generate unique token for the link
        const token = this.generateToken();

        // Set expiration date (7 days from now)
        const expiresAt = addDays(new Date(), 7);

        // Create the colab link
        const colabLink = this.generateColabLink(projectId, token);

        // Check if there's a user with this email
        const user = await rawPrisma.user.findFirst({
            where: { email }
        });

        let contributorUserId = project.userId; // Default to project owner

        if (user) {
            contributorUserId = user.id;
        }

        try {
            // Create contributor record
            const contributor = await rawPrisma.contributorToProject.create({
                data: {
                    projectId,
                    userId: contributorUserId,
                    email,
                    colabLink,
                    expiresAt,
                    status: "pending"
                } as any // Type assertion to bypass schema validation for now
            });

            await this.emailService.sendEmail(
                email,
                `You've been invited to collaborate on ${project.name}`,
                emailTemplate(project.name, colabLink, senderName)
            );

            return {
                success: true,
                contributor
            };
        } catch (error) {
            console.error("Error creating collaborator:", error);
            throw new Error("Failed to create collaborator");
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