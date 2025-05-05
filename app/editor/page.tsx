"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import {
  Bold,
  Italic,
  Code2,
  Link,
  Heading2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(`## \u2728 Markdown Editor Demo

### Headings
**Bold** _Italic_ \`Inline code\` [Link](https://example.com)

### Code
\n\n\`\`\`ts
const x = 123;
\`\`\`

### Math
$E = mc^2$

### Image
![Sample Image](https://i.imgur.com/4mopFqe.jpg)
`);
  const [fileName, setFileName] = useState("my-note.md");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelectedText = (wrapper: (text: string) => string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.slice(start, end);
    const newText = wrapper(selectedText || "Text");

    const updatedMarkdown =
      markdown.slice(0, start) + newText + markdown.slice(end);
    setMarkdown(updatedMarkdown);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.replace(/^data:.+;base64,/, "");
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await getBase64(file);
      const res = await fetch("/api/upload-imgur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      const imageUrl = data?.data?.link;
      if (!imageUrl) throw new Error("Upload failed");

      const imageMarkdown = `![Image](${imageUrl})`;
      setMarkdown((prev) => `${prev}\n\n${imageMarkdown}`);
    } catch (err) {
      console.error("Image upload error", err);
    }
  };

  const handleSave = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const text = reader.result as string;
      setMarkdown(text);
    };
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-6 p-6">
      {/* Left panel */}
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Markdown Input</h2>

        <TooltipProvider>
          <div className="flex gap-1 mb-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => wrapSelectedText((text) => `**${text}**`)}
                >
                  <Bold className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => wrapSelectedText((text) => `_${text}_`)}
                >
                  <Italic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => wrapSelectedText((text) => `\`${text}\``)}
                >
                  <Code2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => wrapSelectedText((text) => `[${text}](url)`)}
                >
                  <Link className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => wrapSelectedText((text) => `## ${text}`)}
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Image</TooltipContent>
            </Tooltip>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </TooltipProvider>

        <div className="flex gap-2">
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-1/2"
            placeholder="파일명 (예: my-note.md)"
          />
          <Button onClick={handleSave}>저장</Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("load-md")?.click()}
          >
            불러오기
          </Button>
          <input
            id="load-md"
            type="file"
            accept=".md"
            className="hidden"
            onChange={handleLoad}
          />
        </div>

        <Textarea
          ref={textareaRef}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="h-[400px] font-mono text-sm mt-2"
        />
      </div>

      {/* Right preview */}
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="prose dark:prose-invert max-w-none h-[400px] overflow-auto border rounded p-4">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {markdown}
          </Markdown>
        </div>
      </div>
    </div>
  );
}