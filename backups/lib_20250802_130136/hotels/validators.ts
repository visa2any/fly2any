/**
 * Validadores para dados de hotéis
 * Usando Zod para validação robusta
 */

import { z } from 'zod';
import type { ValidationResult, FormValidation, HotelSearchFormState, GuestInfo } from '../../types/hotels';

// ============ SCHEMAS BASE ============

const dateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  z.date()
]).transform(val => typeof val === 'string' ? new Date(val) : val);

const emailSchema = z.string().email('Email inválido');
const phoneSchema = z.string().regex(/^[\d\s\+\-\(\)]{8,20}$/, 'Telefone inválido');

// ============ VALIDAÇÃO DE BUSCA ============

const guestRoomSchema = z.object({
  adults: z.number().min(1, 'Pelo menos 1 adulto por quarto').max(8, 'Máximo 8 adultos por quarto'),
  children: z.array(z.number().min(0).max(17)).max(4, 'Máximo 4 crianças por quarto').optional().default([])
});

const searchFormSchema = z.object({
  destination: z.string().min(2, 'Destino deve ter pelo menos 2 caracteres').max(100, 'Destino muito longo'),
  destinationType: z.enum(['city', 'hotel', 'coordinates']),
  destinationCode: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional(),
  checkin: dateSchema,
  checkout: dateSchema,
  rooms: z.array(guestRoomSchema).min(1, 'Pelo menos 1 quarto').max(5, 'Máximo 5 quartos'),
  preferences: z.object({
    currency: z.string().length(3).optional(),
    language: z.string().length(2).optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0)
    }).optional(),
    starRating: z.array(z.number().min(1).max(5)).optional(),
    amenities: z.array(z.string()).optional()
  }).optional()
}).refine(data => {
  // Validar que checkout é depois de checkin
  return data.checkout > data.checkin;
}, {
  message: 'Data de checkout deve ser posterior ao checkin',
  path: ['checkout']
}).refine(data => {
  // Validar que checkin não é no passado
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return data.checkin >= today;
}, {
  message: 'Data de checkin não pode ser no passado',
  path: ['checkin']
}).refine(data => {
  // Validar período máximo de 30 dias
  const diffTime = data.checkout.getTime() - data.checkin.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}, {
  message: 'Período máximo de estadia é 30 dias',
  path: ['checkout']
});

// ============ VALIDAÇÃO DE HÓSPEDE ============

const guestInfoSchema = z.object({
  title: z.enum(['mr', 'mrs', 'ms', 'miss', 'dr'], {
    message: 'Título inválido'
  }),
  first_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  last_name: z.string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Sobrenome deve conter apenas letras'),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  nationality: z.string().length(2, 'Código de nacionalidade deve ter 2 caracteres').optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida').optional(),
  passport: z.object({
    number: z.string().min(5, 'Número do passaporte muito curto').max(20, 'Número do passaporte muito longo'),
    expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de expiração inválida'),
    country: z.string().length(2, 'Código do país deve ter 2 caracteres')
  }).optional()
}).refine(data => {
  // Validar idade se data de nascimento for fornecida
  if (data.date_of_birth) {
    const birth = new Date(data.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    
    return age >= 0 && age <= 120;
  }
  return true;
}, {
  message: 'Data de nascimento inválida',
  path: ['date_of_birth']
}).refine(data => {
  // Validar expiração do passaporte se fornecido
  if (data.passport?.expiry_date) {
    const expiry = new Date(data.passport.expiry_date);
    const today = new Date();
    
    return expiry > today;
  }
  return true;
}, {
  message: 'Passaporte expirado',
  path: ['passport', 'expiry_date']
});

// ============ VALIDAÇÃO DE PAGAMENTO ============

const paymentSchema = z.object({
  method: z.enum(['credit_card', 'bank_transfer', 'pay_later']),
  card: z.object({
    number: z.string().regex(/^\d{12,19}$/, 'Número do cartão inválido'),
    expiry_month: z.number().min(1).max(12),
    expiry_year: z.number().min(new Date().getFullYear()),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV inválido'),
    holder_name: z.string().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome do portador inválido')
  }).optional()
}).refine(data => {
  // Cartão obrigatório para pagamento com cartão
  if (data.method === 'credit_card') {
    return !!data.card;
  }
  return true;
}, {
  message: 'Dados do cartão são obrigatórios',
  path: ['card']
}).refine(data => {
  // Validar expiração do cartão
  if (data.card) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (data.card.expiry_year === currentYear) {
      return data.card.expiry_month >= currentMonth;
    }
    return data.card.expiry_year > currentYear;
  }
  return true;
}, {
  message: 'Cartão expirado',
  path: ['card', 'expiry_month']
});

// ============ FUNÇÕES DE VALIDAÇÃO ============

/**
 * Validar destino
 */
export const validateDestination = (value: string): ValidationResult => {
  try {
    z.string().min(2).max(100).parse(value);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(err => ({
          field: 'destination',
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'destination', message: 'Erro de validação', code: 'unknown' }]
    };
  }
};

/**
 * Validar datas
 */
export const validateDates = (checkin: Date, checkout: Date): ValidationResult => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Checkin não pode ser no passado
    if (checkin < today) {
      return {
        isValid: false,
        errors: [{ field: 'checkin', message: 'Data de check-in não pode ser no passado', code: 'past_date' }]
      };
    }
    
    // Checkout deve ser depois de checkin
    if (checkout <= checkin) {
      return {
        isValid: false,
        errors: [{ field: 'checkout', message: 'Data de check-out deve ser posterior ao check-in', code: 'invalid_range' }]
      };
    }
    
    // Período máximo de 30 dias
    const diffTime = checkout.getTime() - checkin.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return {
        isValid: false,
        errors: [{ field: 'checkout', message: 'Período máximo de estadia é 30 dias', code: 'max_duration' }]
      };
    }
    
    return { isValid: true, errors: [] };
  } catch (error) {
    return {
      isValid: false,
      errors: [{ field: 'dates', message: 'Erro ao validar datas', code: 'validation_error' }]
    };
  }
};

/**
 * Validar configuração de quartos e hóspedes
 */
export const validateGuests = (rooms: Array<{ adults: number; children: number[] }>): ValidationResult => {
  try {
    z.array(guestRoomSchema).min(1).max(5).parse(rooms);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(err => ({
          field: 'guests',
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'guests', message: 'Erro de validação dos hóspedes', code: 'unknown' }]
    };
  }
};

/**
 * Validar informações do hóspede
 */
export const validateGuestInfo = (guest: GuestInfo): ValidationResult => {
  try {
    guestInfoSchema.parse(guest);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'guest', message: 'Erro de validação do hóspede', code: 'unknown' }]
    };
  }
};

/**
 * Validar dados de pagamento
 */
export const validatePayment = (payment: any): ValidationResult => {
  try {
    paymentSchema.parse(payment);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'payment', message: 'Erro de validação do pagamento', code: 'unknown' }]
    };
  }
};

/**
 * Validar formulário completo de busca
 */
export const validateSearchForm = (data: HotelSearchFormState): ValidationResult => {
  try {
    searchFormSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
    return {
      isValid: false,
      errors: [{ field: 'form', message: 'Erro de validação do formulário', code: 'unknown' }]
    };
  }
};

/**
 * Validar número de cartão de crédito (algoritmo de Luhn)
 */
export const validateCreditCard = (cardNumber: string): ValidationResult => {
  // Remover espaços e hífens
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Verificar se contém apenas números
  if (!/^\d+$/.test(cleanNumber)) {
    return {
      isValid: false,
      errors: [{ field: 'cardNumber', message: 'Número do cartão deve conter apenas dígitos', code: 'invalid_format' }]
    };
  }
  
  // Verificar comprimento
  if (cleanNumber.length < 12 || cleanNumber.length > 19) {
    return {
      isValid: false,
      errors: [{ field: 'cardNumber', message: 'Número do cartão deve ter entre 12 e 19 dígitos', code: 'invalid_length' }]
    };
  }
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const isValid = sum % 10 === 0;
  
  if (!isValid) {
    return {
      isValid: false,
      errors: [{ field: 'cardNumber', message: 'Número do cartão inválido', code: 'invalid_checksum' }]
    };
  }
  
  return { isValid: true, errors: [] };
};

/**
 * Validar telefone brasileiro
 */
export const validateBrazilianPhone = (phone: string): ValidationResult => {
  // Remover caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar comprimento (10 ou 11 dígitos)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
    return {
      isValid: false,
      errors: [{ field: 'phone', message: 'Telefone deve ter 10 ou 11 dígitos', code: 'invalid_length' }]
    };
  }
  
  // Verificar se começa com código de área válido
  const areaCode = cleanPhone.substring(0, 2);
  const validAreaCodes = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];
  
  if (!validAreaCodes.includes(areaCode)) {
    return {
      isValid: false,
      errors: [{ field: 'phone', message: 'Código de área inválido', code: 'invalid_area_code' }]
    };
  }
  
  return { isValid: true, errors: [] };
};

/**
 * Objeto de validação para uso fácil
 */
export const formValidation: FormValidation = {
  destination: validateDestination,
  dates: validateDates,
  guests: validateGuests,
  guestInfo: validateGuestInfo,
  payment: validatePayment
};

/**
 * Schemas exportados para uso direto
 */
export {
  searchFormSchema,
  guestInfoSchema,
  paymentSchema,
  guestRoomSchema,
  dateSchema,
  emailSchema,
  phoneSchema
};