export async function fetchNotebookList() {
  const res = await fetch("https://api.github.com/repos/JKH-ML/python/contents");
  const files = await res.json();
  return files.filter((file: any) => file.name.endsWith(".ipynb"));
}

export async function fetchNotebookContent(path: string) {
  const res = await fetch(`https://raw.githubusercontent.com/JKH-ML/python/main/${path}`);
  const text = await res.text();
  return JSON.parse(text);
}
