'use client';

import * as React from 'react';
import { useRef, useState, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Compose your email...",
  className = ""
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);

  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isCodeView]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const span = document.createElement('span');
        span.style.backgroundColor = '#e3f2fd';
        span.style.padding = '2px 6px';
        span.style.borderRadius = '4px';
        span.style.color = '#1976d2';
        span.style.fontWeight = 'bold';
        span.textContent = `{{${variable}}}`;

        range.insertNode(span);
        updateContent();
      }
    }
  };

  const toggleCodeView = () => {
    if (isCodeView) {
      // Switch back to visual editor
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
    } else {
      // Switch to code view
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }
    }
    setIsCodeView(!isCodeView);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  const toolbarButtons = [
    { command: 'bold', icon: '𝐁', title: 'Bold' },
    { command: 'italic', icon: '𝐼', title: 'Italic' },
    { command: 'underline', icon: '𝑈', title: 'Underline' },
    { command: 'strikeThrough', icon: '𝑆', title: 'Strikethrough' },
    { command: 'separator' },
    { command: 'formatBlock', value: 'h1', icon: 'H₁', title: 'Heading 1' },
    { command: 'formatBlock', value: 'h2', icon: 'H₂', title: 'Heading 2' },
    { command: 'formatBlock', value: 'p', icon: '¶', title: 'Paragraph' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: '⬅', title: 'Align Left' },
    { command: 'justifyCenter', icon: '↔', title: 'Center' },
    { command: 'justifyRight', icon: '➡', title: 'Align Right' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
    { command: 'separator' },
    { command: 'foreColor', value: '#e74c3c', icon: '🔴', title: 'Red Text' },
    { command: 'foreColor', value: '#2c5aa0', icon: '🔵', title: 'Blue Text' },
    { command: 'foreColor', value: '#27ae60', icon: '🟢', title: 'Green Text' },
    { command: 'separator' },
    { command: 'custom', action: insertLink, icon: '🔗', title: 'Insert Link' },
    { command: 'custom', action: insertImage, icon: '🖼️', title: 'Insert Image' },
  ];

  const variableButtons = [
    { variable: 'first_name', label: 'First Name' },
    { variable: 'last_name', label: 'Last Name' },
    { variable: 'email', label: 'Email' },
    { variable: 'company', label: 'Company' },
    { variable: 'company_name', label: 'Company Name' },
    { variable: 'unsubscribe_url', label: 'Unsubscribe Link' },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border-b">
        {/* Formatting Buttons */}
        {toolbarButtons.map((btn, index) => {
          if (btn.command === 'separator') {
            return <div key={index} className="w-px h-6 bg-gray-300 mx-1" />;
          }

          if (btn.command === 'custom' && btn.action) {
            return (
              <button
                key={index}
                onClick={btn.action}
                className="p-2 text-sm hover:bg-gray-200 rounded transition-colors"
                title={btn.title}
                type="button"
              >
                {btn.icon}
              </button>
            );
          }

          return (
            <button
              key={index}
              onClick={() => executeCommand(btn.command, btn.value)}
              className="p-2 text-sm hover:bg-gray-200 rounded transition-colors"
              title={btn.title}
              type="button"
            >
              {btn.icon}
            </button>
          );
        })}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Variable Dropdown */}
        <div className="relative group">
          <button
            type="button"
            className="p-2 text-sm hover:bg-gray-200 rounded transition-colors"
            title="Insert Variable"
          >
            {'{}'} Variables ▼
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 min-w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            {variableButtons.map((variable, index) => (
              <button
                key={index}
                onClick={() => insertVariable(variable.variable)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                type="button"
              >
                {variable.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Code View Toggle */}
        <button
          onClick={toggleCodeView}
          className={`p-2 text-sm rounded transition-colors ${
            isCodeView ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
          }`}
          title="Toggle Code View"
          type="button"
        >
          {isCodeView ? '👁️ Visual' : '</> HTML'}
        </button>
      </div>

      {/* Editor */}
      {isCodeView ? (
        <textarea
          value={htmlContent}
          onChange={handleCodeChange}
          className="w-full h-64 p-4 font-mono text-sm resize-none focus:outline-none"
          placeholder="<p>Edit HTML directly...</p>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={updateContent}
          onBlur={updateContent}
          className="min-h-64 p-4 focus:outline-none"
          style={{ minHeight: '256px' }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder}
        />
      )}

      {/* Placeholder Styles */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 40px;
        }
      `}</style>
    </div>
  );
}