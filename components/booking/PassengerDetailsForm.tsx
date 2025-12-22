'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  Shield,
  Heart,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  Upload,
  Trash2,
  Info,
  Users,
  Baby,
  UserCircle,
  MapPin,
  Plane,
  Utensils,
  Accessibility,
  Plus,
  X,
} from 'lucide-react';
import { COUNTRIES } from '@/lib/data/countries';

// Types
interface PassengerProfile {
  id: string;
  profileName: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  email: string;
  phone: string;
  knownTravelerNumber?: string;
  redressNumber?: string;
  frequentFlyerNumber?: string;
  savedAt: number;
}

interface PassengerData extends Omit<PassengerProfile, 'id' | 'profileName' | 'savedAt'> {
  mealPreference?: string;
  specialAssistance?: string[];
  seatPreference?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface PassengerDetailsFormProps {
  numAdults: number;
  numChildren: number;
  numInfants: number;
  onSubmit?: (data: {
    passengers: PassengerData[];
    emergencyContact: EmergencyContact;
  }) => void;
  autoSave?: boolean;
  language?: 'en' | 'pt' | 'es';
}

// Translation data
const translations = {
  en: {
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    passenger: 'Passenger',
    title: 'Title',
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    nationality: 'Nationality',
    passportNumber: 'Passport Number',
    passportIssue: 'Issue Date',
    passportExpiry: 'Expiry Date',
    email: 'Email Address',
    phone: 'Phone Number',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    advancedOptions: 'Advanced Options',
    hideAdvanced: 'Hide Advanced',
    tsaPrecheck: 'TSA PreCheck / Known Traveler Number',
    redressNumber: 'Redress Number',
    frequentFlyer: 'Frequent Flyer Number',
    mealPreference: 'Meal Preference',
    specialAssistance: 'Special Assistance',
    seatPreference: 'Seat Preference',
    emergencyContact: 'Emergency Contact Information',
    contactName: 'Contact Name',
    relationship: 'Relationship',
    saveProfile: 'Save as Traveler Profile',
    loadProfile: 'Load Saved Profile',
    savedProfiles: 'Saved Traveler Profiles',
    deleteProfile: 'Delete Profile',
    autoSaveEnabled: 'Auto-save enabled',
    formSaved: 'Form saved successfully',
    required: 'Required',
    optional: 'Optional',
    validEmail: 'Enter a valid email',
    validPassport: 'Enter a valid passport number',
    validDate: 'Select a valid date',
    passportExpired: 'Passport is expired',
    minAge: 'Must be at least 18 years old',
    maxAge: 'Age seems incorrect',
    submit: 'Continue to Payment',
    profileSaved: 'Profile saved successfully',
    profileLoaded: 'Profile loaded',
    selectCountry: 'Select Country',
    selectMeal: 'Select Meal Preference',
    selectSeat: 'Select Seat Preference',
    wheelchair: 'Wheelchair Assistance',
    visualImpairment: 'Visual Impairment',
    hearingImpairment: 'Hearing Impairment',
    mobilityAssistance: 'Mobility Assistance',
    standard: 'Standard',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten-Free',
    kosher: 'Kosher',
    halal: 'Halal',
    window: 'Window',
    aisle: 'Aisle',
    middle: 'Middle',
    noPreference: 'No Preference',
    tooltipPassport: 'Enter passport number exactly as shown on your passport',
    tooltipTSA: 'Add your TSA PreCheck number for expedited security screening',
    tooltipRedress: 'Add if you have been issued a redress number by DHS TRIP',
    tooltipDOB: 'Must match passport information',
    tooltipNationality: 'Country that issued your passport',
    profileNamePlaceholder: 'e.g., "John Doe Business Travel"',
  },
  pt: {
    adults: 'Adultos',
    children: 'Crianças',
    infants: 'Bebês',
    passenger: 'Passageiro',
    title: 'Título',
    firstName: 'Primeiro Nome',
    middleName: 'Nome do Meio',
    lastName: 'Sobrenome',
    dateOfBirth: 'Data de Nascimento',
    gender: 'Gênero',
    nationality: 'Nacionalidade',
    passportNumber: 'Número do Passaporte',
    passportIssue: 'Data de Emissão',
    passportExpiry: 'Data de Validade',
    email: 'E-mail',
    phone: 'Telefone',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    advancedOptions: 'Opções Avançadas',
    hideAdvanced: 'Ocultar Avançadas',
    tsaPrecheck: 'TSA PreCheck / Número de Viajante Conhecido',
    redressNumber: 'Número de Recurso',
    frequentFlyer: 'Número de Passageiro Frequente',
    mealPreference: 'Preferência de Refeição',
    specialAssistance: 'Assistência Especial',
    seatPreference: 'Preferência de Assento',
    emergencyContact: 'Informações de Contato de Emergência',
    contactName: 'Nome do Contato',
    relationship: 'Relacionamento',
    saveProfile: 'Salvar como Perfil de Viajante',
    loadProfile: 'Carregar Perfil Salvo',
    savedProfiles: 'Perfis de Viajante Salvos',
    deleteProfile: 'Excluir Perfil',
    autoSaveEnabled: 'Salvamento automático ativado',
    formSaved: 'Formulário salvo com sucesso',
    required: 'Obrigatório',
    optional: 'Opcional',
    validEmail: 'Digite um e-mail válido',
    validPassport: 'Digite um número de passaporte válido',
    validDate: 'Selecione uma data válida',
    passportExpired: 'Passaporte expirado',
    minAge: 'Deve ter pelo menos 18 anos',
    maxAge: 'Idade parece incorreta',
    submit: 'Continuar para Pagamento',
    profileSaved: 'Perfil salvo com sucesso',
    profileLoaded: 'Perfil carregado',
    selectCountry: 'Selecionar País',
    selectMeal: 'Selecionar Preferência de Refeição',
    selectSeat: 'Selecionar Preferência de Assento',
    wheelchair: 'Assistência com Cadeira de Rodas',
    visualImpairment: 'Deficiência Visual',
    hearingImpairment: 'Deficiência Auditiva',
    mobilityAssistance: 'Assistência de Mobilidade',
    standard: 'Padrão',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    glutenFree: 'Sem Glúten',
    kosher: 'Kosher',
    halal: 'Halal',
    window: 'Janela',
    aisle: 'Corredor',
    middle: 'Meio',
    noPreference: 'Sem Preferência',
    tooltipPassport: 'Digite o número do passaporte exatamente como aparece no seu passaporte',
    tooltipTSA: 'Adicione seu número TSA PreCheck para triagem de segurança expedita',
    tooltipRedress: 'Adicione se você recebeu um número de recurso do DHS TRIP',
    tooltipDOB: 'Deve corresponder às informações do passaporte',
    tooltipNationality: 'País que emitiu seu passaporte',
    profileNamePlaceholder: 'ex: "João Silva Viagem de Negócios"',
  },
  es: {
    adults: 'Adultos',
    children: 'Niños',
    infants: 'Bebés',
    passenger: 'Pasajero',
    title: 'Título',
    firstName: 'Primer Nombre',
    middleName: 'Segundo Nombre',
    lastName: 'Apellido',
    dateOfBirth: 'Fecha de Nacimiento',
    gender: 'Género',
    nationality: 'Nacionalidad',
    passportNumber: 'Número de Pasaporte',
    passportIssue: 'Fecha de Emisión',
    passportExpiry: 'Fecha de Vencimiento',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
    advancedOptions: 'Opciones Avanzadas',
    hideAdvanced: 'Ocultar Avanzadas',
    tsaPrecheck: 'TSA PreCheck / Número de Viajero Conocido',
    redressNumber: 'Número de Recurso',
    frequentFlyer: 'Número de Viajero Frecuente',
    mealPreference: 'Preferencia de Comida',
    specialAssistance: 'Asistencia Especial',
    seatPreference: 'Preferencia de Asiento',
    emergencyContact: 'Información de Contacto de Emergencia',
    contactName: 'Nombre de Contacto',
    relationship: 'Relación',
    saveProfile: 'Guardar como Perfil de Viajero',
    loadProfile: 'Cargar Perfil Guardado',
    savedProfiles: 'Perfiles de Viajero Guardados',
    deleteProfile: 'Eliminar Perfil',
    autoSaveEnabled: 'Guardado automático activado',
    formSaved: 'Formulario guardado exitosamente',
    required: 'Requerido',
    optional: 'Opcional',
    validEmail: 'Ingrese un correo válido',
    validPassport: 'Ingrese un número de pasaporte válido',
    validDate: 'Seleccione una fecha válida',
    passportExpired: 'Pasaporte vencido',
    minAge: 'Debe tener al menos 18 años',
    maxAge: 'La edad parece incorrecta',
    submit: 'Continuar al Pago',
    profileSaved: 'Perfil guardado exitosamente',
    profileLoaded: 'Perfil cargado',
    selectCountry: 'Seleccionar País',
    selectMeal: 'Seleccionar Preferencia de Comida',
    selectSeat: 'Seleccionar Preferencia de Asiento',
    wheelchair: 'Asistencia con Silla de Ruedas',
    visualImpairment: 'Discapacidad Visual',
    hearingImpairment: 'Discapacidad Auditiva',
    mobilityAssistance: 'Asistencia de Movilidad',
    standard: 'Estándar',
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    glutenFree: 'Sin Gluten',
    kosher: 'Kosher',
    halal: 'Halal',
    window: 'Ventana',
    aisle: 'Pasillo',
    middle: 'Medio',
    noPreference: 'Sin Preferencia',
    tooltipPassport: 'Ingrese el número de pasaporte exactamente como aparece en su pasaporte',
    tooltipTSA: 'Agregue su número TSA PreCheck para control de seguridad expedito',
    tooltipRedress: 'Agregue si le han emitido un número de recurso del DHS TRIP',
    tooltipDOB: 'Debe coincidir con la información del pasaporte',
    tooltipNationality: 'País que emitió su pasaporte',
    profileNamePlaceholder: 'ej: "Juan Pérez Viaje de Negocios"',
  },
};

// Get country names from comprehensive list (195+ countries)
const countries = COUNTRIES.map(c => c.name);

// Tooltip component
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg animate-fadeIn">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Main component
export const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({
  numAdults = 1,
  numChildren = 0,
  numInfants = 0,
  onSubmit,
  autoSave = true,
  language = 'en',
}) => {
  const t = translations[language];

  // State
  const [passengers, setPassengers] = useState<PassengerData[]>([]);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  const [savedProfiles, setSavedProfiles] = useState<PassengerProfile[]>([]);
  const [showProfiles, setShowProfiles] = useState<{ [key: number]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveProfileName, setSaveProfileName] = useState<{ [key: number]: string }>({});

  // Initialize passengers
  useEffect(() => {
    const totalPassengers = numAdults + numChildren + numInfants;
    const initialPassengers: PassengerData[] = [];

    for (let i = 0; i < totalPassengers; i++) {
      initialPassengers.push({
        title: '',
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        passportNumber: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        email: i === 0 ? '' : initialPassengers[0]?.email || '',
        phone: i === 0 ? '' : initialPassengers[0]?.phone || '',
        mealPreference: '',
        specialAssistance: [],
        seatPreference: '',
      });
    }

    setPassengers(initialPassengers);

    // Load saved data from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('passengerData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.passengers && parsed.passengers.length === totalPassengers) {
            setPassengers(parsed.passengers);
          }
          if (parsed.emergencyContact) {
            setEmergencyContact(parsed.emergencyContact);
          }
        } catch (e) {
          console.error('Failed to load saved data:', e);
        }
      }

      // Load saved profiles
      const profiles = localStorage.getItem('passengerProfiles');
      if (profiles) {
        try {
          setSavedProfiles(JSON.parse(profiles));
        } catch (e) {
          console.error('Failed to load profiles:', e);
        }
      }
    }
  }, [numAdults, numChildren, numInfants]);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && passengers.length > 0 && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        localStorage.setItem(
          'passengerData',
          JSON.stringify({ passengers, emergencyContact })
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [passengers, emergencyContact, autoSave]);

  // Update passenger field
  const updatePassenger = useCallback((index: number, field: keyof PassengerData, value: any) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  // Toggle special assistance
  const toggleAssistance = useCallback((index: number, assistance: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      const current = updated[index].specialAssistance || [];
      if (current.includes(assistance)) {
        updated[index].specialAssistance = current.filter((a) => a !== assistance);
      } else {
        updated[index].specialAssistance = [...current, assistance];
      }
      return updated;
    });
  }, []);

  // Import validation functions from our security library
  const {
    validateEmail: validateEmailFn,
    validatePhone: validatePhoneFn,
    validatePassport: validatePassportFn,
    validateDOB: validateDOBFn,
    validatePassengerName: validateNameFn,
  } = require('@/lib/validation');

  // Validation (now using our comprehensive security library)
  const validateEmail = (email: string): boolean => {
    const result = validateEmailFn(email);
    return result.valid;
  };

  const validatePassport = (passport: string): boolean => {
    const result = validatePassportFn(passport);
    return result.valid;
  };

  const validateDate = (date: string): boolean => {
    return date !== '' && !isNaN(new Date(date).getTime());
  };

  const validateAge = (dob: string, type: 'adult' | 'child' | 'infant'): boolean => {
    const result = validateDOBFn(dob, type);
    return result.valid;
  };

  const isPassportExpired = (expiryDate: string): boolean => {
    return validateDate(expiryDate) && new Date(expiryDate) < new Date();
  };

  // Save profile
  const saveProfile = useCallback((index: number) => {
    const passenger = passengers[index];
    const profileName = saveProfileName[index] || `${passenger.firstName} ${passenger.lastName}`;

    if (!profileName.trim()) {
      alert('Please enter a profile name');
      return;
    }

    const profile: PassengerProfile = {
      id: Date.now().toString(),
      profileName,
      ...passenger,
      savedAt: Date.now(),
    };

    const updated = [...savedProfiles, profile];
    setSavedProfiles(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('passengerProfiles', JSON.stringify(updated));
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [passengers, savedProfiles, saveProfileName]);

  // Load profile
  const loadProfile = useCallback((index: number, profile: PassengerProfile) => {
    const { id, profileName, savedAt, ...passengerData } = profile;
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...passengerData };
      return updated;
    });
    setShowProfiles((prev) => ({ ...prev, [index]: false }));
  }, []);

  // Delete profile
  const deleteProfile = useCallback((profileId: string) => {
    const updated = savedProfiles.filter((p) => p.id !== profileId);
    setSavedProfiles(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('passengerProfiles', JSON.stringify(updated));
    }
  }, [savedProfiles]);

  // Get passenger type
  const getPassengerType = (index: number): 'adult' | 'child' | 'infant' => {
    if (index < numAdults) return 'adult';
    if (index < numAdults + numChildren) return 'child';
    return 'infant';
  };

  // Get passenger label
  const getPassengerLabel = (index: number): string => {
    const type = getPassengerType(index);
    if (type === 'adult') {
      const adultIndex = index + 1;
      return `${t.passenger} ${adultIndex} (${t.adults})`;
    }
    if (type === 'child') {
      const childIndex = index - numAdults + 1;
      return `${t.passenger} ${index + 1} (${t.children} ${childIndex})`;
    }
    const infantIndex = index - numAdults - numChildren + 1;
    return `${t.passenger} ${index + 1} (${t.infants} ${infantIndex})`;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    // Validate all passengers (using comprehensive validation library)
    passengers.forEach((passenger, index) => {
      const type = getPassengerType(index);

      if (!passenger.title) newErrors[`${index}-title`] = t.required;

      // Validate first name with detailed error messages
      if (!passenger.firstName.trim()) {
        newErrors[`${index}-firstName`] = t.required;
      } else {
        const nameResult = validateNameFn(passenger.firstName);
        if (!nameResult.valid) {
          newErrors[`${index}-firstName`] = nameResult.error || t.required;
        }
      }

      // Validate last name with detailed error messages
      if (!passenger.lastName.trim()) {
        newErrors[`${index}-lastName`] = t.required;
      } else {
        const nameResult = validateNameFn(passenger.lastName);
        if (!nameResult.valid) {
          newErrors[`${index}-lastName`] = nameResult.error || t.required;
        }
      }

      if (!passenger.gender) newErrors[`${index}-gender`] = t.required;
      if (!passenger.nationality) newErrors[`${index}-nationality`] = t.required;

      // Validate date of birth with detailed error messages
      const dobResult = validateDOBFn(passenger.dateOfBirth, type);
      if (!dobResult.valid) {
        newErrors[`${index}-dateOfBirth`] = dobResult.error || t.validDate;
      }

      // Validate passport with detailed error messages
      const passportResult = validatePassportFn(passenger.passportNumber);
      if (!passportResult.valid) {
        newErrors[`${index}-passportNumber`] = passportResult.error || t.validPassport;
      }

      if (!validateDate(passenger.passportIssueDate)) {
        newErrors[`${index}-passportIssueDate`] = t.validDate;
      }

      if (!validateDate(passenger.passportExpiryDate)) {
        newErrors[`${index}-passportExpiryDate`] = t.validDate;
      } else if (isPassportExpired(passenger.passportExpiryDate)) {
        newErrors[`${index}-passportExpiryDate`] = t.passportExpired;
      }

      // Validate email with detailed error messages
      if (index === 0 || passenger.email) {
        const emailResult = validateEmailFn(passenger.email);
        if (!emailResult.valid) {
          newErrors[`${index}-email`] = emailResult.error || t.validEmail;
        }
      }

      // Validate phone with detailed error messages
      if (index === 0 && passenger.phone) {
        const phoneResult = validatePhoneFn(passenger.phone);
        if (!phoneResult.valid) {
          newErrors[`${index}-phone`] = phoneResult.error || 'Invalid phone format';
        }
      }
    });

    // Validate emergency contact
    if (!emergencyContact.name.trim()) newErrors['emergency-name'] = t.required;
    if (!emergencyContact.relationship.trim()) newErrors['emergency-relationship'] = t.required;
    if (!emergencyContact.phone.trim()) newErrors['emergency-phone'] = t.required;
    if (!validateEmail(emergencyContact.email)) newErrors['emergency-email'] = t.validEmail;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit?.({ passengers, emergencyContact });
    } else {
      // Scroll to first error
      const firstError = Object.keys(newErrors)[0];
      const element = document.querySelector(`[data-field="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Auto-save indicator */}
      {autoSave && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-4 py-2 rounded-lg">
          <CheckCircle2 size={16} />
          <span>{t.autoSaveEnabled}</span>
        </div>
      )}

      {/* Success message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-success text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown">
          <CheckCircle2 size={20} />
          <span>{t.profileSaved}</span>
        </div>
      )}

      {/* Passengers */}
      {passengers.map((passenger, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPassengerType(index) === 'adult' && <Users size={24} />}
                {getPassengerType(index) === 'child' && <UserCircle size={24} />}
                {getPassengerType(index) === 'infant' && <Baby size={24} />}
                <h3 className="text-xl font-bold">{getPassengerLabel(index)}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProfiles((prev) => ({ ...prev, [index]: !prev[index] }))}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">{t.loadProfile}</span>
              </button>
            </div>
          </div>

          {/* Load profiles dropdown */}
          {showProfiles[index] && savedProfiles.length > 0 && (
            <div className="bg-primary-50 border-b-2 border-primary-100 p-4">
              <p className="text-sm font-semibold text-primary-900 mb-3">{t.savedProfiles}:</p>
              <div className="space-y-2">
                {savedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-primary-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{profile.profileName}</p>
                        <p className="text-sm text-gray-500">
                          {profile.firstName} {profile.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => loadProfile(index, profile)}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProfile(profile.id)}
                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="p-6 space-y-6">
            {/* Basic information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Title */}
              <div data-field={`${index}-title`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.title} <span className="text-error">*</span>
                </label>
                <select
                  value={passenger.title}
                  onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl border-2 transition-all ${
                    errors[`${index}-title`]
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                </select>
                {errors[`${index}-title`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-title`]}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div data-field={`${index}-firstName`} className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.firstName} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                      errors[`${index}-firstName`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors[`${index}-firstName`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-firstName`]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Middle Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.middleName} <span className="text-gray-400 text-xs">({t.optional})</span>
                </label>
                <input
                  type="text"
                  value={passenger.middleName || ''}
                  onChange={(e) => updatePassenger(index, 'middleName', e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                  placeholder="Michael"
                />
              </div>

              {/* Last Name */}
              <div data-field={`${index}-lastName`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.lastName} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl border-2 transition-all ${
                    errors[`${index}-lastName`]
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                  }`}
                  placeholder="Doe"
                />
                {errors[`${index}-lastName`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-lastName`]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date of Birth */}
              <div data-field={`${index}-dateOfBirth`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  {t.dateOfBirth} <span className="text-error">*</span>
                  <Tooltip content={t.tooltipDOB}>
                    <Info size={16} className="text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                      errors[`${index}-dateOfBirth`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                  />
                </div>
                {errors[`${index}-dateOfBirth`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-dateOfBirth`]}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div data-field={`${index}-gender`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.gender} <span className="text-error">*</span>
                </label>
                <select
                  value={passenger.gender}
                  onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                  className={`w-full h-11 px-4 rounded-xl border-2 transition-all ${
                    errors[`${index}-gender`]
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="male">{t.male}</option>
                  <option value="female">{t.female}</option>
                  <option value="other">{t.other}</option>
                </select>
                {errors[`${index}-gender`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-gender`]}
                  </p>
                )}
              </div>

              {/* Nationality */}
              <div data-field={`${index}-nationality`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  {t.nationality} <span className="text-error">*</span>
                  <Tooltip content={t.tooltipNationality}>
                    <Info size={16} className="text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={passenger.nationality}
                    onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                      errors[`${index}-nationality`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                  >
                    <option value="">{t.selectCountry}</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                {errors[`${index}-nationality`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-nationality`]}
                  </p>
                )}
              </div>
            </div>

            {/* Passport Information */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" />
                Passport Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Passport Number */}
                <div data-field={`${index}-passportNumber`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {t.passportNumber} <span className="text-error">*</span>
                    <Tooltip content={t.tooltipPassport}>
                      <Info size={16} className="text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) =>
                      updatePassenger(index, 'passportNumber', e.target.value.toUpperCase())
                    }
                    className={`w-full h-11 px-4 rounded-xl border-2 transition-all uppercase ${
                      errors[`${index}-passportNumber`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                    placeholder="AB123456"
                  />
                  {errors[`${index}-passportNumber`] && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors[`${index}-passportNumber`]}
                    </p>
                  )}
                </div>

                {/* Issue Date */}
                <div data-field={`${index}-passportIssueDate`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.passportIssue} <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={passenger.passportIssueDate}
                    onChange={(e) => updatePassenger(index, 'passportIssueDate', e.target.value)}
                    className={`w-full h-11 px-4 rounded-xl border-2 transition-all ${
                      errors[`${index}-passportIssueDate`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                  />
                  {errors[`${index}-passportIssueDate`] && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors[`${index}-passportIssueDate`]}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div data-field={`${index}-passportExpiryDate`}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.passportExpiry} <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={passenger.passportExpiryDate}
                    onChange={(e) => updatePassenger(index, 'passportExpiryDate', e.target.value)}
                    className={`w-full h-11 px-4 rounded-xl border-2 transition-all ${
                      errors[`${index}-passportExpiryDate`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                  />
                  {errors[`${index}-passportExpiryDate`] && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors[`${index}-passportExpiryDate`]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div data-field={`${index}-email`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.email} {index === 0 && <span className="text-error">*</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                    className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                      errors[`${index}-email`]
                        ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                {errors[`${index}-email`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-email`]}
                  </p>
                )}
              </div>

              {/* Phone with International Code */}
              <div data-field={`${index}-phone`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.phone} {index === 0 && <span className="text-error">*</span>}
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <select
                    className="w-28 h-11 px-2 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 text-sm"
                    onChange={(e) => {
                      const code = e.target.value;
                      const currentPhone = passenger.phone.replace(/^\+\d+\s*/, '');
                      updatePassenger(index, 'phone', code ? `${code} ${currentPhone}` : currentPhone);
                    }}
                    value={passenger.phone.match(/^\+\d+/)?.[0] || '+1'}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.dialCode}>
                        {c.flag} {c.dialCode}
                      </option>
                    ))}
                  </select>
                  {/* Phone Number Input */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={passenger.phone.replace(/^\+\d+\s*/, '')}
                      onChange={(e) => {
                        const code = passenger.phone.match(/^\+\d+/)?.[0] || '+1';
                        updatePassenger(index, 'phone', `${code} ${e.target.value}`);
                      }}
                      className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                        errors[`${index}-phone`]
                          ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                {errors[`${index}-phone`] && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors[`${index}-phone`]}
                  </p>
                )}
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() =>
                setExpandedSections((prev) => ({ ...prev, [index]: !prev[index] }))
              }
              className="flex items-center justify-between w-full bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl transition-colors"
            >
              <span className="font-semibold text-gray-900">
                {expandedSections[index] ? t.hideAdvanced : t.advancedOptions}
              </span>
              {expandedSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Advanced Options */}
            {expandedSections[index] && (
              <div className="space-y-4 animate-slideDown">
                {/* TSA PreCheck */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {t.tsaPrecheck}
                    <Tooltip content={t.tooltipTSA}>
                      <Info size={16} className="text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={passenger.knownTravelerNumber || ''}
                      onChange={(e) => updatePassenger(index, 'knownTravelerNumber', e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="KTN123456789"
                    />
                  </div>
                </div>

                {/* Redress Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    {t.redressNumber}
                    <Tooltip content={t.tooltipRedress}>
                      <Info size={16} className="text-gray-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    value={passenger.redressNumber || ''}
                    onChange={(e) => updatePassenger(index, 'redressNumber', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder="1234567"
                  />
                </div>

                {/* Frequent Flyer */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.frequentFlyer}
                  </label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={passenger.frequentFlyerNumber || ''}
                      onChange={(e) => updatePassenger(index, 'frequentFlyerNumber', e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                      placeholder="AA1234567890"
                    />
                  </div>
                </div>

                {/* Meal Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.mealPreference}
                  </label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      value={passenger.mealPreference || ''}
                      onChange={(e) => updatePassenger(index, 'mealPreference', e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="">{t.selectMeal}</option>
                      <option value="standard">{t.standard}</option>
                      <option value="vegetarian">{t.vegetarian}</option>
                      <option value="vegan">{t.vegan}</option>
                      <option value="gluten-free">{t.glutenFree}</option>
                      <option value="kosher">{t.kosher}</option>
                      <option value="halal">{t.halal}</option>
                    </select>
                  </div>
                </div>

                {/* Special Assistance */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {t.specialAssistance}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: 'wheelchair', label: t.wheelchair, icon: Accessibility },
                      { value: 'visual', label: t.visualImpairment, icon: AlertCircle },
                      { value: 'hearing', label: t.hearingImpairment, icon: AlertCircle },
                      { value: 'mobility', label: t.mobilityAssistance, icon: Heart },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleAssistance(index, value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                          passenger.specialAssistance?.includes(value)
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-medium">{label}</span>
                        {passenger.specialAssistance?.includes(value) && (
                          <CheckCircle2 size={18} className="ml-auto text-primary-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seat Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.seatPreference}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'window', label: t.window },
                      { value: 'aisle', label: t.aisle },
                      { value: 'middle', label: t.middle },
                      { value: 'none', label: t.noPreference },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updatePassenger(index, 'seatPreference', value)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                          passenger.seatPreference === value
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save Profile */}
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.saveProfile}
                  </label>
                  <input
                    type="text"
                    value={saveProfileName[index] || ''}
                    onChange={(e) =>
                      setSaveProfileName((prev) => ({ ...prev, [index]: e.target.value }))
                    }
                    className="w-full h-11 px-4 rounded-xl border-2 border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all"
                    placeholder={t.profileNamePlaceholder}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => saveProfile(index)}
                  className="flex items-center gap-2 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all sm:mt-7"
                >
                  <Save size={20} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Emergency Contact */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-error to-error/80 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <Heart size={24} />
            <h3 className="text-xl font-bold">{t.emergencyContact}</h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Name */}
            <div data-field="emergency-name">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.contactName} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={emergencyContact.name}
                  onChange={(e) =>
                    setEmergencyContact({ ...emergencyContact, name: e.target.value })
                  }
                  className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                    errors['emergency-name']
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                  }`}
                  placeholder="Jane Doe"
                />
              </div>
              {errors['emergency-name'] && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors['emergency-name']}
                </p>
              )}
            </div>

            {/* Relationship */}
            <div data-field="emergency-relationship">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.relationship} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={emergencyContact.relationship}
                onChange={(e) =>
                  setEmergencyContact({ ...emergencyContact, relationship: e.target.value })
                }
                className={`w-full h-11 px-4 rounded-xl border-2 transition-all ${
                  errors['emergency-relationship']
                    ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                }`}
                placeholder="Spouse, Parent, Sibling, etc."
              />
              {errors['emergency-relationship'] && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors['emergency-relationship']}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div data-field="emergency-phone">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.phone} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={(e) =>
                    setEmergencyContact({ ...emergencyContact, phone: e.target.value })
                  }
                  className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                    errors['emergency-phone']
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors['emergency-phone'] && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors['emergency-phone']}
                </p>
              )}
            </div>

            {/* Email */}
            <div data-field="emergency-email">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.email} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={emergencyContact.email}
                  onChange={(e) =>
                    setEmergencyContact({ ...emergencyContact, email: e.target.value })
                  }
                  className={`w-full h-11 pl-11 pr-4 rounded-xl border-2 transition-all ${
                    errors['emergency-email']
                      ? 'border-error focus:border-error focus:ring-4 focus:ring-error/20'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                  }`}
                  placeholder="jane.doe@example.com"
                />
              </div>
              {errors['emergency-email'] && (
                <p className="mt-1 text-sm text-error flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors['emergency-email']}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg rounded-t-2xl">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl font-bold text-lg shadow-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {t.submit}
        </button>
      </div>
    </form>
  );
};
