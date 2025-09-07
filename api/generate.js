export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { prompt } = req.body;
  if (!prompt) return res.status(400).send("No prompt provided");

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const contentType = response.headers.get("content-type") || "";

    if (contentType.startsWith("image/")) {
      const blob = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      res.send(Buffer.from(blob));
    } else {
      const text = await response.text();
      res.status(500).send(text);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}
