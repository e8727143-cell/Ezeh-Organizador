import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import './index.css';
import {
  Plus,
  LayoutGrid,
  List,
  Tag,
  Link as LinkIcon,
  FileText,
  Trash2,
  X,
  Clock,
  Filter,
  Video,
  Play,
  Copy,
  Download,
  Image as ImageIcon,
  Sun,
  Moon,
  Calendar,
  ChevronRight,
  Check,
  Settings,
  AlignLeft,
  ChevronLeft
} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';
import {jsPDF} from 'jspdf';

type Theme = 'light' | 'dark';

interface Week {
  name: string;
  color: string;
}

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  script: string;
  category: string;
  day: string;
  createdAt: number;
  publishDate: string;
  description?: string;
  isPublished: boolean;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PRESET_COLORS = ['#DC2626', '#2563EB', '#059669', '#7C3AED', '#DB2777', '#EA580C', '#111827'];

// Optimized Input Components to prevent full app re-renders on every keystroke
const BufferedInput = React.memo(({ value, onSave, className, placeholder, type = "text", min }: any) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);
  return (
    <input 
      type={type}
      min={min}
      value={localValue}
      placeholder={placeholder}
      className={className}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => localValue !== value && onSave(localValue)}
    />
  );
});

const BufferedTextarea = React.memo(({ value, onSave, className, placeholder }: any) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => { setLocalValue(value); }, [value]);
  return (
    <textarea 
      value={localValue}
      placeholder={placeholder}
      className={className}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => localValue !== value && onSave(localValue)}
    />
  );
});

// Optimized Content Card Component
const ContentCard = React.memo(({ item, theme, onClick, onTogglePublish }: { item: ContentItem, theme: string, onClick: () => void, onTogglePublish: (e: React.MouseEvent) => void }) => (
  <motion.div 
    layoutId={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`group rounded-[40px] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col ${
      item.isPublished 
        ? 'bg-emerald-600/5 border-emerald-500/20 hover:border-emerald-500' 
        : theme === 'dark' ? 'bg-black border-red-900/20 hover:border-red-600/50' : 'bg-white border-red-100 hover:border-red-600/50 shadow-xl shadow-red-100/20'
    }`}
  >
    {item.publishDate && !isNaN(new Date(item.publishDate + 'T00:00:00').getTime()) && (
      <div className="px-8 pt-6 pb-2 flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.isPublished ? 'text-emerald-600' : 'text-red-600 opacity-60'}`}>
          {new Date(item.publishDate + 'T00:00:00').toLocaleDateString('es-ES')}
        </span>
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${item.isPublished ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}>
          {item.day}
        </span>
      </div>
    )}

    <div className="relative aspect-video overflow-hidden mx-6 mt-2 rounded-[24px]">
      {item.thumbnail ? (
        <img src={item.thumbnail} loading="lazy" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.isPublished ? '' : 'grayscale group-hover:grayscale-0'}`} referrerPolicy="no-referrer" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <ImageIcon className="w-12 h-12 text-slate-400 opacity-20" />
        </div>
      )}
    </div>
    
    <div className="p-8 pt-6 space-y-6">
      <h4 className={`text-2xl font-black tracking-tighter uppercase italic line-clamp-2 leading-none transition-colors ${item.isPublished ? 'text-emerald-700' : 'group-hover:text-red-600'}`}>
        {item.title || 'Sin Título'}
      </h4>
      
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.isPublished ? 'bg-emerald-500/10 text-emerald-600' : theme === 'dark' ? 'bg-red-900/20 text-red-500' : 'bg-red-50 text-red-600'}`}>
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guión</span>
          <span className={`text-xs font-bold truncate max-w-[150px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            {item.script ? `${item.script.substring(0, 30)}...` : 'Sin guión'}
          </span>
        </div>
      </div>

      <button 
        onClick={onTogglePublish}
        className={`w-full flex items-center gap-3 px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] border-2 ${
          item.isPublished 
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
            : theme === 'dark' ? 'bg-transparent border-red-900/30 text-slate-500 hover:border-red-600/50' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-red-600/50'
        }`}
      >
        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${
          item.isPublished 
            ? 'bg-white border-white text-emerald-600' 
            : 'border-slate-400 text-transparent'
        }`}>
          {item.isPublished && <Check className="w-3 h-3 stroke-[4px]" />}
        </div>
        {item.isPublished ? 'Publicado' : 'Marcar como Publicado'}
      </button>
    </div>
  </motion.div>
));

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('organizer-theme-v4');
      return (saved as Theme) || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const [weeks, setWeeks] = useState<Week[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('organizer-weeks-v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing weeks:', e);
    }
    return [{ name: 'Semana 1', color: '#DC2626' }];
  });
  
  const [items, setItems] = useState<ContentItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('organizer-items-v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.error('Error parsing items:', e);
    }
    return [];
  });
  
  const [selectedCategory, setSelectedCategory] = useState('Semana 1');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [daySelector, setDaySelector] = useState<{ week: string; x: number; y: number } | null>(null);
  const [colorPicker, setColorPicker] = useState<{ week: string; x: number; y: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'item' | 'week' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce localStorage sync to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('organizer-items-v4', JSON.stringify(items));
        localStorage.setItem('organizer-weeks-v4', JSON.stringify(weeks));
        localStorage.setItem('organizer-theme-v4', theme);
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [items, weeks, theme]);

  const addWeek = () => {
    const nextWeekNum = weeks.length + 1;
    const newWeek = { name: `Semana ${nextWeekNum}`, color: '#DC2626' };
    setWeeks([...weeks, newWeek]);
  };

  const updateWeekColor = (weekName: string, color: string) => {
    setWeeks(weeks.map(w => w.name === weekName ? { ...w, color } : w));
    setColorPicker(null);
  };

  const deleteWeek = (weekName: string) => {
    setWeeks(weeks.filter(w => w.name !== weekName));
    setItems(items.filter(i => i.category !== weekName));
    if (selectedCategory === weekName) {
      const remainingWeeks = weeks.filter(w => w.name !== weekName);
      setSelectedCategory(remainingWeeks.length > 0 ? remainingWeeks[0].name : '');
    }
    setConfirmDelete(null);
  };

  const addItem = (week: string, day: string) => {
    const newItem: ContentItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      title: '',
      thumbnail: '',
      script: '',
      category: week,
      day: day,
      createdAt: Date.now(),
      publishDate: new Date().toISOString().split('T')[0],
      isPublished: false,
    };
    setItems([newItem, ...items]);
    setSelectedItemId(newItem.id);
    setDaySelector(null);
  };

  const updateItem = useCallback((id: string, updates: Partial<ContentItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
    setConfirmDelete(null);
  };

  const selectedItem = useMemo(() => items.find(i => i.id === selectedItemId), [items, selectedItemId]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesCategory;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [items, selectedCategory]);

  const currentWeekColor = useMemo(() => {
    return weeks.find(w => w.name === selectedCategory)?.color || '#DC2626';
  }, [weeks, selectedCategory]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedItemId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max width/height 1280px while maintaining aspect ratio
          const maxDim = 1280;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress with 0.7 quality to keep it under limits
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            updateItem(selectedItemId, { thumbnail: compressedBase64 });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    link.click();
  };

  const downloadTxt = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = (text: string, filename: string) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save(filename + '.pdf');
  };

  const downloadSrt = (text: string, filename: string) => {
    // SRT Specs: 30s duration, 15s interval, 500 max chars
    const blocks: string[] = [];
    const words = text.split(/\s+/);
    let currentBlock = "";
    let blockIndex = 1;
    let currentTime = 0;

    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

    words.forEach((word) => {
      if ((currentBlock + " " + word).length > 500) {
        const startTime = formatTime(currentTime);
        const endTime = formatTime(currentTime + 30);
        blocks.push(`${blockIndex}\n${startTime} --> ${endTime}\n${currentBlock.trim()}\n`);
        
        currentTime += 30 + 15;
        currentBlock = word;
        blockIndex++;
      } else {
        currentBlock += (currentBlock ? " " : "") + word;
      }
    });

    if (currentBlock) {
      const startTime = formatTime(currentTime);
      const endTime = formatTime(currentTime + 30);
      blocks.push(`${blockIndex}\n${startTime} --> ${endTime}\n${currentBlock.trim()}\n`);
    }

    const blob = new Blob([blocks.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.srt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`flex h-screen font-sans selection:bg-red-500 selection:text-white overflow-hidden relative transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Real Vertical Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 border-r flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'dark' ? 'bg-black border-red-900/30' : 'bg-white border-red-100'}`}>
        <div className="p-6 border-b flex items-center justify-between shrink-0 border-red-500/10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tighter uppercase italic whitespace-nowrap">
              Ezeh <span className="text-red-600">Organizador</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-900/20 text-red-500' : 'hover:bg-red-50 text-red-600'}`}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-red-50 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 space-y-8 overflow-y-auto">
          <div>
            <button 
              onClick={addWeek}
              className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/20 mb-8"
            >
              Añadir Semana
            </button>
            
            <div className="space-y-2">
              {weeks.map(week => (
                <div key={week.name} className="group relative">
                  <button 
                    onClick={() => { setSelectedCategory(week.name); setSelectedItemId(null); setIsSidebarOpen(false); }}
                    className={`w-full text-left pl-5 pr-28 py-4 rounded-2xl text-sm font-bold transition-all flex items-center group/btn ${selectedCategory === week.name && !selectedItemId ? 'text-white shadow-lg' : theme === 'dark' ? 'text-slate-400 hover:bg-red-900/10' : 'text-slate-600 hover:bg-red-50'}`}
                    style={{ 
                      backgroundColor: selectedCategory === week.name && !selectedItemId ? week.color : 'transparent',
                      borderLeft: selectedCategory !== week.name || selectedItemId ? `4px solid ${week.color}` : 'none',
                      boxShadow: selectedCategory === week.name && !selectedItemId ? `0 10px 15px -3px ${week.color}33` : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: selectedCategory === week.name && !selectedItemId ? 'white' : week.color }}
                      />
                      <span className="uppercase tracking-wider">
                        {week.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${selectedCategory === week.name && !selectedItemId ? 'bg-white/20' : theme === 'dark' ? 'bg-red-900/20 text-red-500' : 'bg-red-50 text-red-600'}`}>
                        {items.filter(i => i.category === week.name).length}
                      </span>
                    </div>
                  </button>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setColorPicker({ week: week.name, x: rect.left, y: rect.top });
                      }}
                      className={`p-1.5 rounded-lg transition-all ${selectedCategory === week.name ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-red-50'}`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDaySelector({ week: week.name, x: rect.left, y: rect.top });
                      }}
                      className={`p-1.5 rounded-lg transition-all ${selectedCategory === week.name ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-red-50'}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setConfirmDelete({ id: week.name, type: 'week' })}
                      className={`p-1.5 rounded-lg transition-all ${selectedCategory === week.name ? 'text-white hover:bg-red-600' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto px-8 py-12 transition-colors ${theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'}`}>
          <div className="max-w-[1600px] mx-auto">
            {selectedItem ? (
              <motion.div 
                key={selectedItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Header Actions: Publication Date (Left) & Delete (Right) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-72">
                      <BufferedInput 
                        type="date"
                        className={`w-full px-6 py-4 rounded-3xl font-bold border-none outline-none focus:ring-4 focus:ring-red-600/20 transition-all ${theme === 'dark' ? 'bg-black text-white border border-red-900/20' : 'bg-white text-black shadow-sm'}`}
                        value={selectedItem.publishDate || ''}
                        onSave={(val: string) => updateItem(selectedItem.id, { publishDate: val })}
                      />
                    </div>
                    <span className={`px-5 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-lg ${selectedItem.isPublished ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}>
                      {selectedItem.day}
                    </span>
                  </div>

                  <button 
                    onClick={() => setConfirmDelete({ id: selectedItem.id, type: 'item' })}
                    className="flex items-center gap-3 px-8 py-4 bg-red-600/5 text-red-600 hover:bg-red-600 hover:text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 group/del"
                  >
                    <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
                    Eliminar Contenido
                  </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-12">
                  {/* Left Column: Title & Thumbnail */}
                  <div className="xl:w-[450px] space-y-10 shrink-0">
                  {/* Title Section */}
                  <div className="group relative">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" /> Título
                      </label>
                      <button 
                        onClick={() => copyToClipboard(selectedItem.title)}
                        className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 active:scale-90"
                        title="Copiar Título"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <BufferedInput 
                      placeholder="Título aquí..."
                      className={`w-full px-6 py-5 rounded-2xl text-xl font-black tracking-tight border-none outline-none focus:ring-4 focus:ring-red-600/20 transition-all ${theme === 'dark' ? 'bg-black text-white placeholder:text-slate-800 border border-red-900/20' : 'bg-white text-black shadow-sm placeholder:text-slate-300'}`}
                      value={selectedItem.title || ''}
                      onSave={(val: string) => updateItem(selectedItem.id, { title: val })}
                    />
                  </div>

                  {/* Description Section */}
                  <div className="group relative">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlignLeft className="w-3.5 h-3.5" /> Descripción del Vídeo
                      </label>
                      <button 
                        onClick={() => copyToClipboard(selectedItem.description || '')}
                        className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 active:scale-90"
                        title="Copiar Descripción"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <BufferedTextarea 
                      placeholder="Escribe la descripción aquí..."
                      className={`w-full bg-transparent border-2 ${theme === 'dark' ? 'border-red-900/20 focus:border-red-600/50' : 'border-slate-100 focus:border-red-600/50'} rounded-3xl p-6 text-sm font-medium transition-all outline-none min-h-[120px] resize-none`}
                      value={selectedItem.description || ''}
                      onSave={(val: string) => updateItem(selectedItem.id, { description: val })}
                    />
                  </div>

                  {/* Thumbnail Section (16:9) */}
                  <div className="group relative">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" /> Miniatura (16:9)
                      </label>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => selectedItem.thumbnail && copyToClipboard(selectedItem.thumbnail)}
                          className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 active:scale-90"
                          title="Copiar Imagen"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => selectedItem.thumbnail && downloadImage(selectedItem.thumbnail, `thumb-${selectedItem.id}`)}
                          className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 active:scale-90"
                          title="Descargar Imagen"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group ${theme === 'dark' ? 'border-red-900/30 bg-black hover:border-red-600/50' : 'border-red-100 bg-white hover:border-red-600/50'}`}
                    >
                      {selectedItem.thumbnail ? (
                        <>
                          <img src={selectedItem.thumbnail} className="w-full h-full object-cover" alt="Miniatura" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest bg-red-600 px-4 py-2 rounded-xl shadow-lg shadow-red-600/20">Cambiar Miniatura</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <ImageIcon className="w-6 h-6 text-red-600" />
                          </div>
                          <p className="font-black uppercase tracking-tighter text-xs">Subir Miniatura 16:9</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>

                {/* Right Column: Script Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Guion / Script
                    </label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(selectedItem.script)}
                        className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 active:scale-90"
                        title="Copiar Guion"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="h-4 w-px bg-red-600/20 mx-1" />
                      <button onClick={() => downloadTxt(selectedItem.script, `script-${selectedItem.id}`)} className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 text-[10px] font-black uppercase tracking-tighter" title="Descargar TXT">TXT</button>
                      <button onClick={() => downloadPdf(selectedItem.script, `script-${selectedItem.id}`)} className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 text-[10px] font-black uppercase tracking-tighter" title="Descargar PDF">PDF</button>
                      <button onClick={() => downloadSrt(selectedItem.script, `script-${selectedItem.id}`)} className="p-2 hover:bg-red-600 hover:text-white rounded-xl transition-all text-red-600 bg-red-600/5 text-[10px] font-black uppercase tracking-tighter" title="Descargar SRT">SRT</button>
                    </div>
                  </div>
                  <BufferedTextarea 
                    placeholder="Escribe el guion aquí..."
                    className={`w-full h-[calc(100vh-280px)] px-10 py-10 rounded-[40px] text-xl font-bold leading-relaxed border-none outline-none focus:ring-4 focus:ring-red-600/20 transition-all resize-none ${theme === 'dark' ? 'bg-black text-white placeholder:text-slate-800 border border-red-900/20' : 'bg-white text-black shadow-sm placeholder:text-slate-300'}`}
                    value={selectedItem.script || ''}
                    onSave={(val: string) => updateItem(selectedItem.id, { script: val })}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-20 max-w-7xl mx-auto"
            >
              {filteredItems.length === 0 ? (
                <div className="h-[40vh] flex flex-col items-center justify-center border-4 border-dashed border-red-600/10 rounded-[64px]">
                  <div className="w-24 h-24 bg-red-600/5 rounded-[40px] flex items-center justify-center mb-6">
                    <Filter className="w-12 h-12 text-red-600/20" />
                  </div>
                  <p className="text-2xl font-black uppercase tracking-tighter italic text-center">No hay contenido</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 text-center">Empieza añadiendo contenido a una semana</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map(item => (
                    <ContentCard 
                      key={item.id}
                      item={item}
                      theme={theme}
                      onClick={() => setSelectedItemId(item.id)}
                      onTogglePublish={(e) => {
                        e.stopPropagation();
                        updateItem(item.id, { isPublished: !item.isPublished });
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          </div>
        </main>
      </div>

      {/* Day Selector Portal */}
      <AnimatePresence>
        {daySelector && (
          <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
              onClick={() => setDaySelector(null)}
            />
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              style={{ top: Math.min(daySelector.y, window.innerHeight - 450), left: daySelector.x + 40 }}
              className={`absolute w-56 rounded-[32px] shadow-2xl p-4 pointer-events-auto border-2 ${theme === 'dark' ? 'bg-black border-red-900/50' : 'bg-white border-red-100'}`}
            >
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] px-4 mb-4">Seleccionar Día</p>
              <div className="space-y-1">
                {DAYS.map(day => (
                  <button 
                    key={day}
                    onClick={() => addItem(daySelector.week, day)}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group ${theme === 'dark' ? 'text-slate-400 hover:bg-red-600 hover:text-white' : 'text-slate-600 hover:bg-red-600 hover:text-white'}`}
                  >
                    {day}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Color Picker Portal */}
      <AnimatePresence>
        {colorPicker && (
          <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
              onClick={() => setColorPicker(null)}
            />
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              style={{ top: Math.min(colorPicker.y, window.innerHeight - 300), left: colorPicker.x + 40 }}
              className={`absolute w-64 rounded-[32px] shadow-2xl p-6 pointer-events-auto border-2 ${theme === 'dark' ? 'bg-black border-red-900/50' : 'bg-white border-red-100'}`}
            >
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-4">Color de la Semana</p>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_COLORS.map(color => (
                  <button 
                    key={color}
                    onClick={() => updateWeekColor(colorPicker.week, color)}
                    className="w-10 h-10 rounded-xl transition-transform hover:scale-110 active:scale-90 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm p-10 rounded-[48px] text-center border-2 ${theme === 'dark' ? 'bg-black border-red-900/50' : 'bg-white border-red-100'}`}
            >
              <div className="w-20 h-20 bg-red-600/10 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4">¿Seguro que lo quieres eliminar?</h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-10 leading-relaxed">
                {confirmDelete?.type === 'week' 
                  ? `Se eliminará toda la ${confirmDelete.id} y todos los vídeos dentro de ella.` 
                  : 'Esta acción es permanente y no se puede deshacer.'}
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (!confirmDelete) return;
                    if (confirmDelete.type === 'week') {
                      deleteWeek(confirmDelete.id);
                    } else {
                      deleteItem(confirmDelete.id);
                    }
                  }}
                  className="w-full py-5 bg-red-600 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                >
                  Aceptar
                </button>
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs transition-all active:scale-95 ${theme === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Rechazar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
