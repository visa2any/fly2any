'use client';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={className}
      style={{
        padding: '12px 0',
        fontSize: '13px',
        color: '#6b7280',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}
    >
      <ol 
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          minWidth: 'max-content'
        }}
      >
        {items.map((item, index) => (
          <li 
            key={index}
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}
          >
            {item.href ? (
              <Link
                href={item.href}
                itemProp="item"
                style={{
                  color: '#2563eb',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1d4ed8';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span 
                itemProp="name"
                style={{
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              >
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(index + 1)} />
            {index < items.length - 1 && (
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{ color: '#9ca3af', flexShrink: 0 }}
              >
                <path d="M9 18L15 12L9 6" />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
