import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from 'figma:asset/aa852c10b58b8c409eb77dc48dc405105bc01c1f.png';
import { Copy, Check, Palette, Pipette } from 'lucide-react';

interface Color {
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
}

const brandColors: Color[] = [
  {
    name: 'QMS Burgundy',
    hex: '#6B1946',
    rgb: 'rgb(107, 25, 70)',
    hsl: 'hsl(327, 62%, 26%)'
  },
  {
    name: 'QMS Deep Wine',
    hex: '#8B2558',
    rgb: 'rgb(139, 37, 88)',
    hsl: 'hsl(330, 58%, 35%)'
  },
  {
    name: 'QMS Rose',
    hex: '#A83C6B',
    rgb: 'rgb(168, 60, 107)',
    hsl: 'hsl(334, 47%, 45%)'
  },
  {
    name: 'Pure White',
    hex: '#FFFFFF',
    rgb: 'rgb(255, 255, 255)',
    hsl: 'hsl(0, 0%, 100%)'
  },
  {
    name: 'Soft Gray',
    hex: '#F5F5F5',
    rgb: 'rgb(245, 245, 245)',
    hsl: 'hsl(0, 0%, 96%)'
  },
  {
    name: 'Charcoal',
    hex: '#2D2D2D',
    rgb: 'rgb(45, 45, 45)',
    hsl: 'hsl(0, 0%, 18%)'
  }
];

export function ColorPalette() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const getColorValue = (color: Color) => {
    switch (selectedFormat) {
      case 'rgb':
        return color.rgb;
      case 'hsl':
        return color.hsl;
      default:
        return color.hex;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <ImageWithFallback 
              src={logo} 
              alt="QMS Logo" 
              className="w-64 h-auto"
            />
          </div>
        </div>
        <h1 className="text-5xl mb-4 text-slate-800">
          QMS Brand Colors
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Your professional color palette inspired by the QMS brand identity
        </p>
      </div>

      {/* Format Selector */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedFormat('hex')}
          className={`px-6 py-3 rounded-xl transition-all ${
            selectedFormat === 'hex'
              ? 'bg-[#6B1946] text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          HEX
        </button>
        <button
          onClick={() => setSelectedFormat('rgb')}
          className={`px-6 py-3 rounded-xl transition-all ${
            selectedFormat === 'rgb'
              ? 'bg-[#6B1946] text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          RGB
        </button>
        <button
          onClick={() => setSelectedFormat('hsl')}
          className={`px-6 py-3 rounded-xl transition-all ${
            selectedFormat === 'hsl'
              ? 'bg-[#6B1946] text-white shadow-lg'
              : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          HSL
        </button>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {brandColors.map((color) => (
          <div
            key={color.name}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
          >
            {/* Color Preview */}
            <div
              className="h-48 relative group cursor-pointer"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(getColorValue(color), color.name)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Pipette className="w-12 h-12 text-white/0 group-hover:text-white/80 transition-colors" />
              </div>
            </div>

            {/* Color Info */}
            <div className="p-6">
              <h3 className="text-xl mb-4 text-slate-800">
                {color.name}
              </h3>
              
              <div className="space-y-3">
                {/* HEX */}
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">HEX</div>
                    <code className="text-sm text-slate-800">{color.hex}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.hex, `${color.name}-hex`)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedColor === `${color.name}-hex` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* RGB */}
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">RGB</div>
                    <code className="text-sm text-slate-800">{color.rgb}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.rgb, `${color.name}-rgb`)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedColor === `${color.name}-rgb` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* HSL */}
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">HSL</div>
                    <code className="text-sm text-slate-800">{color.hsl}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.hsl, `${color.name}-hsl`)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedColor === `${color.name}-hsl` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Color Combinations Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-[#6B1946]" />
          <h2 className="text-2xl text-slate-800">Color Combinations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Combination */}
          <div className="rounded-xl overflow-hidden shadow-md">
            <div className="bg-[#6B1946] text-white p-8">
              <h3 className="text-2xl mb-2">Primary Brand</h3>
              <p className="text-white/90">Burgundy on White</p>
            </div>
            <div className="bg-white p-8 border-t-4 border-[#6B1946]">
              <p className="text-slate-700">
                Perfect for headers, buttons, and key brand elements
              </p>
            </div>
          </div>

          {/* Secondary Combination */}
          <div className="rounded-xl overflow-hidden shadow-md">
            <div className="bg-[#8B2558] text-white p-8">
              <h3 className="text-2xl mb-2">Secondary Accent</h3>
              <p className="text-white/90">Deep Wine Palette</p>
            </div>
            <div className="bg-[#F5F5F5] p-8 border-t-4 border-[#8B2558]">
              <p className="text-slate-700">
                Ideal for accents, highlights, and secondary elements
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-slate-500">
        <p>Click any color swatch or copy button to copy to clipboard</p>
      </div>
    </div>
  );
}
