// Local Storage Service - Deprecated
// This service is no longer used as the application now connects to real APIs
// Keeping this file for backward compatibility during migration

export interface LocalStorageData {
  quotations: any[];
  clients: any[];
  services: any[];
  appointments: any[];
  emails: any[];
  categories: any[];
}

const STORAGE_KEY = 'portal_services_data';

class LocalStorageService {
  /**
   * Clear all localStorage data to force using real APIs
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared all localStorage data - now using real APIs');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if localStorage has any data (for migration purposes)
   */
  hasData(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get data for migration purposes only
   */
  getData(): LocalStorageData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return null;
    }
  }

  /**
   * Get storage statistics for legacy data
   */
  getStats(): { totalItems: number; categories: string[]; size: string } {
    try {
      const data = this.getData();
      if (!data) {
        return { totalItems: 0, categories: [], size: '0 KB' };
      }

      const totalItems = Object.values(data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
      const categories = Object.keys(data);
      const sizeInBytes = JSON.stringify(data).length;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      return {
        totalItems,
        categories,
        size: `${sizeInKB} KB`
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { totalItems: 0, categories: [], size: '0 KB' };
    }
  }

  /**
   * Export all data for backup
   */
  exportData(): LocalStorageData | null {
    console.warn('LocalStorage export is deprecated. Use real API for data management.');
    return this.getData();
  }

  /**
   * Import data from backup (deprecated)
   */
  importData(data: LocalStorageData): void {
    console.warn('LocalStorage import is deprecated. Please use real API for data import.');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Legacy data imported to localStorage');
    } catch (error) {
      console.error('Error importing data to localStorage:', error);
      throw new Error('Failed to import data');
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;