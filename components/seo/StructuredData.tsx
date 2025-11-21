/**
 * Structured Data Component
 *
 * Renders JSON-LD schema markup for SEO
 * Use this component to add structured data to any page
 *
 * @example
 * <StructuredData schema={getOrganizationSchema()} />
 */

import React from 'react';

interface StructuredDataProps {
  schema: Record<string, any> | Record<string, any>[];
}

export function StructuredData({ schema }: StructuredDataProps) {
  // Handle array of schemas
  const schemasArray = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemasArray.map((schemaItem, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaItem),
          }}
        />
      ))}
    </>
  );
}

export default StructuredData;
