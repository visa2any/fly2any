/**
 * ENTERPRISE ESLINT CONFIGURATION FOR REACT 19 + NEXT.JS 15.X
 * Optimized for production builds with comprehensive error handling
 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Base configuration
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "@typescript-eslint/recommended"
  ),
  
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    
    // Language options for React 19
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    
    // Plugin configuration
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      "react": require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "jsx-a11y": require("eslint-plugin-jsx-a11y"),
      "import": require("eslint-plugin-import"),
    },
    
    // Rules configuration optimized for enterprise builds
    rules: {
      // React 19 specific rules
      "react/react-in-jsx-scope": "off", // React 19 doesn't require import React
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      
      // Handle unescaped entities more gracefully
      "react/no-unescaped-entities": ["error", {
        "forbid": [
          {
            "char": ">",
            "alternatives": ["&gt;"]
          },
          {
            "char": "<",
            "alternatives": ["&lt;"]
          },
          {
            "char": "{",
            "alternatives": ["&#123;"]
          },
          {
            "char": "}",
            "alternatives": ["&#125;"]
          }
        ]
      }],
      
      // TypeScript rules for React 19
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true,
        "args": "after-used"
      }],
      
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      
      // Import rules
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-self-import": "error",
      "import/no-cycle": "warn",
      "import/no-useless-path-segments": "error",
      "import/newline-after-import": "error",
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }],
      
      // React Hooks rules for React 19
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General rules
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-expressions": "error",
      "no-unreachable": "error",
      "no-duplicate-imports": "error",
      
      // Next.js specific rules
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-sync-scripts": "error",
      "@next/next/google-font-display": "warn",
      "@next/next/google-font-preconnect": "warn",
      "@next/next/no-page-custom-font": "warn",
      
      // Accessibility rules
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",
    },
    
    // Settings for React 19
    settings: {
      react: {
        version: "19.0.0"
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      }
    }
  },
  
  // Specific overrides for different file types
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      // More lenient rules for React components
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }]
    }
  },
  
  {
    files: ["**/pages/**/*.{ts,tsx}", "**/app/**/*.{ts,tsx}"],
    rules: {
      // Next.js pages can have default exports without names
      "import/no-anonymous-default-export": "off"
    }
  },
  
  {
    files: ["**/*.config.{js,ts,mjs}", "**/next.config.{js,ts}", "**/tailwind.config.{js,ts}"],
    rules: {
      // Configuration files can be more flexible
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  
  {
    files: ["**/*.d.ts"],
    rules: {
      // Type definition files
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  
  // Ignore patterns for performance
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/build/**",
      "**/dist/**",
      "**/out/**",
      "**/.vercel/**",
      "**/public/**",
      "**/coverage/**",
      "**/.cache/**",
      "**/backups/**",
      "**/*.min.js",
      "**/bundle*.js",
      "**/webpack*.js",
      "**/rollup*.js",
      "**/vite*.js"
    ]
  }
];