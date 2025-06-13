import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

import prisma from '@/lib/prisma';

import { EmailService } from '../email/email.core';
import { emailTemplate } from '../email/email.template';

const rawPrisma = new PrismaClient();

export class ColabService {
  private emailService: EmailService;
  private transactionTimeout = 10000;

  constructor() {
    this.emailService = new EmailService();
  }

  private generateColabLink(projectId: string, token: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/colab/${projectId}?token=${token}`;
  }

  private generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }
  public async inviteCollaborator(projectId: string, emailsString: string[], senderName: string) {
    const project = await rawPrisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const expiresAt = addDays(new Date(), 7);
    const results = [];
    const failedEmails: Record<string, string> = {};
    const successEmails: Record<string, string> = {};
    // const emails = emailsString.split(",").map((email) => email.trim());
    await rawPrisma.$transaction(
      async (tx) => {
        for (const email of emailsString) {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            failedEmails[email] = 'Invalid email';
            continue;
          }

          const token = this.generateToken();
          const colabLink = this.generateColabLink(projectId, token);
          const user = await tx.user.findFirst({
            where: { email },
          });

          let contributorUserId = project.userId;
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
              status: 'pending',
            },
          });
          results.push(contributor);
          successEmails[email] = 'Invite sent';
        }
      },
      {
        timeout: this.transactionTimeout, // 10 second timeout
      },
    );

    for (const contributor of results) {
      try {
        console.log('Sending email to', contributor.email);
        await this.emailService.sendEmail(
          contributor.email,
          `You've been invited to collaborate on ${project.name}`,
          emailTemplate(project.name, contributor.colabLink, senderName),
        );
        successEmails[contributor.email] = 'Invite sent';
      } catch (error) {
        console.error(`Error sending email to ${contributor.email}:`, error);
        failedEmails[contributor.email] = 'Error sending email';
      }
    }
    return {
      success: true,
      contributors: results,
      failedEmails: failedEmails,
      successEmails: successEmails,
    };
  }

  public async verifyColabLink(projectId: string, token: string) {
    const project = await rawPrisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new Error('Project not found');
    }

    const contributor = await rawPrisma.contributorToProject.findFirst({
      where: {
        projectId,
        colabLink: { contains: token } as any,
        expiresAt: { gte: new Date() },
      },
    });

    if (!contributor) {
      throw new Error('Invalid or expired collaboration link');
    }

    return {
      success: true,
      contributor,
      project,
    };
  }

  public async activateCollaborator(contributorId: string, userId: string) {
    const contributor = await rawPrisma.contributorToProject.findUnique({
      where: { id: contributorId },
    });

    if (!contributor) {
      throw new Error('Contributor not found');
    }

    await rawPrisma.contributorToProject.update({
      where: { id: contributorId },
      data: {
        userId,
        status: 'active',
      } as any, // Type assertion to bypass schema validation for now
    });

    return {
      success: true,
    };
  }

  public async getContributors(projectId: string) {
    const contributors = await rawPrisma.contributorToProject.findMany({
      where: { projectId },
    });

    return {
      success: true,
      contributors,
    };
  }
}
