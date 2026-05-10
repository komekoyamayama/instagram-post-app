const photoFilesInput = document.getElementById("photoFiles");
const gallery = document.getElementById("gallery");
const beforeIndexSelect = document.getElementById("beforeIndex");
const afterIndexSelect = document.getElementById("afterIndex");
const form = document.getElementById("postForm");

const styleResult = document.getElementById("styleResult");
const copyResult = document.getElementById("copyResult");
const photoSummaryResult = document.getElementById("photoSummaryResult");
const comparisonResult = document.getElementById("comparisonResult");
const carouselResult = document.getElementById("carouselResult");
const reelResult = document.getElementById("reelResult");
const noteResult = document.getElementById("noteResult");
const hashtagResult = document.getElementById("hashtagResult");

let analyses = [];

const normalizeForTag = (text = "") =>
  text.replace(/\s+/g, "").replace(/[、。,.!！?？「」【】（）()]/g, "");

const analyzeImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(320, img.width);
        canvas.height = Math.min(320, img.height);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let bright = 0;
        let warm = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          bright += (r + g + b) / 3;
          warm += r - b;
        }

        const px = data.length / 4;
        const brightness = Math.round(bright / px);
        const warmth = Math.round(warm / px);
        const orientation = img.width >= img.height ? "横" : "縦";
        const mood = brightness > 165 ? "明るく開放感のある印象" : brightness > 125 ? "落ち着きとやわらかさのある印象" : "上質で落ち着いた印象";

        resolve({
          file,
          src: reader.result,
          width: img.width,
          height: img.height,
          brightness,
          warmth,
          orientation,
          mood,
        });
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

const detectStyle = (items) => {
  if (!items.length) {
    return { name: "未判定", points: "写真をアップロードすると分析できます。" };
  }

  const avgB = Math.round(items.reduce((s, a) => s + a.brightness, 0) / items.length);
  const avgW = Math.round(items.reduce((s, a) => s + a.warmth, 0) / items.length);

  if (avgB > 170 && avgW > 8) {
    return { name: "ナチュラル", points: "明るさと木質系のあたたかさがあり、やさしい暮らしの雰囲気が伝わります。" };
  }

  if (avgB < 135) {
    return { name: "ホテルライク", points: "陰影があり、落ち着きと上質感を見せやすい写真です。" };
  }

  return { name: "カフェ風", points: "ほどよい明るさと居心地のよさがあり、暮らし寄りの投稿に向いています。" };
};

const photoComment = (a, i) =>
  `写真${i + 1}：${a.orientation}構図・${a.width}×${a.height}px。${a.mood}。`;

const setPairOptions = (count) => {
  const options = ['<option value="">未選択</option>'];
  for (let i = 0; i < count; i += 1) {
    options.push(`<option value="${i}">写真${i + 1}</option>`);
  }
  beforeIndexSelect.innerHTML = options.join("");
  afterIndexSelect.innerHTML = options.join("");
};

const buildHashtags = ({ area, workContent, specialPoint, photoDesc, styleName }) => {
  const candidates = [
    "リフォーム",
    "施工事例",
    normalizeForTag(area),
    normalizeForTag(workContent),
    normalizeForTag(styleName),
    normalizeForTag(specialPoint.split("と")[0] || specialPoint),
    normalizeForTag(photoDesc.split("と")[0] || photoDesc),
    "住まいづくり",
    "横浜リフォーム",
  ].filter(Boolean);

  return [...new Set(candidates)]
    .filter((tag) => tag.length > 1)
    .slice(0, 8)
    .map((tag) => `#${tag}`)
    .join(" ");
};

photoFilesInput.addEventListener("change", async (event) => {
  const files = [...(event.target.files || [])].slice(0, 10);

  gallery.innerHTML = files.length ? "<p>写真を解析中です...</p>" : "";
  analyses = await Promise.all(files.map((file) => analyzeImage(file)));

  gallery.innerHTML = analyses
    .map(
      (a, i) => `
        <article class="thumb">
          <img src="${a.src}" alt="写真${i + 1}" />
          <p>写真${i + 1}</p>
        </article>`
    )
    .join("");

  setPairOptions(analyses.length);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const workContent = document.getElementById("workContent").value.trim();
  const specialPoint = document.getElementById("specialPoint").value.trim();
  const area = document.getElementById("area").value.trim();
  const photoDesc = document.getElementById("photoDesc").value.trim();

  const style = detectStyle(analyses);
  const photoCountText = analyses.length ? `${analyses.length}枚の写真` : "入力内容";

  styleResult.textContent = `${style.name}テイスト｜${style.points}`;
  copyResult.textContent = `「${area}で叶える、${style.name}な${workContent}」`;
  photoSummaryResult.textContent = analyses.length
    ? analyses.map((a, i) => photoComment(a, i)).join("\n")
    : "写真未アップロードのため、入力内容をもとに作成しています。";

  const beforeValue = beforeIndexSelect.value;
  const afterValue = afterIndexSelect.value;

  if (beforeValue !== "" && afterValue !== "" && beforeValue !== afterValue) {
    const before = analyses[Number(beforeValue)];
    const after = analyses[Number(afterValue)];
    const diff = after.brightness - before.brightness;
    comparisonResult.textContent = `施工前（写真${Number(beforeValue) + 1}）から施工後（写真${Number(afterValue) + 1}）へ、${diff >= 0 ? "より明るく開放的" : "落ち着きのある上質"}な印象に変化しています。`;
  } else {
    comparisonResult.textContent = analyses.length >= 2
      ? "施工前後比較をしたい場合は、施工前・施工後の写真番号を選んでください。"
      : "比較するには写真を2枚以上アップロードしてください。";
  }

  carouselResult.textContent = `【${area}｜${workContent}事例】\n\n${photoCountText}から、${style.name}な雰囲気が伝わる施工事例です。\n\n今回のポイントは、${specialPoint}。\n${photoDesc}を意識しながら、見た目だけでなく毎日の使いやすさも大切にしました。\n\n小さな違和感や使いにくさも、リフォームでぐっと快適になります。`;

  reelResult.textContent = `${area}の${workContent}事例。\n${specialPoint}を大切に、${style.name}な空間へ。\n暮らしやすさと見た目、どちらも整えるリフォームです。`;

  noteResult.textContent = `${area}で行った${workContent}の施工事例をご紹介します。\n\n今回大切にしたのは「${specialPoint}」。写真からは、${style.points}\n\n${photoDesc}という印象を活かしながら、日々の暮らしの中で使いやすさを感じられるように整えました。\n\nリフォームは、見た目を変えるだけではなく、毎日の小さなストレスを減らすことにもつながります。ワイズプランニングでは、暮らし方に合わせて、やった方がいいこと・無理にやらなくてもいいことを整理しながらご提案しています。`;

  hashtagResult.textContent = buildHashtags({ area, workContent, specialPoint, photoDesc, styleName: style.name });
});
