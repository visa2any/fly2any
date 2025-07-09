'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ArrowRightIcon } from './Icons';

interface FormDropdownProps {
  title: string;
  icon?: ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export default function FormDropdown({
  title,
  icon,
  isOpen: controlledIsOpen,
  defaultOpen = false,
  children,
  className = '',
  required = false
}: FormDropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [maxHeight, setMaxHeight] = useState<string>('0px');
  const contentRef = useRef<HTMLDivElement>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      } else {
        setMaxHeight('0px');
      }
    }
  }, [isOpen, children]);

  const toggleOpen = () => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div className={className} style={{ marginBottom: '20px' }}>
      {/* Header do Dropdown */}
      <button
        type="button"
        onClick={toggleOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          outline: 'none',
          marginBottom: isOpen ? '16px' : '0'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.background = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {icon && (
            <div style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </div>
          )}
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'left'
          }}>
            {title}
            {required && (
              <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
            )}
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            {isOpen ? 'Recolher' : 'Expandir'}
          </span>
          <ArrowRightIcon 
            style={{
              width: '16px',
              height: '16px',
              color: '#64748b',
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
      </button>

      {/* Conteúdo do Dropdown */}
      <div
        style={{
          maxHeight,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease'
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: isOpen ? '20px' : '0',
            background: 'white',
            border: isOpen ? '2px solid #e2e8f0' : 'none',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            boxShadow: isOpen ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}