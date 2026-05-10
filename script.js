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
