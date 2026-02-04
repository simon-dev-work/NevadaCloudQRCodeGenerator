document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("urlInput");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const qrContainer = document.getElementById("qrOutput");

  const qrColorInput = document.getElementById("qrColor");
  const qrColorValue = document.getElementById("qrColorValue");

  const radiusInput = document.getElementById("rad");
  const radValueDisplay = document.getElementById("radValue");

  let hasGenerated = false;

  const size = 220;
  const padding = 10;

  // keep UI honest on load
  qrColorValue.textContent = qrColorInput.value;
  radValueDisplay.textContent = radiusInput.value;

  const buildUtmUrl = (input) => {
    let url;

    try {
      url = new URL(input);
    } catch {
      return input;
    }

    const hostname = url.hostname.replace("www.", "");
    const path = url.pathname.split("/").filter(Boolean).join("-") || "root";

    const utmParams = {
      utm_source: "nevadacloud",
      utm_medium: "qrcode",
      utm_campaign: hostname,
      utm_id: Date.now().toString(),
    };

    Object.entries(utmParams).forEach(([key, value]) => {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  };

  const generateQR = () => {
    const rawInput = urlInput.value.trim();
    if (!rawInput) {
      alert("Enter a URL or text first");
      return;
    }

    const text = buildUtmUrl(rawInput);
    qrContainer.innerHTML = "";

    const rawRadius = parseInt(radiusInput.value, 10);
    const calculatedRadius = rawRadius / 100;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;

    QrCreator.render(
      {
        text,
        radius: calculatedRadius,
        ecLevel: "H",
        fill: qrColorInput.value,
        background: null,
        size,
      },
      tempCanvas,
    );

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = size + padding * 2;
    finalCanvas.height = size + padding * 2;

    const ctx = finalCanvas.getContext("2d");
    ctx.drawImage(tempCanvas, padding, padding);

    qrContainer.appendChild(finalCanvas);

    hasGenerated = true;
    downloadBtn.removeAttribute("disabled");
  };

  generateBtn.addEventListener("click", generateQR);

  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") generateQR();
  });

  radiusInput.addEventListener("input", (e) => {
    radValueDisplay.textContent = e.target.value;
    if (hasGenerated) generateQR();
  });

  qrColorInput.addEventListener("input", () => {
    qrColorValue.textContent = qrColorInput.value;
    if (hasGenerated) generateQR();
  });

  downloadBtn.addEventListener("click", () => {
    const canvas = qrContainer.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
