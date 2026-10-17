/**
 * Gerador de Código de Barras Code 128 (Padrão Logístico)
 * Gera SVG vetorial puro, sem dependências externas e 100% compatível com impressão térmica.
 */

(function (window) {
  'use strict';

  // Tabela de padrões do Code 128 (107 caracteres, 11 módulos cada, exceto Stop que tem 13)
  const CODE128_PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
  ];

  const START_B = 104;
  const STOP = 106;

  function encodeCode128B(text) {
    const codes = [START_B];
    let checksum = START_B;

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const val = charCode - 32;
      if (val < 0 || val > 95) {
        // Fallback para caracteres fora do Code B padrão
        codes.push(0);
        checksum += 0 * (i + 1);
      } else {
        codes.push(val);
        checksum += val * (i + 1);
      }
    }

    const checkDigit = checksum % 103;
    codes.push(checkDigit);
    codes.push(STOP);
    return codes;
  }

  function generateCode128Svg(text, options = {}) {
    const barWidth = options.barWidth || 2;
    const height = options.height || 60;
    const showText = options.showText !== false;
    const cleanText = (text || '').trim().toUpperCase();

    if (!cleanText) return '';

    const codes = encodeCode128B(cleanText);
    let patternString = '';

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const pattern = CODE128_PATTERNS[code];
      if (pattern) {
        patternString += pattern;
      }
    }

    // Converter string de larguras em retângulos SVG
    let x = 10; // margem esquerda
    let isBar = true;
    let rects = '';

    for (let i = 0; i < patternString.length; i++) {
      const width = parseInt(patternString[i], 10) * barWidth;
      if (isBar) {
        rects += `<rect x="${x}" y="0" width="${width}" height="${height}" fill="#000000" />`;
      }
      x += width;
      isBar = !isBar;
    }

    const totalWidth = x + 10;
    const totalHeight = showText ? height + 18 : height;
    const textY = height + 14;

    const textSvg = showText
      ? `<text x="${totalWidth / 2}" y="${textY}" font-family="'Consolas', 'Courier New', monospace" font-size="12" font-weight="700" text-anchor="middle" fill="#000000" letter-spacing="1.5">${cleanText}</text>`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="${totalHeight}" style="max-width: ${totalWidth}px; display: block; margin: 0 auto;">
      <rect width="100%" height="100%" fill="#ffffff" />
      ${rects}
      ${textSvg}
    </svg>`;
  }

  window.Barcode128 = {
    renderSvg: generateCode128Svg
  };
})(window);
