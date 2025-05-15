import prisma from "@/lib/prisma";
import { InputJsonValue } from "@prisma/client/runtime/library";

export interface InstallationPayload {
  action: "created" | "deleted";
  installation: {
    id: number;
    target_type: "User" | "Organization";
    account: {
      id: number;
      login: string;
    };
  };
  sender: {
    login: string;
    id: number;
  };
}

export const installation = async (payload: InstallationPayload) => {
  // console.log("action", payload.action);
  if (payload.action === "created") {
    await handleActionCreated(payload);
  } else if (payload.action === "deleted") {
    await handleActionDeleted(payload);
  }
};

const handleActionCreated = async (payload: InstallationPayload) => {
  try {
    await prisma.installation.create({
      data: {
        installationId: payload.installation.id.toString(),
        type: payload.installation.target_type,
        payload: payload as unknown as InputJsonValue,
        githubId: payload.installation.account.id.toString(),
        githubName: payload.installation.account.login,
      },
    });
  } catch (error) {
    console.error("Error creating installation:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

const handleActionDeleted = async (payload: InstallationPayload) => {
  try {
    await prisma.installation.delete({
      where: {
        installationId: payload.installation.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error deleting installation:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
