"use client";

import { useEffect, useState } from "react";

const words = ["MapleStudy", "메이플스터디"];

export default function MapleTyping() {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0); // 현재 단어 인덱스
  const [subIndex, setSubIndex] = useState(0); // 현재 글자 인덱스
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), 10000);
      return;
    }

    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
      setText(words[index].substring(0, subIndex));
    }, deleting ? 80 : 150);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((v) => !v);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <span className="text-2xl font-semibold">
      {text}
      <span className={`border-r-2 ml-0.5 ${blink ? "border-black dark:border-white" : "border-transparent"}`} />
    </span>
  );
}
