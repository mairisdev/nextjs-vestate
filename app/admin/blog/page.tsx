"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Plus, Trash } from "lucide-react"
import { Textarea } from "../../components/ui/textarea"

interface BlogPost {
  image: string
  date: string
  title: string
  excerpt: string
  link: string
}

export default function BlogSettings() {
  const [title, setTitle] = useState("Mūsu bloga ieraksti un padomi")
  const [subtitle, setSubtitle] = useState("JAUNĀKIE RAKSTI")
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      image: "/blog/1.jpg",
      date: "2024. gada 5. marts",
      title: "Kā sagatavot īpašumu pārdošanai?",
      excerpt: "Uzzini, kā izveidot pirmo iespaidu, kas piesaista potenciālos pircējus...",
      link: "#"
    },
    {
      image: "/blog/2.jpg",
      date: "2025. gada 2. janvāris",
      title: "Nekustamā īpašuma tirgus tendences 2025",
      excerpt: "Apskatām aktuālās izmaiņas un prognozes nākamajam gadam...",
      link: "#"
    },
    {
      image: "/blog/3.jpg",
      date: "2024. gada 12. oktobris",
      title: "Biežāk pieļautās kļūdas īpašuma pārdošanā",
      excerpt: "Izvairies no kļūdām, kas var izmaksāt tev dārgi. Mūsu eksperta padomi...",
      link: "#"
    }
  ])

  const updatePost = (i: number, field: keyof BlogPost, value: string) => {
    const updated = [...posts]
    updated[i][field] = value
    setPosts(updated)
  }

  const addPost = () =>
    setPosts([...posts, { image: "", date: "", title: "", excerpt: "", link: "" }])

  const removePost = (i: number) => setPosts(posts.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold">Bloga sadaļa</h2>

      <div>
        <Label>Apakšvirsraksts</Label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>

      <div>
        <Label>Virsraksts</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {posts.map((post, i) => (
        <div key={i} className="p-4 border rounded-xl space-y-4 mt-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <Label className="font-semibold">Bloga ieraksts #{i + 1}</Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePost(i)}
            >
              <Trash className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          <Input
            placeholder="Attēla URL"
            value={post.image}
            onChange={(e) => updatePost(i, "image", e.target.value)}
          />
          <Input
            placeholder="Datums (piem. 2024. gada 5. marts)"
            value={post.date}
            onChange={(e) => updatePost(i, "date", e.target.value)}
          />
          <Input
            placeholder="Virsraksts"
            value={post.title}
            onChange={(e) => updatePost(i, "title", e.target.value)}
          />
          <Textarea
            placeholder="Īss apraksts"
            value={post.excerpt}
            onChange={(e: { target: { value: string } }) => updatePost(i, "excerpt", e.target.value)}
          />
          <Input
            placeholder="Saite uz rakstu"
            value={post.link}
            onChange={(e) => updatePost(i, "link", e.target.value)}
          />
        </div>
      ))}

      <Button variant="outline" onClick={addPost}>
        <Plus className="w-4 h-4 mr-1" />
        Pievienot bloga ierakstu
      </Button>

      <div>
        <Button className="mt-4">Saglabāt izmaiņas</Button>
      </div>
    </div>
  )
}
