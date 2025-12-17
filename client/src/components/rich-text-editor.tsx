import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Palette,
  Highlighter,
  Undo,
  Redo,
  Upload,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TEXT_COLORS = [
  { name: 'Preto', value: '#000000' },
  { name: 'Cinza Escuro', value: '#4B5563' },
  { name: 'Cinza', value: '#9CA3AF' },
  { name: 'Vermelho', value: '#DC2626' },
  { name: 'Laranja', value: '#EA580C' },
  { name: 'Amarelo', value: '#CA8A04' },
  { name: 'Verde', value: '#16A34A' },
  { name: 'Azul', value: '#2563EB' },
  { name: 'Roxo', value: '#9333EA' },
  { name: 'Rosa', value: '#DB2777' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Amarelo', value: '#FEF08A' },
  { name: 'Verde', value: '#BBF7D0' },
  { name: 'Azul', value: '#BFDBFE' },
  { name: 'Rosa', value: '#FBCFE8' },
  { name: 'Laranja', value: '#FED7AA' },
  { name: 'Roxo', value: '#DDD6FE' },
];

const FONT_SIZES = [
  { name: 'Pequeno', value: '0.875em' },
  { name: 'Normal', value: '1em' },
  { name: 'Médio', value: '1.125em' },
  { name: 'Grande', value: '1.25em' },
  { name: 'Extra Grande', value: '1.5em' },
];

export function RichTextEditor({ content, onChange, placeholder = "Comece a escrever..." }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showImagePopover, setShowImagePopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkPopover(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkPopover(false);
  };

  const addImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImagePopover(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      editor.chain().focus().setImage({ src: dataUrl }).run();
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImagePopover(false);
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-gray-100 transition-colors",
        isActive && "bg-gray-200 text-bright-blue"
      )}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="border-b bg-gray-50 p-2">
        <div className="flex flex-wrap gap-1 items-center">
          <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Desfazer"
            >
              <Undo size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Refazer"
            >
              <Redo size={18} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
            <Select
              value={
                editor.isActive('heading', { level: 1 }) ? 'h1' :
                editor.isActive('heading', { level: 2 }) ? 'h2' :
                editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
              }
              onValueChange={(value) => {
                if (value === 'p') {
                  editor.chain().focus().setParagraph().run();
                } else {
                  const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
                  editor.chain().focus().toggleHeading({ level }).run();
                }
              }}
            >
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">
                  <span className="flex items-center gap-2">
                    <Pilcrow size={14} /> Parágrafo
                  </span>
                </SelectItem>
                <SelectItem value="h1">
                  <span className="flex items-center gap-2">
                    <Heading1 size={14} /> Título 1
                  </span>
                </SelectItem>
                <SelectItem value="h2">
                  <span className="flex items-center gap-2">
                    <Heading2 size={14} /> Título 2
                  </span>
                </SelectItem>
                <SelectItem value="h3">
                  <span className="flex items-center gap-2">
                    <Heading3 size={14} /> Título 3
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Negrito"
            >
              <Bold size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Itálico"
            >
              <Italic size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Sublinhado"
            >
              <UnderlineIcon size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Tachado"
            >
              <Strikethrough size={18} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
                  title="Cor do texto"
                >
                  <Palette size={18} />
                  <div 
                    className="w-3 h-3 rounded-full border" 
                    style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <p className="text-sm font-medium mb-2">Cor do texto</p>
                <div className="grid grid-cols-5 gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => editor.chain().focus().setColor(color.value).run()}
                      className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => editor.chain().focus().unsetColor().run()}
                >
                  Remover cor
                </Button>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center gap-1"
                  title="Destacar"
                >
                  <Highlighter size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <p className="text-sm font-medium mb-2">Cor de destaque</p>
                <div className="grid grid-cols-3 gap-2">
                  {HIGHLIGHT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                      className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                >
                  Remover destaque
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Alinhar à esquerda"
            >
              <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Centralizar"
            >
              <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Alinhar à direita"
            >
              <AlignRight size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justificar"
            >
              <AlignJustify size={18} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Lista com marcadores"
            >
              <List size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Lista numerada"
            >
              <ListOrdered size={18} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Citação"
            >
              <Quote size={18} />
            </ToolbarButton>
          </div>

          <div className="flex items-center gap-0.5">
            <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "p-2 rounded hover:bg-gray-100 transition-colors",
                    editor.isActive('link') && "bg-gray-200 text-bright-blue"
                  )}
                  title="Inserir link"
                >
                  <LinkIcon size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <p className="text-sm font-medium mb-2">Inserir link</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://exemplo.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                  />
                  <Button size="sm" onClick={addLink}>Inserir</Button>
                </div>
                {editor.isActive('link') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-red-500"
                    onClick={removeLink}
                  >
                    <X size={14} className="mr-1" /> Remover link
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            <Popover open={showImagePopover} onOpenChange={setShowImagePopover}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Inserir imagem"
                >
                  <ImageIcon size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <p className="text-sm font-medium mb-3">Inserir imagem</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Por URL</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addImageFromUrl()}
                      />
                      <Button size="sm" onClick={addImageFromUrl}>Inserir</Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-popover px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Upload do computador</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} className="mr-2" />
                      Escolher arquivo
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <EditorContent editor={editor} className="min-h-[300px]" />

      <style>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.75em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror p {
          margin-bottom: 0.75em;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin-bottom: 0.75em;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin-bottom: 0.25em;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1em;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: #6b7280;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #2563eb;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        .ProseMirror mark {
          border-radius: 0.25em;
          padding: 0.1em 0.2em;
        }
      `}</style>
    </div>
  );
}
