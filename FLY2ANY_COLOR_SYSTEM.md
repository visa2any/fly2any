# 🎨 FLY2ANY - SISTEMA DE CORES OFICIAL

## 🏷️ CORES EXTRAÍDAS DO LOGO

### **Cores Primárias do Logo:**
```css
/* Baseado na análise do logo fly2any-logo.png */
--fly2any-red: #FF4500        /* Vermelho-laranja do "2" e avião */
--fly2any-amber: #FFB000      /* Amarelo-âmbar do "Any" */
--fly2any-blue: #1E40AF       /* Azul confiança (derivado do contexto) */
--fly2any-gray: #64748B       /* Cinza do "Fly" */
```

### **Cores Complementares:**
```css
/* Tons derivados para harmonia */
--fly2any-red-light: #FF6B35     /* Vermelho mais suave */
--fly2any-red-dark: #D73502      /* Vermelho mais escuro */
--fly2any-amber-light: #FFC947   /* Âmbar mais claro */
--fly2any-amber-dark: #E6A000    /* Âmbar mais escuro */
--fly2any-blue-light: #3B82F6   /* Azul mais claro */
--fly2any-blue-dark: #1D4ED8    /* Azul mais escuro */
```

## 🎯 PALETA PARA PÁGINAS DE HOTÉIS

### **Background System:**
```css
/* Backgrounds principais inspirados no logo */
.bg-fly2any-main {
  background: linear-gradient(135deg, 
    #FFF8F0 0%,     /* Creme suave inspirado no âmbar */
    #F0F9FF 50%,    /* Azul muito claro */
    #FEF3F2 100%    /* Rosa suave inspirado no vermelho */
  );
}

.bg-fly2any-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 180, 0, 0.1); /* Sutil âmbar */
  backdrop-filter: blur(10px);
}
```

### **Cores de Ação (CTAs):**
```css
/* Botão primário - Vermelho-laranja do logo */
.btn-fly2any-primary {
  background: linear-gradient(135deg, #FF4500 0%, #FF6B35 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
}

.btn-fly2any-primary:hover {
  background: linear-gradient(135deg, #D73502 0%, #FF4500 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 69, 0, 0.4);
}

/* Botão secundário - Âmbar do logo */
.btn-fly2any-secondary {
  background: linear-gradient(135deg, #FFB000 0%, #FFC947 100%);
  color: #1F2937;
  border: none;
  box-shadow: 0 4px 12px rgba(255, 176, 0, 0.3);
}
```

### **Cores de Texto:**
```css
/* Hierarquia de texto baseada no logo */
.text-fly2any-primary {
  color: #1F2937;        /* Preto suave para títulos */
}

.text-fly2any-secondary {
  color: #64748B;        /* Cinza do logo para subtítulos */
}

.text-fly2any-accent {
  color: #FF4500;        /* Vermelho-laranja para destaques */
}

.text-fly2any-warm {
  color: #D97706;        /* Tom âmbar escuro para informações importantes */
}
```

### **Estados e Feedback:**
```css
/* Sucesso - Verde que harmoniza com âmbar */
.bg-fly2any-success: #10B981
.text-fly2any-success: #047857

/* Aviso - Âmbar do logo */
.bg-fly2any-warning: #FFB000
.text-fly2any-warning: #92400E

/* Erro - Tom próximo ao vermelho do logo */
.bg-fly2any-danger: #EF4444
.text-fly2any-danger: #B91C1C

/* Info - Azul complementar */  
.bg-fly2any-info: #3B82F6
.text-fly2any-info: #1E40AF
```

## 🏨 APLICAÇÃO ESPECÍFICA PARA HOTÉIS

### **Cards de Hotéis:**
```css
.hotel-card-fly2any {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(255, 180, 0, 0.15);
  border-radius: 16px;
  box-shadow: 
    0 4px 20px rgba(255, 69, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.1);
}

.hotel-card-fly2any:hover {
  border-color: rgba(255, 69, 0, 0.3);
  box-shadow: 
    0 8px 30px rgba(255, 69, 0, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

### **Preços e Ofertas:**
```css
/* Preço destacado - Âmbar do logo */
.price-highlight {
  background: linear-gradient(135deg, #FFB000 0%, #FFC947 100%);
  color: #1F2937;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 176, 0, 0.3);
}

/* Oferta especial - Vermelho-laranja */
.offer-badge {
  background: linear-gradient(135deg, #FF4500 0%, #FF6B35 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### **Hero Section:**
```css
.hero-fly2any {
  background: linear-gradient(135deg,
    rgba(255, 248, 240, 0.9) 0%,   /* Creme âmbar suave */
    rgba(240, 249, 255, 0.9) 50%,  /* Azul muito claro */
    rgba(254, 243, 242, 0.9) 100%  /* Rosa suave */
  );
}

.hero-title-fly2any {
  background: linear-gradient(135deg, #FF4500 0%, #FFB000 50%, #1E40AF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 🎨 CLASSES TAILWIND CUSTOMIZADAS

### **Adicionar ao globals.css:**
```css
@layer utilities {
  /* Fly2Any Brand Colors */
  .bg-fly2any-main {
    background: linear-gradient(135deg, #FFF8F0 0%, #F0F9FF 50%, #FEF3F2 100%);
  }
  
  .bg-fly2any-card {
    @apply bg-white/98 border border-amber-100/50 backdrop-blur-sm;
  }
  
  .btn-fly2any-primary {
    @apply bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-1;
    box-shadow: 0 4px 12px rgba(255, 69, 0, 0.3);
  }
  
  .btn-fly2any-primary:hover {
    box-shadow: 0 6px 20px rgba(255, 69, 0, 0.4);
  }
  
  .btn-fly2any-secondary {
    @apply bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-1;
    box-shadow: 0 4px 12px rgba(255, 176, 0, 0.3);
  }
  
  .text-fly2any-gradient {
    background: linear-gradient(135deg, #FF4500 0%, #FFB000 50%, #1E40AF 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .card-fly2any-hotel {
    @apply bg-white/98 border border-amber-100/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1;
    box-shadow: 0 4px 20px rgba(255, 69, 0, 0.08);
  }
  
  .card-fly2any-hotel:hover {
    box-shadow: 0 8px 30px rgba(255, 69, 0, 0.15);
    border-color: rgba(255, 69, 0, 0.3);
  }
}
```

## 🎯 BENEFÍCIOS DESTA PALETA

1. **✅ Consistência com Brand**: Baseada nas cores oficiais do logo
2. **✅ Harmonia Visual**: Cores complementares que funcionam juntas
3. **✅ Psicologia das Cores**: 
   - Vermelho-laranja = Energia, ação, urgência
   - Âmbar = Otimismo, calor, confiança
   - Azul = Confiabilidade, profissionalismo
4. **✅ Conversão**: Cores quentes incentivam ação de reserva
5. **✅ Diferenciação**: Se destaca de concorrentes com azuis genéricos
6. **✅ Acessibilidade**: Contrastes adequados para legibilidade

## 🚀 PRÓXIMOS PASSOS

1. Implementar as classes no `globals.css`
2. Aplicar na página `/hoteis`  
3. Testar em diferentes dispositivos
4. A/B test para validar conversão
5. Expandir para outras páginas

Esta paleta torna o site **uniquely Fly2Any** e cria uma experiência visual coesa e memorável! ✈️🎨