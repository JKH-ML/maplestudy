"use client";

import dynamic from "next/dynamic";
import { Layout, Data } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function PlotClient({
  data,
  layout,
}: {
  data: Data[];
  layout: Partial<Layout>;
}) {
  return <Plot data={data} layout={layout} style={{ width: "100%" }} />;
}
