import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  title?: string;
  showDownload?: boolean;
}

export function QRCodeGenerator({ value, size = 200, title, showDownload = true }: QRCodeGeneratorProps) {
  const handleDownload = () => {
    const svg = document.getElementById(`qr-code-${value}`) as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${value}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <p className="text-sm text-slate-600 text-center">{title}</p>}
      <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
        <QRCodeSVG
          id={`qr-code-${value}`}
          value={value}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>
      {showDownload && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          Download QR Code
        </button>
      )}
    </div>
  );
}
