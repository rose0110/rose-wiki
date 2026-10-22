function cleanSnapshotValue(value) {
  let result = (value || "").trim();
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1);
  }
  return result.replaceAll('\\"', '"');
}

export function parseTopPostsSnapshot(snapshot, period) {
  const starts = [...snapshot.matchAll(
    /\n    - link:\n      - \/url: \/feed\/update\/urn:li:activity:(\d+)\//g,
  )].map((match) => ({ id: match[1], index: match.index }));

  return starts.map((start, index) => {
    const chunk = snapshot.slice(
      start.index,
      index + 1 < starts.length ? starts[index + 1].index : snapshot.length,
    );

    let text = (chunk.split("\n").find((line) => line.startsWith("      - generic: ")) || "").slice(17);
    text = cleanSnapshotValue(text);

    const textLines = [...chunk.matchAll(/^        - text: (.*)$/gm)]
      .map((match) => cleanSnapshotValue(match[1]))
      .filter((value) =>
        !/^a publié ceci/.test(value)
        && value !== "Impressions"
        && value !== "Voir les statistiques"
        && value !== "·"
      );

    const firstLine = textLines[0] || Array.from(text).slice(0, 120).join("");
    const title = Array.from(firstLine).length > 150
      ? `${Array.from(firstLine).slice(0, 147).join("").replace(/\s+\S*$/, "")}…`
      : firstLine;

    const impressions = Number(((chunk.match(/generic: "?([\d ]+)"?\n        - generic: Impressions/) || [])[1] || "0").replaceAll(" ", ""));
    const reactions = Number(((chunk.match(/button "([\d ]+) réactions?"/) || [])[1] || "0").replaceAll(" ", ""));
    const comments = Number(((chunk.match(/link "([\d ]+) commentaires?"/) || [])[1] || "0").replaceAll(" ", ""));
    const reposts = Number(((chunk.match(/group "([\d ]+) republications?"/) || [])[1] || "0").replaceAll(" ", ""));
    const votes = Number(((text.match(/Sondage • ([\d ]+) votes?/) || [])[1] || "0").replaceAll(" ", ""));

    const pollMarker = text.lastIndexOf(", Sondage •");
    let pollQuestion = "";
    if (pollMarker > 0) {
      const beforePoll = text.slice(0, pollMarker);
      const questionStart = beforePoll.lastIndexOf("❓");
      if (questionStart >= 0) pollQuestion = beforePoll.slice(questionStart).trim();
    }

    return {
      id: start.id,
      date: new Date(Number(BigInt(start.id) >> 22n)).toISOString(),
      title,
      text,
      impressions,
      reactions,
      comments,
      reposts,
      votes,
      pollQuestion,
      format: /Sondage •/.test(text)
        ? "Sondage"
        : chunk.includes('link "Image"')
          ? "Image"
          : chunk.includes("document")
            ? "Document"
            : "Texte",
      period,
    };
  });
}

export function createMonthlyScanner(tab) {
  return async function scanMonth(start, end) {
    await tab.goto(
      `https://www.linkedin.com/analytics/creator/top-posts/?endDate=${end}&startDate=${start}&metricType=IMPRESSIONS&timeRange=custom`,
    );
    await new Promise((resolve) => setTimeout(resolve, 2200));

    let snapshot = await tab.playwright.domSnapshot();
    let posts = parseTopPostsSnapshot(snapshot, `${start}–${end}`)
      .filter((post) => post.date.slice(0, 10) >= start && post.date.slice(0, 10) <= end);

    if (posts.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      snapshot = await tab.playwright.domSnapshot();
      posts = parseTopPostsSnapshot(snapshot, `${start}–${end}`)
        .filter((post) => post.date.slice(0, 10) >= start && post.date.slice(0, 10) <= end);
    }

    return posts;
  };
}
