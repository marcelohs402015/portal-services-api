import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { categoryAPI } from '../services/api';
import EmptyState from '../components/EmptyState';
import { Category } from '../types/api';

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  active: boolean;
}

const Categories: React.FC = () => {
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#3B82F6',
    active: true
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryAPI.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Category>) =>
      categoryAPI.updateCategory(id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const categories = categoriesResponse?.data || [];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      active: true
    });
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
        active: category.active
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id.toString(),
        ...formData
      } as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(categoryId);
    }
  };

  const handleToggleStatus = (categoryId: string, currentStatus: boolean) => {
    updateMutation.mutate({
      id: categoryId,
      active: !currentStatus
    } as any);
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
          style={{ borderColor: currentTheme.colors.primary[600] }}></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Categories
          </h1>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: currentTheme.colors.text.muted }}
          >
            Manage email categories for organization and filtering
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
          style={{
            backgroundColor: currentTheme.colors.primary[600],
            color: 'white'
          }}
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {categories.map((category) => (
          <div
            key={category.id}
            className={`rounded-lg shadow-sm p-6 transition-all duration-300 ${
              currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
            }`}
            style={{ backgroundColor: currentTheme.colors.background.card }}
          >
            {/* Category Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <h3 
                    className="font-semibold transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    {category.name}
                  </h3>
                  <p 
                    className="text-sm transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.muted }}
                  >
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(category.id.toString(), category.active)}
                  className="p-1 rounded transition-colors duration-200"
                  style={{ color: currentTheme.colors.text.muted }}
                >
                  {category.active ? (
                    <EyeIcon className="h-4 w-4" />
                  ) : (
                    <EyeSlashIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleOpenModal(category)}
                  className="p-1 rounded transition-colors duration-200"
                  style={{ color: currentTheme.colors.text.muted }}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id.toString())}
                  className="p-1 rounded transition-colors duration-200 hover:text-red-500"
                  style={{ color: currentTheme.colors.text.muted }}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category Details */}
            <div className="flex items-center justify-between pt-3 border-t"
                style={{ borderColor: currentTheme.colors.border.primary }}
              >
                <span 
                  className="text-xs transition-colors duration-300"
                  style={{ color: currentTheme.colors.text.muted }}
                >
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {category.active ? 'Active' : 'Inactive'}
                </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <EmptyState
          title="Nenhuma Categoria Cadastrada"
          description="Não há categorias cadastradas para organização de emails. Comece criando sua primeira categoria."
          actionLabel="Nova Categoria"
          onAction={() => handleOpenModal()}
          icon="settings"
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="w-full max-w-2xl mx-4 rounded-lg shadow-xl transition-all duration-300"
            style={{ backgroundColor: currentTheme.colors.background.card }}
          >
            <div className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: currentTheme.colors.border.primary }}
            >
              <h2 
                className="text-lg font-semibold transition-colors duration-300"
                style={{ color: currentTheme.colors.text.primary }}
              >
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 rounded transition-colors duration-200"
                style={{ color: currentTheme.colors.text.muted }}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md transition-all duration-300"
                    style={{
                      backgroundColor: currentTheme.colors.background.primary,
                      color: currentTheme.colors.text.primary,
                      borderColor: currentTheme.colors.border.primary
                    }}
                    placeholder="e.g., complaints"
                    required
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2 transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 border rounded-md transition-all duration-300"
                    style={{ borderColor: currentTheme.colors.border.primary }}
                  />
                </div>
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2 transition-colors duration-300"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                                      Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md transition-all duration-300"
                  style={{
                    backgroundColor: currentTheme.colors.background.primary,
                    color: currentTheme.colors.text.primary,
                    borderColor: currentTheme.colors.border.primary
                  }}
                  placeholder="Describe what this category is for..."
                  required
                />
              </div>


              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded transition-all duration-300"
                  style={{
                    backgroundColor: currentTheme.colors.background.primary,
                    borderColor: currentTheme.colors.border.primary
                  }}
                />
                <label 
                  htmlFor="active"
                  className="ml-2 text-sm transition-colors duration-300"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t"
                style={{ borderColor: currentTheme.colors.border.primary }}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md font-medium transition-all duration-200"
                  style={{
                    backgroundColor: currentTheme.colors.background.primary,
                    color: currentTheme.colors.text.primary,
                    borderColor: currentTheme.colors.border.primary
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md font-medium transition-all duration-200"
                  style={{
                    backgroundColor: currentTheme.colors.primary[600],
                    color: 'white'
                  }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>{editingCategory ? 'Update' : 'Create'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
