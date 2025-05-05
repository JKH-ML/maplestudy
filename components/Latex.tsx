"use client";

import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function Latex({ tex }: { tex: string }) {
  return <BlockMath math={tex} />;
}
