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

let analyses = [];

const setMessage = (message) => {
  styleResult.textContent = message;
  copyResult.textContent = "-";
  photoSummaryResult.textContent = "-";
  comparisonResult.textContent = "-";
  carouselResult.textContent = "-";
  reelResult.textContent = "-";
  noteResult.textContent = "-";
};

const analyzeImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error("画像読み込みに失敗しました"));
  reader.onload = () => {
    const img = new Image();
    img.onerror = () => reject(new Error("画像解析に失敗しました"));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.min(320, img.width));
      canvas.height = Math.max(1, Math.min(320, img.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvasが利用できません"));
        return;
      }

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
      resolve({
        src: reader.result,
        width: img.width,
        height: img.height,
        brightness: Math.round(bright / px),
        warmth: Math.round(warm / px),
        orientation: img.width >= img.height ? "横" : "縦",
const form = document.getElementById("postForm");
const photoFileInput = document.getElementById("photoFile");
const previewArea = document.getElementById("previewArea");
const photoPreview = document.getElementById("photoPreview");
const photoMeta = document.getElementById("photoMeta");
const analysisResult = document.getElementById("analysisResult");
const titleResult = document.getElementById("titleResult");
const captionResult = document.getElementById("captionResult");
const hashtagResult = document.getElementById("hashtagResult");

let photoAnalysis = "写真未アップロード";
let uploadedPhotoInfo = null;

const normalizeForTag = (text) => text.replace(/\s+/g, "").replace(/[、。,.!！?？「」【】（）()]/g, "");

const suggestStyleTag = (brightness) => {
  if (brightness >= 180) return "#明るい空間";
  if (brightness >= 130) return "#ナチュラルデザイン";
  return "#落ち着く空間";
};

const analyzeImage = (file) => new Promise((resolve) => {
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

      let bright = 0, warm = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        bright += (r + g + b) / 3;
        warm += (r - b);
      }
      const px = data.length / 4;
      const brightness = Math.round(bright / px);
      const warmth = Math.round(warm / px);
      const orientation = img.width >= img.height ? "横" : "縦";
      resolve({ file, src: reader.result, width: img.width, height: img.height, brightness, warmth, orientation });
      canvas.width = Math.min(img.width, 300);
      canvas.height = Math.min(img.height, 300);
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const brightness = Math.round(sum / (data.length / 4));

      const orientation = img.width >= img.height ? "横" : "縦";
      const mood = brightness > 150 ? "明るく開放感のある印象" : "落ち着きと上質感のある印象";

      resolve({
        width: img.width,
        height: img.height,
        orientation,
        brightness,
        mood,
      });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

const detectStyle = (items) => {
  const avgB = Math.round(items.reduce((sum, item) => sum + item.brightness, 0) / items.length);
  const avgW = Math.round(items.reduce((sum, item) => sum + item.warmth, 0) / items.length);

  if (avgB >= 170 && avgW >= 8) {
    return { name: "ナチュラル", points: "明るさと温かみがあり、木質感を感じるやさしい空間です。" };
  }
  if (avgB <= 140) {
    return { name: "ホテルライク", points: "陰影が美しく、上質で落ち着いた雰囲気にまとまっています。" };
  }
  return { name: "カフェ風", points: "程よい明るさとラフさがあり、居心地のよい空間になっています。" };
};

const photoComment = (item, index) => {
  const mood = item.brightness >= 160 ? "明るく開放的" : "落ち着いて上品";
  return `写真${index + 1}：${item.orientation}構図（${item.width}×${item.height}px）。明るさ${item.brightness}で、${mood}な印象。`;
};

const setPairOptions = (count) => {
  const options = ['<option value="">未選択</option>'];
  for (let i = 0; i < count; i += 1) {
    options.push(`<option value="${i}">写真${i + 1}</option>`);
  }
  const avgB = Math.round(items.reduce((s, a) => s + a.brightness, 0) / items.length);
  const avgW = Math.round(items.reduce((s, a) => s + a.warmth, 0) / items.length);

  if (avgB > 170 && avgW > 8) {
    return { name: "ナチュラル", points: "明るさと木質系のあたたかさが出ており、やさしい住空間の印象です。" };
  }
  if (avgB < 140) {
    return { name: "ホテルライク", points: "陰影のコントラストがあり、落ち着きと上質感を演出できています。" };
  }
  return { name: "カフェ風", points: "程よい明るさと生活感のバランスがあり、居心地のよい雰囲気です。" };
};

const photoComment = (a, i) => `写真${i + 1}：${a.orientation}構図で${a.width}×${a.height}px。明るさ${a.brightness}で、${a.brightness > 160 ? "開放感" : "落ち着き"}のあるカット。`;

const setPairOptions = (count) => {
  const options = ['<option value="">未選択</option>'];
  for (let i = 0; i < count; i += 1) options.push(`<option value="${i}">写真${i + 1}</option>`);
  beforeIndexSelect.innerHTML = options.join("");
  afterIndexSelect.innerHTML = options.join("");
};

photoFilesInput.addEventListener("change", async (event) => {
  const files = [...(event.target.files ?? [])];
  if (!files.length) {
    analyses = [];
    gallery.innerHTML = "";
    setPairOptions(0);
    setMessage("写真を1枚以上アップロードしてください。");
    return;
  }

  const targetFiles = files.slice(0, 10);
  if (files.length > 10) {
    alert("写真は最大10枚までです。先頭10枚を読み込みます。");
  }

  try {
    analyses = await Promise.all(targetFiles.map((file) => analyzeImage(file)));
  } catch (error) {
    analyses = [];
    gallery.innerHTML = "";
    setPairOptions(0);
    setMessage(error.message);
    return;
  }

  gallery.innerHTML = analyses
    .map((item, index) => `
      <article class="thumb">
        <img src="${item.src}" alt="写真${index + 1}" />
        <p>写真${index + 1}</p>
      </article>`)
    .join("");

  setPairOptions(analyses.length);
  styleResult.textContent = `${analyses.length}枚の写真を読み込みました。`;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!analyses.length) {
    setMessage("先に写真をアップロードしてください。");
    return;
  }

photoFilesInput.addEventListener("change", async (e) => {
  const files = [...(e.target.files || [])].slice(0, 10);
  analyses = await Promise.all(files.map((f) => analyzeImage(f)));

  gallery.innerHTML = analyses.map((a, i) => `
    <article class="thumb">
      <img src="${a.src}" alt="写真${i + 1}" />
      <p>写真${i + 1}</p>
    </article>`).join("");

  setPairOptions(analyses.length);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
photoFileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  photoPreview.src = imageUrl;
  previewArea.hidden = false;

  const result = await analyzeImage(file);
  uploadedPhotoInfo = result;

  photoMeta.textContent = `ファイル: ${file.name} / ${result.width}×${result.height}px`;
  photoAnalysis = `写真解析：${result.orientation}写真、明るさ${result.brightness}、${result.mood}。`;
  analysisResult.textContent = photoAnalysis;
});

const buildOptimizedHashtags = ({ area, workContent, specialPoint, photoDesc, brightness }) => {
  const candidates = [
    "リフォーム",
    "施工事例",
    normalizeForTag(area),
    normalizeForTag(workContent),
    normalizeForTag(specialPoint.split("と")[0] || specialPoint),
    normalizeForTag(photoDesc.split("と")[0] || photoDesc),
    brightness ? (brightness > 150 ? "明るい空間" : "上質インテリア") : "住まいづくり",
    "リノベーション",
    "内装デザイン",
  ].filter(Boolean);

  const unique = [...new Set(candidates)].filter((t) => t.length > 1);
  return unique.slice(0, 5).map((tag) => `#${tag}`);
};
const normalizeForTag = (text) => text.replace(/\s+/g, "").replace(/[、。,.!！?？]/g, "");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const workContent = document.getElementById("workContent").value.trim();
  const specialPoint = document.getElementById("specialPoint").value.trim();
  const area = document.getElementById("area").value.trim();
  const photoDesc = document.getElementById("photoDesc").value.trim();

  const style = detectStyle(analyses);
  styleResult.textContent = `${style.name}テイスト｜${style.points}`;
  copyResult.textContent = `「${area}で叶える、${style.name}な${workContent}」`;
  photoSummaryResult.textContent = analyses.map((item, index) => photoComment(item, index)).join("\n");

  const before = beforeIndexSelect.value;
  const after = afterIndexSelect.value;
  if (before !== "" && after !== "" && before !== after) {
    const beforePhoto = analyses[Number(before)];
    const afterPhoto = analyses[Number(after)];
    const diff = afterPhoto.brightness - beforePhoto.brightness;
    const tone = diff >= 0 ? "より明るく開放的" : "より落ち着いた上質";
    comparisonResult.textContent = `施工前（写真${Number(before) + 1}）→施工後（写真${Number(after) + 1}）で、${tone}な空間へ変化。`;
  if (!analyses.length) {
    styleResult.textContent = "写真を1枚以上アップロードしてください。";
    return;
  }

  const style = detectStyle(analyses);
  styleResult.textContent = `${style.name}テイスト｜${style.points}`;
  copyResult.textContent = `「${area}で叶える、${style.name}な${workContent}」`;
  photoSummaryResult.textContent = analyses.map((a, i) => photoComment(a, i)).join("\n");

  const b = beforeIndexSelect.value;
  const a = afterIndexSelect.value;
  if (b !== "" && a !== "" && b !== a) {
    const before = analyses[Number(b)];
    const after = analyses[Number(a)];
    comparisonResult.textContent = `施工前（写真${Number(b) + 1}）は明るさ${before.brightness}。施工後（写真${Number(a) + 1}）は明るさ${after.brightness}で、${after.brightness - before.brightness >= 0 ? "より明るく開放的" : "落ち着いた上質"}な印象に変化しました。`;
  } else {
    comparisonResult.textContent = "施工前後比較を行うには、異なる写真番号を選択してください。";
  }

  carouselResult.textContent = `【${area}｜${workContent}】\n1枚目：全体\n2枚目：こだわりポイント\n3枚目：使いやすさの工夫\n${specialPoint}を軸に、${photoDesc}を実現しました。`;
  reelResult.textContent = `${area}の${workContent}。${style.name}テイストで、${specialPoint}をカタチに。#リフォーム #施工事例`;
  noteResult.textContent = `${area}で行った${workContent}の事例です。テーマは「${style.name}」。${style.points} お客様のご要望「${specialPoint}」を実現するため、導線・収納・素材選定を丁寧に設計しました。${analyses.length}枚の写真を通じて、空間の統一感と使いやすさが伝わる仕上がりです。${photoDesc}も意識し、暮らしやすさとデザイン性を両立しました。`;
});

setMessage("写真をアップロードすると分析結果を表示します。");
  carouselResult.textContent = `【${area}｜${workContent}事例】\n1枚目: 完成全体\n2枚目: こだわりポイント\n3枚目: 使い勝手の改善\n${specialPoint}を軸に、${photoDesc}を実現しました。`;
  reelResult.textContent = `${area}の${workContent}事例。${style.name}テイストで、${specialPoint}を形に。#リフォーム #施工事例`;
  noteResult.textContent = `${area}で実施した${workContent}についてご紹介します。今回の設計テーマは「${style.name}」。${style.points} 施主様のご要望である「${specialPoint}」を満たすため、動線・収納・素材の3点を重点的に調整しました。写真からも、${analyses.length}枚を通して空間の統一感が伝わります。${photoDesc}を意識しながら、日常の使いやすさとデザイン性を両立した施工を行いました。`;
  }
);
  const title = `【${area}】${workContent}事例｜${specialPoint.slice(0, 14)}...`;

  const styleTag = suggestStyleTag(uploadedPhotoInfo?.brightness ?? 160);
  const analyzedText = uploadedPhotoInfo
    ? `${photoAnalysis} 写真からは「${uploadedPhotoInfo.mood}」な空間づくりが伝わります。`
    : "写真未アップロードのため、入力内容をもとに投稿文を作成しています。";

  const caption = `${area}で行った「${workContent}」の施工事例をご紹介します。

こだわりポイントは、${specialPoint}。
写真では、${photoDesc}をご覧いただけます。
${analyzedText}

暮らしやすさとデザイン性を両立するリフォームをご提案しています。
気になる方はお気軽にご相談ください。`;

  const hashtags = buildOptimizedHashtags({
    area,
    workContent,
    specialPoint,
    photoDesc,
    brightness: uploadedPhotoInfo?.brightness,
  });

  const mergedTags = [...hashtags, styleTag].slice(0, 5);

  titleResult.textContent = title;
  captionResult.textContent = caption;
  hashtagResult.textContent = mergedTags.join(" ");
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
