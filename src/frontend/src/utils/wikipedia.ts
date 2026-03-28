export function cleanText(text: string): string {
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFullExtract(title: string): Promise<string> {
  try {
    const encoded = encodeURIComponent(title);
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encoded}&format=json&origin=*`,
      { headers: { "Api-User-Agent": "QuizzoAI/1.0" } },
    );
    if (!res.ok) return "";
    const data = await res.json();
    const pages = data?.query?.pages ?? {};
    const page = Object.values(pages)[0] as { extract?: string } | undefined;
    return page?.extract ?? "";
  } catch {
    return "";
  }
}

async function searchWikipedia(query: string): Promise<string | null> {
  try {
    // Try with NCERT keyword for better results
    const searchQuery = `${query} NCERT`;
    const searchEncoded = encodeURIComponent(searchQuery);
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchEncoded}&format=json&origin=*`,
      { headers: { "Api-User-Agent": "QuizzoAI/1.0" } },
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const firstResult = searchData?.query?.search?.[0]?.title as
      | string
      | undefined;
    if (firstResult) return firstResult;

    // Retry without NCERT keyword
    const searchEncoded2 = encodeURIComponent(query);
    const searchRes2 = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchEncoded2}&format=json&origin=*`,
      { headers: { "Api-User-Agent": "QuizzoAI/1.0" } },
    );
    if (!searchRes2.ok) return null;
    const searchData2 = await searchRes2.json();
    return (
      (searchData2?.query?.search?.[0]?.title as string | undefined) ?? null
    );
  } catch {
    return null;
  }
}

export async function fetchWikipediaContent(query: string): Promise<string> {
  const encoded = encodeURIComponent(query);

  // Step 1: Try direct REST summary
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { "Api-User-Agent": "QuizzoAI/1.0" } },
    );
    if (res.ok) {
      const data = await res.json();
      const summaryTitle: string = data.title || query;
      let extract: string = data.extract || "";

      // If summary is short, fetch the full introductory extract in parallel with fallback
      if (extract.trim().length < 400) {
        const fullExtract = await fetchFullExtract(summaryTitle);
        if (fullExtract.length > extract.length) {
          extract = fullExtract;
        }
      }

      if (extract.trim().length >= 100) return cleanText(extract);
    }
  } catch {
    // fall through
  }

  // Step 2: Search Wikipedia for the best matching article
  const foundTitle = await searchWikipedia(query);
  if (!foundTitle) {
    // Step 3: Return minimal content based on the chapter name so question generator can still work
    return cleanText(
      `${query} is an important chapter. It covers fundamental concepts and principles. Students should understand the key ideas and their applications.`,
    );
  }

  // Step 4: Fetch both summary and full extract for the found article
  const [summaryRes, fullExtract] = await Promise.all([
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(foundTitle)}`,
      { headers: { "Api-User-Agent": "QuizzoAI/1.0" } },
    ).catch(() => null),
    fetchFullExtract(foundTitle),
  ]);

  let finalText = fullExtract;

  if (summaryRes?.ok) {
    try {
      const summaryData = await summaryRes.json();
      const summaryExtract: string = summaryData.extract || "";
      if (summaryExtract.length > finalText.length) {
        finalText = summaryExtract;
      }
    } catch {
      // ignore
    }
  }

  if (finalText.trim().length < 50) {
    // Provide minimal content rather than throwing
    return cleanText(
      `${query} is an important topic in the curriculum. It covers fundamental concepts, key definitions, and practical applications relevant to students.`,
    );
  }

  return cleanText(finalText);
}
