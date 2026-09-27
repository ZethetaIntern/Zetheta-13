import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Check,
  PenTool,
  Type,
  Upload,
  Undo2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import ErrorMessage from './ErrorMessage';

const INK_COLORS = [
  { id: 'navy', label: "Banker's Navy", color: '#1F4E79' },
  { id: 'black', label: 'Classic Black', color: '#0f172a' },
  { id: 'royal', label: 'Royal Blue', color: '#1d4ed8' },
];

const SIGNATURE_STYLES = [
  { id: 'dancing', name: 'Fluid Script', font: "'Dancing Script', cursive", size: '28px' },
  { id: 'greatvibes', name: 'Formal Calligraphy', font: "'Great Vibes', cursive", size: '32px' },
  { id: 'caveat', name: 'Natural Pen', font: "'Caveat', cursive", size: '30px' },
  { id: 'formal', name: 'Executive Cursive', font: 'Georgia, serif', size: '24px', italic: true },
];

const SignatureCanvas = ({
  id = 'signature-canvas',
  label = 'Digital E-Signature',
  required = false,
  value, // base64 string
  onChange,
  error,
  helpText = 'Draw using touch/mouse, type your legal name, or upload a photo of your signature.',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'type' | 'upload'
  const [inkColor, setInkColor] = useState('#1F4E79');
  const [penWidth, setPenWidth] = useState(2.5);
  const [typedName, setTypedName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('dancing');
  const [strokeHistory, setStrokeHistory] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!value);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Redraw canvas from stroke history
  const redrawCanvas = useCallback(
    (strokes) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      strokes.forEach((stroke) => {
        if (!stroke.points || stroke.points.length === 0) return;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {
          const prev = stroke.points[i - 1];
          const curr = stroke.points[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.stroke();
      });
    },
    []
  );

  // Initialize canvas with proper resolution
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    if (strokeHistory.length > 0) {
      redrawCanvas(strokeHistory);
    } else if (value && activeTab === 'draw') {
      const img = new Image();
      img.src = value;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
    }
  }, [redrawCanvas, strokeHistory, value, activeTab]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Canvas drawing coordinate helper
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    setIsDrawing(true);
    const newStroke = {
      color: inkColor,
      width: penWidth,
      points: [coords],
    };
    setCurrentStroke(newStroke);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    setCurrentStroke((prev) => ({
      ...prev,
      points: [...prev.points, coords],
    }));
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke && currentStroke.points && currentStroke.points.length > 0) {
      const updated = [...strokeHistory, currentStroke];
      setStrokeHistory(updated);
    }
    setHasDrawn(true);

    const canvas = canvasRef.current;
    if (canvas && onChange) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) return;
    const updated = strokeHistory.slice(0, -1);
    setStrokeHistory(updated);
    redrawCanvas(updated);

    if (updated.length === 0) {
      setHasDrawn(false);
      if (onChange) onChange('');
    } else {
      const canvas = canvasRef.current;
      if (canvas && onChange) {
        onChange(canvas.toDataURL('image/png'));
      }
    }
  };

  const handleClear = () => {
    setStrokeHistory([]);
    setCurrentStroke([]);
    setHasDrawn(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (onChange) onChange('');
  };

  // Type mode adoption: render typed signature to an offscreen canvas
  const handleAdoptTyped = (styleObj) => {
    const textToRender = (typedName || 'Borrower Signature').trim();
    if (!textToRender) return;

    setSelectedStyle(styleObj.id);

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${styleObj.italic ? 'italic ' : ''}${styleObj.size} ${styleObj.font}`;
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillText(textToRender, 300, 100);

    const dataUrl = canvas.toDataURL('image/png');
    setHasDrawn(true);
    if (onChange) onChange(dataUrl);
  };

  // Upload signature handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG or JPG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Scale maintaining aspect ratio
        const scale = Math.min(540 / img.width, 160 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        setHasDrawn(true);
        if (onChange) onChange(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {/* Header with Label and Status */}
      <div className="flex items-center justify-between mb-2">
        {label ? (
          <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
            {label}
            {required && <span className="text-brand-red ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </label>
        ) : (
          <div />
        )}

        {value && hasDrawn && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <Check className="w-3.5 h-3.5" />
            Signature Captured
          </span>
        )}
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="rounded-2xl border-2 border-slate-300 bg-white shadow-sm overflow-hidden transition-all focus-within:border-brand-blue"
      >
        {/* Navigation Mode Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('draw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'draw'
                  ? 'bg-white text-brand-blue shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Draw
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('type')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'type'
                  ? 'bg-white text-brand-blue shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Type
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-brand-blue shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
          </div>

          {/* Color Palettes for Draw / Type */}
          {(activeTab === 'draw' || activeTab === 'type') && (
            <div className="flex items-center gap-1.5 pl-2">
              <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">Ink:</span>
              {INK_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setInkColor(c.color)}
                  aria-label={c.label}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    inkColor === c.color ? 'scale-110 ring-2 ring-blue-300' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color, borderColor: '#ffffff' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: DRAW SIGNATURE */}
        {activeTab === 'draw' && (
          <div className="p-4 space-y-3">
            <div className="relative rounded-xl border border-dashed border-slate-300 bg-slate-50/70 overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                id={id}
                className="w-full h-44 touch-none cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                tabIndex={0}
                aria-label="Draw your signature inside this box"
              />

              {/* Legal Signing Baseline */}
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 select-none">✕</span>
                <div className="flex-1 border-b-2 border-dashed border-slate-300" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                  Sign on or above line
                </span>
              </div>
            </div>

            {/* Canvas Action Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Pen width:</span>
                {[1.5, 2.5, 4.0].map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setPenWidth(w)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      penWidth === w
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {w === 1.5 ? 'Fine' : w === 2.5 ? 'Medium' : 'Bold'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={strokeHistory.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!hasDrawn && strokeHistory.length === 0}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-brand-red hover:text-red-700 border border-red-200 bg-red-50 hover:bg-red-100/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TYPE SIGNATURE */}
        {activeTab === 'type' && (
          <div className="p-5 space-y-4">
            <div>
              <label htmlFor="typed-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Type Your Legal Full Name
              </label>
              <input
                id="typed-name-input"
                type="text"
                placeholder="e.g. Rajesh Kumar Sharma"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2">
                Click a signature style below to adopt:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SIGNATURE_STYLES.map((style) => {
                  const isSelected = selectedStyle === style.id && value;
                  return (
                    <button
                      type="button"
                      key={style.id}
                      onClick={() => handleAdoptTyped(style)}
                      className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center relative min-h-[90px] ${
                        isSelected
                          ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-1 ring-brand-blue/30'
                          : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span
                        className="truncate max-w-full"
                        style={{
                          fontFamily: style.font,
                          fontSize: style.size,
                          color: inkColor,
                          fontStyle: style.italic ? 'italic' : 'normal',
                        }}
                      >
                        {typedName.trim() || 'Your Signature'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium">{style.name}</span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-brand-blue">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD SIGNATURE IMAGE */}
        {activeTab === 'upload' && (
          <div className="p-5 space-y-3">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-white transition-colors cursor-pointer flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-brand-blue mb-2" />
              <p className="text-xs font-bold text-slate-700">Upload signature photo or scan</p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPG or PNG with white paper background</p>
              <label
                htmlFor={`${id}-file-upload`}
                className="mt-3 px-4 py-1.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Browse File
                <input
                  id={`${id}-file-upload`}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        )}

        {/* Adopted Signature Summary Preview Card */}
        {value && (
          <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span className="text-slate-600 font-medium">
                Digital Sign-off Affixed (Sec 3A, IT Act 2000)
              </span>
            </div>
            <img
              src={value}
              alt="Current Signature Preview"
              className="h-8 max-w-[140px] object-contain border border-slate-200 rounded bg-white px-2 py-0.5 shadow-xs"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500">
        <p>{helpText}</p>
      </div>

      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default SignatureCanvas;
