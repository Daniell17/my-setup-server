import LayoutModel, { ILayout } from "../models/Layout";
import LayoutVersionModel from "../models/LayoutVersion";
import { WorkspaceObject } from "../types";
import type { CanonicalScene } from "../types/scene";

class LayoutStore {
  // Get all layouts (optionally filter by userId)
  async getAll(userId?: string): Promise<ILayout[]> {
    if (userId) {
      return await LayoutModel.find({ userId });
    }
    return await LayoutModel.find({});
  }

  // Get public layouts
  async getPublic(): Promise<ILayout[]> {
    return await LayoutModel.find({ isPublic: true }).sort({ createdAt: -1 });
  }

  // Get a layout by ID
  async getById(id: string): Promise<ILayout | null> {
    try {
      return await LayoutModel.findById(id);
    } catch (error) {
      return null;
    }
  }

  // Create a new layout
  async create(data: {
    name: string;
    objects: WorkspaceObject[];
    userId?: string;
    isPublic?: boolean;
    scene?: CanonicalScene;
    parentLayoutId?: string;
    provenance?: ILayout["provenance"];
  }): Promise<ILayout> {
    const layout = new LayoutModel({
      name: data.name,
      objects: data.objects || [],
      userId: data.userId,
      isPublic: data.isPublic ?? false,
      scene: data.scene,
      parentLayoutId: data.parentLayoutId,
      provenance: data.provenance,
      status: data.isPublic ? "published" : "draft",
    });

    const saved = await layout.save();

    await LayoutVersionModel.create({
      layoutId: saved.id,
      version: saved.version,
      scene: saved.scene,
      objectsSnapshot: saved.objects,
    });

    return saved;
  }

  // Update an existing layout
  async update(
    id: string,
    updates: {
      name?: string;
      objects?: WorkspaceObject[];
      isPublic?: boolean;
      scene?: CanonicalScene;
      provenance?: ILayout["provenance"];
    }
  ): Promise<ILayout | null> {
    try {
      const layout = await LayoutModel.findById(id);
      if (!layout) {
        return null;
      }

      if (typeof updates.name === "string") {
        layout.name = updates.name;
      }

      if (Array.isArray(updates.objects)) {
        layout.objects = updates.objects;
      }

      if (typeof updates.isPublic === "boolean") {
        layout.isPublic = updates.isPublic;
        layout.status = updates.isPublic ? "published" : layout.status;
      }

      if (updates.scene) {
        layout.scene = updates.scene;
      }

      if (updates.provenance) {
        layout.provenance = {
          ...(layout.provenance || {}),
          ...updates.provenance,
        };
      }

      layout.version = (layout.version || 1) + 1;

      const saved = await layout.save();

      await LayoutVersionModel.create({
        layoutId: saved.id,
        version: saved.version,
        scene: saved.scene,
        objectsSnapshot: saved.objects,
      });

      return saved;
    } catch (error) {
      return null;
    }
  }

  // Delete a layout
  async delete(id: string): Promise<boolean> {
    try {
      const result = await LayoutModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  // Check if layout exists
  async exists(id: string): Promise<boolean> {
    try {
      const count = await LayoutModel.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      return false;
    }
  }
}

export const layoutStore = new LayoutStore();
