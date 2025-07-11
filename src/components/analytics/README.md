# Analytics Dashboard Components

Esta pasta contém todos os componentes relacionados ao dashboard de analytics das campanhas.

## Estrutura

### Componentes Principais
- **DashboardHeader**: Header principal com título e informações de atualização
- **FilterPanel**: Painel de filtros para período e tipo de evento
- **StatsOverview**: Grid de cards com estatísticas principais
- **RecentEvents**: Lista de eventos recentes com detalhes
- **LoadingSpinner**: Componente de loading reutilizável
- **EmptyState**: Estado vazio quando não há dados
- **ErrorState**: Estado de erro com opção de retry

### Componentes Utilitários
- **StatsCard**: Card individual para estatísticas
- **EventIcon**: Ícone baseado no tipo de evento

## Padrões Utilizados

### 1. Separação de Responsabilidades
- Cada componente tem uma única responsabilidade
- Lógica de negócio separada em hooks customizados
- Utilitários isolados em funções puras

### 2. TypeScript
- Interfaces bem definidas para todos os props
- Tipagem forte para dados de analytics
- Props opcionais com valores padrão

### 3. Tailwind CSS
- Classes utilitárias para estilização
- Design system consistente
- Responsividade mobile-first

### 4. Acessibilidade
- Componentes semânticos
- Contraste adequado
- Estados visuais claros

## Uso

```tsx
import { DashboardHeader } from '@/components/analytics/DashboardHeader';
import { FilterPanel } from '@/components/analytics/FilterPanel';
import { StatsOverview } from '@/components/analytics/StatsOverview';

// Exemplo de uso
<DashboardHeader />
<FilterPanel filters={filters} onFiltersChange={setFilters} onRefresh={refetch} />
<StatsOverview stats={stats} />
```

## Manutenção

- Adicione novos componentes seguindo o mesmo padrão
- Mantenha a tipagem TypeScript atualizada
- Documente componentes complexos
- Teste responsividade em diferentes tamanhos