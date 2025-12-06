import { Layout, WorkspaceObject } from "../types";

// In-memory storage for layouts
// In production, this would be replaced with a database
class LayoutStore {
  private layouts: Map<string, Layout> = new Map();
  private nextId: number = 1;

  // Generate a unique ID
  private generateId(): string {
    return `layout_${Date.now()}_${this.nextId++}`;
  }

  // Get all layouts (optionally filter by userId)
  getAll(userId?: string): Layout[] {
    const allLayouts = Array.from(this.layouts.values());
    if (userId) {
      return allLayouts.filter((layout) => layout.userId === userId);
    }
    return allLayouts;
  }

  // Get a layout by ID
  getById(id: string): Layout | undefined {
    return this.layouts.get(id);
  }

  // Create a new layout
  create(data: {
    name: string;
    objects: WorkspaceObject[];
    userId?: string;
    isPublic?: boolean;
  }): Layout {
    const now = new Date();
    const layout: Layout = {
      id: this.generateId(),
      name: data.name,
      objects: data.objects || [],
      userId: data.userId,
      isPublic: data.isPublic ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.layouts.set(layout.id, layout);
    return layout;
  }

  // Update an existing layout
  update(
    id: string,
    updates: {
      name?: string;
      objects?: WorkspaceObject[];
      isPublic?: boolean;
    }
  ): Layout | null {
    const layout = this.layouts.get(id);
    if (!layout) {
      return null;
    }

    const updated: Layout = {
      ...layout,
      ...updates,
      updatedAt: new Date(),
    };

    this.layouts.set(id, updated);
    return updated;
  }

  // Delete a layout
  delete(id: string): boolean {
    return this.layouts.delete(id);
  }

  // Check if layout exists
  exists(id: string): boolean {
    return this.layouts.has(id);
  }
}

// Export a singleton instance
export const layoutStore = new LayoutStore();

