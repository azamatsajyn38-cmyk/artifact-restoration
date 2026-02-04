import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export interface AnalysisResult {
  type: string;
  period: string;
  culture: string;
  material: string;
  purpose: string;
  dimensions: {
    height: number;
    baseWidth: number;
    topWidth: number;
  };
  shapeProfile: "convex" | "linear" | "concave";
  condition: string;
  restoration: string;
  description: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
  revisedPrompt?: string;
}

export interface ModelGenerationResult {
  taskId: string;
}

export interface ModelStatusResult {
  status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED";
  modelUrls?: {
    glb?: string;
    fbx?: string;
    thumbnail?: string;
  };
  progress?: number;
}
