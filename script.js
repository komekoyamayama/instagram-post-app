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
  } else {
    comparisonResult.textContent = "施工前後比較を行うには、異なる写真番号を選択してください。";
  }

  carouselResult.textContent = `【${area}｜${workContent}】\n1枚目：全体\n2枚目：こだわりポイント\n3枚目：使いやすさの工夫\n${specialPoint}を軸に、${photoDesc}を実現しました。`;
  reelResult.textContent = `${area}の${workContent}。${style.name}テイストで、${specialPoint}をカタチに。#リフォーム #施工事例`;
  noteResult.textContent = `${area}で行った${workContent}の事例です。テーマは「${style.name}」。${style.points} お客様のご要望「${specialPoint}」を実現するため、導線・収納・素材選定を丁寧に設計しました。${analyses.length}枚の写真を通じて、空間の統一感と使いやすさが伝わる仕上がりです。${photoDesc}も意識し、暮らしやすさとデザイン性を両立しました。`;
});

setMessage("写真をアップロードすると分析結果を表示します。");
