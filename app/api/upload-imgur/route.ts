export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "Invalid image data" }), {
        status: 400,
      });
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("type", "base64");

    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // 환경변수 사용
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData }), {
        status: response.status,
      });
    }

    const result = await response.json();
    return Response.json(result);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
    });
  }
}
