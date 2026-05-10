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
