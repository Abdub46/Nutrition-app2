import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

const HEADING_OPTIONS = [
  { label: 'Paragraph', tag: 'P' },
  { label: 'Heading 2', tag: 'H2' },
  { label: 'Heading 3', tag: 'H3' },
  { label: 'Heading 4', tag: 'H4' },
];

/**
 * Minimal WYSIWYG editor built directly on the browser's contentEditable +
 * document.execCommand - deliberately simple (no external editor library),
 * covering just what article authors need: bold, italic, underline,
 * strikethrough, alignment, headings, bulleted/numbered lists, blockquotes,
 * and undo/redo. Emits an HTML string via onChange; the backend sanitizes it
 * against an allowlist before persisting (see backend/utils/sanitizeContent.js),
 * so this component doesn't need to worry about that itself.
 *
 * Uncontrolled by design: `initialValue` seeds the editor once on mount only.
 * To load different content later (e.g. switching from "new article" to
 * "edit article"), remount this component with a different `key` rather than
 * changing `initialValue` - that avoids fighting the browser over cursor
 * position on every keystroke.
 */
const RichTextEditor = forwardRef(({ initialValue = '', onChange, placeholder = 'Start writing...', minHeight = 160 }, ref) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue || '';
    }
    // Browsers default to wrapping new blocks in <div> on Enter - force <p> so
    // output matches what the backend sanitizer's allowlist expects.
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // Not supported in this browser - harmless, output is sanitized server-side regardless.
    }
    // Intentionally runs once - see the uncontrolled-by-design note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  // Lets a parent (e.g. AdminArticles' Button/Link Block/External Link inserter)
  // splice raw HTML in at the current cursor position from outside this component.
  useImperativeHandle(ref, () => ({
    insertHtml: (html) => {
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, html);
      emitChange();
    },
    focus: () => editorRef.current?.focus(),
  }));

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 bg-gray-50 border-b border-gray-200 px-1.5 py-1">
        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec('bold')} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec('italic')} />
        <ToolbarButton icon={Underline} label="Underline" onClick={() => exec('underline')} />
        <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => exec('strikeThrough')} />
        <Divider />
        <select
          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1 mr-0.5 text-gray-600"
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.value) exec('formatBlock', e.target.value);
            e.target.value = '';
          }}
        >
          <option value="" disabled>
            Heading
          </option>
          {HEADING_OPTIONS.map((h) => (
            <option key={h.tag} value={h.tag}>
              {h.label}
            </option>
          ))}
        </select>
        <Divider />
        <ToolbarButton icon={AlignLeft} label="Align left" onClick={() => exec('justifyLeft')} />
        <ToolbarButton icon={AlignCenter} label="Align center" onClick={() => exec('justifyCenter')} />
        <ToolbarButton icon={AlignRight} label="Align right" onClick={() => exec('justifyRight')} />
        <Divider />
        <ToolbarButton icon={List} label="Bulleted list" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => exec('insertOrderedList')} />
        <ToolbarButton icon={Quote} label="Blockquote" onClick={() => exec('formatBlock', 'BLOCKQUOTE')} />
        <Divider />
        <ToolbarButton icon={Undo} label="Undo" onClick={() => exec('undo')} />
        <ToolbarButton icon={Redo} label="Redo" onClick={() => exec('redo')} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="article-content rich-text-editable px-3 py-2 text-sm text-gray-800 focus:outline-none overflow-y-auto"
        style={{ minHeight, maxHeight: minHeight * 3 }}
      />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

const ToolbarButton = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()} // keeps the editor's current text selection intact
    onClick={onClick}
    title={label}
    aria-label={label}
    className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900"
  >
    <Icon size={14} />
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

export default RichTextEditor;