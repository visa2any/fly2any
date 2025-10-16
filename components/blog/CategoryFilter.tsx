'use client';

export interface Category {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  language?: 'en' | 'pt' | 'es';
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  language = 'en',
}: CategoryFilterProps) {
  return (
    <div className="w-[90%] mx-auto py-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300
              ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-600 hover:text-blue-600'
              }
            `}
          >
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
