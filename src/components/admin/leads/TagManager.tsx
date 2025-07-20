'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Tag, 
  Plus, 
  X, 
  Hash,
  Palette,
  Edit3,
  Search
} from 'lucide-react';

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  category: string;
  description?: string;
  count?: number;
}

interface TagManagerProps {
  tags: LeadTag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onCreateTag: (tag: Omit<LeadTag, 'id' | 'count'>) => void;
  onUpdateTag: (tagId: string, tag: Partial<LeadTag>) => void;
  onDeleteTag: (tagId: string) => void;
  disabled?: boolean;
}

const TAG_COLORS = [
  { name: 'Azul', value: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Verde', value: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Amarelo', value: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { name: 'Vermelho', value: 'bg-red-100 text-red-800 border-red-200' },
  { name: 'Roxo', value: 'bg-purple-100 text-purple-800 border-purple-200' },
  { name: 'Rosa', value: 'bg-pink-100 text-pink-800 border-pink-200' },
  { name: 'Laranja', value: 'bg-orange-100 text-orange-800 border-orange-200' },
  { name: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { name: 'Cinza', value: 'bg-gray-100 text-gray-800 border-gray-200' }
];

const TAG_CATEGORIES = [
  { value: 'source', label: 'Fonte', icon: '📍' },
  { value: 'interest', label: 'Interesse', icon: '🎯' },
  { value: 'budget', label: 'Orçamento', icon: '💰' },
  { value: 'urgency', label: 'Urgência', icon: '⚡' },
  { value: 'service', label: 'Serviço', icon: '🛎️' },
  { value: 'quality', label: 'Qualidade', icon: '⭐' },
  { value: 'custom', label: 'Personalizada', icon: '🏷️' }
];

export function TagManager({
  tags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  disabled = false
}: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<LeadTag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [newTag, setNewTag] = useState({
    name: '',
    color: TAG_COLORS[0].value,
    category: 'custom',
    description: ''
  });

  // Filter tags based on search and category
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleTag = (tagId: string) => {
    if (disabled) return;
    
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    onTagsChange(newSelectedTags);
  };

  const handleCreateTag = () => {
    if (!newTag.name.trim()) return;
    
    onCreateTag({
      name: newTag.name.trim(),
      color: newTag.color,
      category: newTag.category,
      description: newTag.description.trim() || undefined
    });
    
    setNewTag({
      name: '',
      color: TAG_COLORS[0].value,
      category: 'custom',
      description: ''
    });
    setIsCreating(false);
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;
    
    onUpdateTag(editingTag.id, {
      name: editingTag.name,
      color: editingTag.color,
      category: editingTag.category,
      description: editingTag.description
    });
    
    setEditingTag(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = TAG_CATEGORIES.find(c => c.value === category);
    return cat?.icon || '🏷️';
  };

  const getCategoryLabel = (category: string) => {
    const cat = TAG_CATEGORIES.find(c => c.value === category);
    return cat?.label || 'Personalizada';
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {TAG_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setIsCreating(true)}
          disabled={disabled}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Tag
        </Button>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags Selecionadas ({selectedTags.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              if (!tag) return null;
              
              return (
                <Badge
                  key={tagId}
                  className={`${tag.color} cursor-pointer flex items-center gap-1`}
                  onClick={() => handleToggleTag(tagId)}
                >
                  <span>{getCategoryIcon(tag.category)}</span>
                  <span>{tag.name}</span>
                  {!disabled && <X className="h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Tags Disponíveis ({filteredTags.length})
        </Label>
        
        {filteredTags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma tag encontrada</p>
            {searchQuery && (
              <p className="text-xs">Tente ajustar os filtros de busca</p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
            {filteredTags.map((tag) => (
              <div key={tag.id} className="relative group">
                <Badge
                  className={`${tag.color} cursor-pointer flex items-center gap-1 ${
                    selectedTags.includes(tag.id) ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => handleToggleTag(tag.id)}
                >
                  <span>{getCategoryIcon(tag.category)}</span>
                  <span>{tag.name}</span>
                  {tag.count && (
                    <span className="text-xs opacity-75">({tag.count})</span>
                  )}
                </Badge>
                
                {/* Edit/Delete actions */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Editar Tag</h4>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDeleteTag(tag.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input
                              id="edit-name"
                              value={editingTag?.id === tag.id ? editingTag.name : tag.name}
                              onChange={(e) => setEditingTag({
                                ...tag,
                                name: e.target.value
                              })}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-category">Categoria</Label>
                            <Select
                              value={editingTag?.id === tag.id ? editingTag.category : tag.category}
                              onValueChange={(value) => setEditingTag({
                                ...tag,
                                category: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TAG_CATEGORIES.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{category.icon}</span>
                                      <span>{category.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-color">Cor</Label>
                            <Select
                              value={editingTag?.id === tag.id ? editingTag.color : tag.color}
                              onValueChange={(value) => setEditingTag({
                                ...tag,
                                color: value
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TAG_COLORS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${color.value.split(' ')[0]}`} />
                                      <span>{color.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button
                            onClick={handleUpdateTag}
                            disabled={!editingTag || editingTag.id !== tag.id}
                            className="w-full"
                          >
                            Salvar Alterações
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Tag Modal */}
      {isCreating && (
        <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Nova Tag
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-name">Nome da Tag *</Label>
              <Input
                id="new-name"
                placeholder="Ex: Cliente Premium"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="new-category">Categoria</Label>
              <Select
                value={newTag.category}
                onValueChange={(value) => setNewTag({ ...newTag, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="new-color">Cor</Label>
              <Select
                value={newTag.color}
                onValueChange={(value) => setNewTag({ ...newTag, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAG_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color.value.split(' ')[0]}`} />
                        <span>{color.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="new-description">Descrição (opcional)</Label>
              <Input
                id="new-description"
                placeholder="Breve descrição..."
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!newTag.name.trim()}
            >
              <Tag className="h-4 w-4 mr-2" />
              Criar Tag
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}