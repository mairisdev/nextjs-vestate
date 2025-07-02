import React, { useMemo, useState } from "react"
import { Editor } from "slate"
import { Slate, Editable, withReact } from "slate-react"
import { withHistory } from "slate-history"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function BlogPostEditor({ onSave }: { onSave: (content: string) => void }) {
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")

  // Correct Slate editor initialization using withReact and withHistory
  const editor = useMemo(() => withHistory(withReact(Editor)), [])

  const handleSave = () => {
    const content = JSON.stringify(editor.children) // Save as JSON
    onSave({ title, excerpt, content })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Title</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Excerpt</label>
        <Input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Content</label>
        <Slate editor={editor} value={editor.children} onChange={() => {}}>
          <Editable className="resize-none h-32 border p-4 rounded-md" />
        </Slate>
      </div>

      <Button onClick={handleSave}>Save</Button>
    </div>
  )
}
