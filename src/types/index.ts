// Shared types for the API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WorkspaceObject {
  id: string;
  type: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    [key: string]: number | undefined;
  };
  material?: {
    type: string;
    textureUrl?: string;
    color?: string;
  };
  properties?: {
    roughness?: number;
    metalness?: number;
    opacity?: number;
    transparent?: boolean;
  };
  price?: number;
  groupId?: string;
  modelUrl?: string;
}

export interface Layout {
  id: string;
  userId?: string;
  name: string;
  objects: WorkspaceObject[];
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
