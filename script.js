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

        resolve({
          file,
          src: reader.result,
          brightness,
          warmth,
        });
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

const detectStyle = (items) => {
  if (!items.length) {
    return {
      name: "ナチュラル",
      mood: "やわらかく暮らしに馴染む雰囲気",
    };
  }

  const avgB = Math.round(items.reduce((s, a) => s + a.brightness, 0) / items.length);
  const avgW = Math.round(items.reduce((s, a) => s + a.warmth, 0) / items.length);

  if (avgB > 170 && avgW > 8) {
    return {
      name: "ナチュラル",
      mood: "木のやわらかさを感じる、暮らし寄りの空気感",
    };
  }

  if (avgB < 135) {
    return {
      name: "ホテルライク",
      mood: "陰影を活かした上質で落ち着いた雰囲気",
    };
  }

  return {
    name: "カフェ風",
    mood: "居心地の良さを感じるカフェのような空気感",
  };
};

const buildHashtags = ({ area, workContent, styleName }) => {
  const tags = [
    "リフォーム",
    "施工事例",
    normalizeForTag(area),
    normalizeForTag(workContent),
    normalizeForTag(styleName),
    "暮らしを整える",
    "横浜リフォーム",
    "ワイズプランニング",
  ];

  return [...new Set(tags)]
    .filter(Boolean)
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

  const options = ['<option value="">未選択</option>'];

  for (let i = 0; i < analyses.length; i += 1) {
    options.push(`<option value="${i}">写真${i + 1}</option>`);
  }

  beforeIndexSelect.innerHTML = options.join("");
  afterIndexSelect.innerHTML = options.join("");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const workContent = document.getElementById("workContent").value.trim();
  const specialPoint = document.getElementById("specialPoint").value.trim();
  const area = document.getElementById("area").value.trim();
  const photoDesc = document.getElementById("photoDesc").value.trim();

  const style = detectStyle(analyses);

  styleResult.textContent = `${style.name}｜${style.mood}`;

  copyResult.textContent = `「なんとなく使いづらい」を、毎日ちょっと気分が上がる${workContent}へ。`;

  photoSummaryResult.textContent = `写真全体から、${style.mood}が伝わる印象です。\n生活感を残しつつ、整った雰囲気に見せやすい施工写真です。`;

  comparisonResult.textContent = `施工前後で、空間の印象だけでなく「暮らしやすさ」が伝わる変化になっています。`;

  carouselResult.textContent = `【${area}｜${workContent}施工事例】

「なんとなく使いづらい」を、
毎日ちょっと気分が上がる空間へ。

今回は、${specialPoint}を意識しながら、
見た目だけではなく使いやすさも整えました。

写真からも、${style.mood}が伝わる仕上がりに◎

${photoDesc}

リフォームって、
ただ新しくするだけじゃなく、
毎日の小さなストレスを減らすことだと思っています。

ワイズプランニングでは、
「やった方がいいこと」と
「無理にやらなくてもいいこと」も含めて、
暮らしに合わせてご提案しています。`;

  reelResult.textContent = `${workContent}施工事例。

${specialPoint}を大切に、
${style.name}な空間へ。

見た目だけじゃなく、
毎日の使いやすさも整えました◎`;

  noteResult.textContent = `${area}で行った${workContent}の施工事例をご紹介します。

今回ご相談いただいたのは、
「なんとなく使いづらい」というお悩み。

毎日使う場所だからこそ、
小さなストレスって意外と積み重なるんですよね。

今回は、${specialPoint}を意識しながら、
見た目と使いやすさのバランスを整えました。

写真からも、${style.mood}が感じられる仕上がりになっています。

${photoDesc}

ワイズプランニングでは、
職人目線だけでなく、実際の暮らし方も大切にしながらご提案しています。

「これ頼んでいいのかな？」くらいの小さな相談も大歓迎です◎`;

  hashtagResult.textContent = buildHashtags({
    area,
    workContent,
    styleName: style.name,
  });
});
