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
