import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArtifactWorkspace } from "@/components/artifacts/artifact-workspace";

export default async function ArtifactPage({
  params,
}: {
  params: { id: string; artifactId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const artifact = await prisma.artifact.findFirst({
    where: {
      id: params.artifactId,
      project: { id: params.id, userId: session.user.id },
    },
  });

  if (!artifact) notFound();

  return (
    <ArtifactWorkspace
      projectId={params.id}
      artifact={{
        id: artifact.id,
        originalImageUrl: artifact.originalImageUrl,
        analysisResult: artifact.analysisResult,
        restoredImageUrl: artifact.restoredImageUrl,
        meshyStatus: artifact.meshyStatus,
        modelUrls: artifact.modelUrls,
      }}
    />
  );
}
