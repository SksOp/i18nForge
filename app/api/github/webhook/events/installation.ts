import { PrismaClient } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
const prisma = new PrismaClient();

interface InstallationPayload {
  action: "created" | "deleted";
  installation: {
    id: number;
    type: "User" | "Organization";
  };
  sender: {
    login: string; // username
    id: number;
  };
}

export const installation = (payload: InstallationPayload) => {
  if (payload.action === "created") {
    handleActionCreated(payload);
  } else if (payload.action === "deleted") {
    handleActionDeleted(payload);
  }
};

const handleActionCreated = async (payload: InstallationPayload) => {
  const username = payload.sender.login;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.installation.create({
      data: {
        userId: user.id,
        installationId: payload.installation.id.toString(),
        type: payload.installation.type,
        payload: payload as unknown as InputJsonValue,
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
  const prisma = new PrismaClient();

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
