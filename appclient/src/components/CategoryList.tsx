// =====================================================
// Portal Services - Category List Component
// =====================================================

import React, { useState, useEffect } from 'react';
import { Category } from '../types/entities';

interface CategoryListProps {
  onCategorySelect?: (category: Category) => void;
  showActions?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect, 
  showActions = false 
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/categories/active');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error || 'Erro ao carregar categorias');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando categorias...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro ao carregar categorias</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchCategories}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Categorias de Serviços</h2>
        <span className="text-sm text-gray-500">{categories.length} categorias</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`
              bg-white rounded-lg border border-gray-200 p-4 cursor-pointer
              hover:shadow-md transition-shadow duration-200
              ${onCategorySelect ? 'hover:border-blue-300' : ''}
            `}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-500 truncate">
                    {category.description}
                  </p>
                )}
              </div>
              {category.icon && (
                <div className="flex-shrink-0">
                  <span className="text-lg">{category.icon}</span>
                </div>
              )}
            </div>
            
            {showActions && (
              <div className="mt-3 flex justify-end space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implementar edição
                    console.log('Edit category:', category.id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implementar exclusão
                    console.log('Delete category:', category.id);
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando uma nova categoria de serviço.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
