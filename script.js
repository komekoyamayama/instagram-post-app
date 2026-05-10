const form = document.getElementById("postForm");
const titleResult = document.getElementById("titleResult");
const captionResult = document.getElementById("captionResult");
const hashtagResult = document.getElementById("hashtagResult");

const normalizeForTag = (text) => text.replace(/\s+/g, "").replace(/[、。,.!！?？]/g, "");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const workContent = document.getElementById("workContent").value.trim();
  const specialPoint = document.getElementById("specialPoint").value.trim();
  const area = document.getElementById("area").value.trim();
  const photoDesc = document.getElementById("photoDesc").value.trim();

  const title = `【${area}】${workContent}事例をご紹介`;

  const caption = `\n${area}で行った「${workContent}」の施工事例です。\n\n` +
    `今回のこだわりは、${specialPoint}。\n` +
    `写真では、${photoDesc}の雰囲気をご覧いただけます。\n\n` +
    `お住まいのお悩みやご希望に合わせて、丁寧にご提案いたします。\n` +
    `リフォームをご検討中の方は、ぜひお気軽にご相談ください！`;

  const hashtags = [
    "#リフォーム",
    `#${normalizeForTag(area)}`,
    `#${normalizeForTag(workContent)}`,
    "#施工事例",
    "#住まいづくり",
  ];

  titleResult.textContent = title;
  captionResult.textContent = caption.trim();
  hashtagResult.textContent = hashtags.join(" ");
});
