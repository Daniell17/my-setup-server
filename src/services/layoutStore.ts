import LayoutModel, { ILayout } from "../models/Layout";
import { WorkspaceObject } from "../types";

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
  }): Promise<ILayout> {
    const layout = new LayoutModel({
      name: data.name,
      objects: data.objects || [],
      userId: data.userId,
      isPublic: data.isPublic ?? false,
    });

    return await layout.save();
  }

  // Update an existing layout
  async update(
    id: string,
    updates: {
      name?: string;
      objects?: WorkspaceObject[];
      isPublic?: boolean;
    }
  ): Promise<ILayout | null> {
    try {
      return await LayoutModel.findByIdAndUpdate(id, updates, { new: true });
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
