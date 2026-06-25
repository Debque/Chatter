import type { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  const btn = (
    label: string,
    action: () => void,
    active?: boolean
  ) => (
    <button
      onClick={action}
      title={label}
      className={`px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const chain = () => (editor.chain().focus() as unknown as any)

  return (
    <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50">
      {btn('B',      () => chain().toggleBold().run(),                    editor.isActive('bold'))}
      {btn('I',      () => chain().toggleItalic().run(),                  editor.isActive('italic'))}
      {btn('S',      () => chain().toggleStrike().run(),                  editor.isActive('strike'))}
      <div className="w-px bg-gray-200 mx-1" />
      {btn('H1',     () => chain().toggleHeading({ level: 1 }).run(),     editor.isActive('heading', { level: 1 }))}
      {btn('H2',     () => chain().toggleHeading({ level: 2 }).run(),     editor.isActive('heading', { level: 2 }))}
      {btn('H3',     () => chain().toggleHeading({ level: 3 }).run(),     editor.isActive('heading', { level: 3 }))}
      <div className="w-px bg-gray-200 mx-1" />
      {btn('• List', () => chain().toggleBulletList().run(),              editor.isActive('bulletList'))}
      {btn('1. List',() => chain().toggleOrderedList().run(),             editor.isActive('orderedList'))}
      <div className="w-px bg-gray-200 mx-1" />
      {btn('Code',   () => chain().toggleCode().run(),                    editor.isActive('code'))}
      {btn('Block',  () => chain().toggleCodeBlock().run(),               editor.isActive('codeBlock'))}
      {btn('Quote',  () => chain().toggleBlockquote().run(),              editor.isActive('blockquote'))}
    </div>
  )
}