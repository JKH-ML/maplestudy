'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NotebookFile {
  name: string;
  path: string;
}

export default function NotebookListPage() {
  const [files, setFiles] = useState<NotebookFile[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch('https://api.github.com/repos/JKH-ML/python/contents');
      const data = await res.json();
      const ipynbFiles = data.filter((f: any) => f.name.endsWith('.ipynb'));
      setFiles(ipynbFiles);
    };
    fetchFiles();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">📓 노트북 목록</h1>

      {files.map((file) => {
        const colabUrl = `https://colab.research.google.com/github/JKH-ML/python/blob/main/${file.path}`;
        return (
          <Card key={file.name}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">{file.name}</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={colabUrl} target="_blank" rel="noopener noreferrer">
                  🚀 Colab에서 열기
                </Link>
              </Button>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
