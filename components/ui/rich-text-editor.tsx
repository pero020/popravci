'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useState, useCallback, memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';

// Add custom styles to remove the blue outline
import './rich-text-editor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

// Memoize the MenuBar component to prevent unnecessary rerenders
const MenuBar = memo(({ editor }: { editor: Editor | null }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      // Check if the link has http:// or https:// prefix
      const url = /^https?:\/\//.test(linkUrl) 
        ? linkUrl 
        : `https://${linkUrl}`;
        
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ 
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer'
        })
        .run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  };

  // Create event handlers that don't cause rerenders
  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleLinkInput = () => setShowLinkInput(!showLinkInput);
  const alignLeft = () => editor.chain().focus().setTextAlign('left').run();
  const alignCenter = () => editor.chain().focus().setTextAlign('center').run();
  const alignRight = () => editor.chain().focus().setTextAlign('right').run();
  const undoAction = () => editor.chain().focus().undo().run();
  const redoAction = () => editor.chain().focus().redo().run();

  return (
    <div className="border rounded-md p-1 mb-2 flex flex-wrap gap-1 bg-background">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleBold}
        className={editor.isActive('bold') ? 'bg-accent' : ''}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleItalic}
        className={editor.isActive('italic') ? 'bg-accent' : ''}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleH2}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
        type="button"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleH3}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
        type="button"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleBulletList}
        className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleOrderedList}
        className={editor.isActive('orderedList') ? 'bg-accent' : ''}
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLinkInput}
          className={editor.isActive('link') ? 'bg-accent' : ''}
          type="button"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-md p-2 z-10 flex gap-2">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL"
              className="text-xs p-1 border rounded"
            />
            <Button size="sm" variant="default" onClick={addLink} type="button">
              Add
            </Button>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={alignLeft}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
        type="button"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={alignCenter}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
        type="button"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={alignRight}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
        type="button"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <div className="border-l mx-1"></div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={undoAction}
        disabled={!editor.can().undo()}
        type="button"
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={redoAction}
        disabled={!editor.can().redo()}
        type="button"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
});

MenuBar.displayName = 'MenuBar';

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  // Use memoized callback to prevent unnecessary rerenders
  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      // Send the actual editor HTML to the onChange handler
      console.log('Editor content updated:', editor.getHTML());
      onChange(editor.getHTML());
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        // These settings should make links open in a new tab
        openOnClick: true, // Enable opening links on click 
        linkOnPaste: true,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
        HTMLAttributes: {
          // Default attributes to add to all links
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
    // Fix for SSR hydration mismatch
    immediatelyRender: false,
  });

  // This will only update the editor content when the content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border rounded-md">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor}
        className="p-3 min-h-[200px]" 
      />
    </div>
  );
}