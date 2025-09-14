import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  CheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { serviceAPI, categoryAPI } from '../services/api';
import { Service, Category } from '../types/api';
import EmptyState from '../components/EmptyState';

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  estimatedTime: number;
  materials: string[];
  active: boolean;
}

const Services: React.FC = () => {
  const { currentTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [materialsInput, setMaterialsInput] = useState('');
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: '',
    price: 0,
    unit: 'hora',
    estimatedTime: 1,
    materials: [],
    active: true
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: servicesResponse, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', selectedCategory],
    queryFn: () => serviceAPI.getServices(),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategories(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: serviceAPI.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Service>) =>
      serviceAPI.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: serviceAPI.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const servicesAll = servicesResponse?.data || [];
  const services = selectedCategory 
    ? servicesAll.filter((s: Service) => s.category === selectedCategory)
    : servicesAll;
  const categories: Category[] = categoriesResponse?.data || [];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      unit: 'hora',
      estimatedTime: 1,
      materials: [],
      active: true
    });
    setMaterialsInput('');
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        price: parseFloat(service.price),
        unit: service.unit,
        estimatedTime: parseInt(service.estimated_time),
        materials: service.materials || [],
        active: service.active
      });
      setMaterialsInput((service.materials || []).join(', '));
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const materials = materialsInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const serviceData = {
      ...formData,
      price: formData.price.toString(),
      materials
    };

    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        ...serviceData
      });
    } else {
      createMutation.mutate(serviceData as any);
    }
  };

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(serviceId as any);
    }
  };

  const getCategoryInfo = (categoryId: string): Category | undefined => {
    return categories.find((cat: Category) => cat.id.toString() === categoryId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 
            className="text-2xl font-bold transition-colors duration-300"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Services
          </h1>
          <p 
            className="mt-1 text-sm transition-colors duration-300"
            style={{ color: currentTheme.colors.text.muted }}
          >
            Configure the services you offer
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-all duration-200"
          style={{ backgroundColor: currentTheme.colors.primary[600] }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Service
        </button>
      </div>

      {/* Category Filter */}
      <div 
        className={`rounded-lg shadow-sm p-4 transition-all duration-300 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
        }`}
        style={{ backgroundColor: currentTheme.colors.background.card }}
      >
        <div className="flex items-center space-x-4">
          <label 
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Filter by category:
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md transition-all duration-300"
            style={{
              backgroundColor: currentTheme.colors.background.primary,
              color: currentTheme.colors.text.primary,
              borderColor: currentTheme.colors.border.primary
            }}
          >
            <option value="">All categories</option>
            {categories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div 
        className={`shadow-sm rounded-lg overflow-hidden transition-all duration-300 ${
          currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
        }`}
        style={{ backgroundColor: currentTheme.colors.background.card }}
      >
        <div className="px-4 py-5 sm:p-6">
          {services.length === 0 ? (
            <EmptyState
              title="No services yet"
              description="Start building your service catalog to offer professional quotes to your clients."
              actionLabel="New Service"
              onAction={() => handleOpenModal()}
              icon="plus"
              
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => {
                const categoryInfo = getCategoryInfo(service.category);
                return (
                  <div
                    key={service.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
                      currentTheme.type === 'purple' ? 'darkone-glass' : ''
                    }`}
                    style={{
                      backgroundColor: currentTheme.colors.background.primary,
                      borderColor: service.active 
                        ? currentTheme.colors.border.primary 
                        : currentTheme.colors.border.secondary
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <WrenchScrewdriverIcon 
                            className="h-5 w-5 mr-2 transition-colors duration-300"
                            style={{ color: currentTheme.colors.text.muted }}
                          />
                          <h3 
                            className="text-sm font-medium truncate transition-colors duration-300"
                            style={{ 
                              color: service.active 
                                ? currentTheme.colors.text.primary 
                                : currentTheme.colors.text.muted 
                            }}
                          >
                            {service.name}
                          </h3>
                        </div>
                        
                        {categoryInfo && (
                          <div className="flex items-center mt-2">
                            <TagIcon className="h-3 w-3 mr-1" style={{ color: categoryInfo.color }} />
                            <span
                              className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${categoryInfo.color}20`,
                                color: categoryInfo.color
                              }}
                            >
                              {categoryInfo.name}
                            </span>
                          </div>
                        )}
                        
                        <p 
                          className="mt-2 text-xs line-clamp-2 transition-colors duration-300"
                          style={{ 
                            color: service.active 
                              ? currentTheme.colors.text.secondary 
                              : currentTheme.colors.text.muted 
                          }}
                        >
                          {service.description}
                        </p>
                        
                        <div 
                          className="mt-3 text-sm transition-colors duration-300"
                          style={{ 
                            color: service.active 
                              ? currentTheme.colors.text.secondary 
                              : currentTheme.colors.text.muted 
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {formatPrice(parseFloat(service.price))}
                            </span>
                            <span className="text-xs">
                              per {service.unit}
                            </span>
                          </div>
                          <div className="text-xs mt-1">
                            Duration: {service.estimated_time}h
                          </div>
                        </div>
                        
                        {!service.active && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                              Inactive
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => handleOpenModal(service)}
                          className={`p-1 transition-colors duration-200 ${
                            currentTheme.type === 'purple' ? 'darkone-hover-primary' : 'hover:text-primary-600'
                          }`}
                          style={{ 
                            color: currentTheme.colors.text.muted
                          }}
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className={`p-1 transition-colors duration-200 ${
                            currentTheme.type === 'purple' ? 'darkone-hover-red' : 'hover:text-red-600'
                          }`}
                          style={{ 
                            color: currentTheme.colors.text.muted
                          }}
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div 
              className={`inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 ${
                currentTheme.type === 'purple' ? 'darkone-card' : 'bg-white'
              }`}
              style={{ backgroundColor: currentTheme.colors.background.card }}
            >
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-4">
                  <h3 
                    className="text-lg font-medium transition-colors duration-300"
                    style={{ color: currentTheme.colors.text.primary }}
                  >
                    {editingService ? 'Edit Service' : 'New Service'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`transition-colors duration-200 ${
                      currentTheme.type === 'purple' ? 'darkone-hover-white' : 'hover:text-gray-600'
                    }`}
                    style={{ 
                      color: currentTheme.colors.text.muted
                    }}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Service Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Ex: Outlet Installation"
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Description
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Describe the service offered..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        Category
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category: Category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        Default Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                                        value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        Unit
                      </label>
                      <select
                        required
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      >
                        <option value="hora">per Hour</option>
                        <option value="dia">per Day</option>
                        <option value="metro">per Meter</option>
                        <option value="metro2">per Square Meter</option>
                        <option value="unidade">per Unit</option>
                        <option value="projeto">per Project</option>
                      </select>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-1 transition-colors duration-300"
                        style={{ color: currentTheme.colors.text.primary }}
                      >
                        Estimated Duration (hours)
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                                        value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: parseFloat(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        style={{
                          backgroundColor: currentTheme.colors.background.primary,
                          color: currentTheme.colors.text.primary,
                          borderColor: currentTheme.colors.border.primary
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label 
                      className="block text-sm font-medium mb-1 transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Required Materials
                    </label>
                    <input
                      type="text"
                      value={materialsInput}
                      onChange={(e) => setMaterialsInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.colors.background.primary,
                        color: currentTheme.colors.text.primary,
                        borderColor: currentTheme.colors.border.primary
                      }}
                      placeholder="Ex: Outlets, Wires, Covers (separate by comma)"
                    />
                    <p 
                      className="mt-1 text-xs transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.muted }}
                    >
                      List materials separated by comma
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                                      id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label 
                                              htmlFor="active"
                      className="ml-2 block text-sm transition-colors duration-300"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      Active service
                    </label>
                  </div>
                </div>

                <div 
                  className="flex justify-end space-x-3 mt-6 pt-4 border-t transition-all duration-300"
                  style={{ borderColor: currentTheme.colors.border.primary }}
                >
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
                    style={{
                      backgroundColor: currentTheme.colors.background.primary,
                      color: currentTheme.colors.text.primary,
                      borderColor: currentTheme.colors.border.primary,
                      border: '1px solid'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-all duration-200"
                    style={{ backgroundColor: currentTheme.colors.primary[600] }}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        {editingService ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;