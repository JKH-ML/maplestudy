// components/NotebookViewer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface NotebookViewerProps {
  content: any;
}

const NotebookViewer: React.FC<NotebookViewerProps> = ({ content }) => {
  const markdownCells = content.cells
    .filter((cell: any) => cell.cell_type === 'markdown')
    .map((cell: any) => cell.source.join(''));

  return (
    <div>
      {markdownCells.map((md: string, idx: number) => (
        <ReactMarkdown key={idx}>{md}</ReactMarkdown>
      ))}
    </div>
  );
};

export default NotebookViewer;
