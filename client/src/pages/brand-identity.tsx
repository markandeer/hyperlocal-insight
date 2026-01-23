import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Upload, Palette, Type, Box, Image as ImageIcon, Plus, Check, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BrandIdentity() {
  const { toast } = useToast();
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem("brand_logo"));
  const [elements, setElements] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem("brand_elements");
    return saved ? JSON.parse(saved) : [null, null, null];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const elementInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const [colors, setColors] = useState(() => {
    const saved = localStorage.getItem("brand_colors");
    return saved ? JSON.parse(saved) : [
      { name: "Primary", hex: "#e26e6d" },
      { name: "Secondary", hex: "#c6e4f9" },
      { name: "Accent", hex: "#f0f9ff" },
      { name: "Dark", hex: "#1a1a1a" },
      { name: "Neutral 1", hex: "#f5f5f5" },
      { name: "Neutral 2", hex: "#ffffff" }
    ];
  });

  useEffect(() => {
    try {
      if (logo) {
        if (logo.length > 2000000) {
          toast({ variant: "destructive", title: "File too large", description: "Please upload a smaller image to save it." });
          return;
        }
        localStorage.setItem("brand_logo", logo);
      } else {
        localStorage.removeItem("brand_logo");
      }
    } catch (e) {
      console.error("Storage quota exceeded", e);
      toast({ variant: "destructive", title: "Storage full", description: "Could not save logo. Try a smaller image." });
    }
  }, [logo]);

  useEffect(() => {
    try {
      localStorage.setItem("brand_elements", JSON.stringify(elements));
    } catch (e) {
      console.error("Storage quota exceeded", e);
      toast({ variant: "destructive", title: "Storage full", description: "Could not save elements." });
    }
  }, [elements]);

  useEffect(() => {
    try {
      localStorage.setItem("brand_colors", JSON.stringify(colors));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [colors]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 2MB for storage." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleElementUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 1MB for elements." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newElements = [...elements];
        newElements[index] = reader.result as string;
        setElements(newElements);
      };
      reader.readAsDataURL(file);
    }
  };

  const [typography, setTypography] = useState(() => {
    const saved = localStorage.getItem("brand_typography");
    return saved ? JSON.parse(saved) : {
      display: { name: "Clash Display", style: "Bold" },
      body: { name: "Inter", style: "Medium" }
    };
  });
  const [editingFont, setEditingFont] = useState<'display' | 'body' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("brand_typography", JSON.stringify(typography));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [typography]);

  const handleColorChange = (index: number, newHex: string) => {
    const newColors = [...colors];
    if (!newHex.startsWith("#") && newHex.length > 0) {
      newHex = "#" + newHex;
    }
    newColors[index].hex = newHex;
    setColors(newColors);
  };

  const handleFontChange = (type: 'display' | 'body', name: string) => {
    setTypography((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], name }
    }));
  };

  // Dynamically load Google Fonts
  useEffect(() => {
    const fontsToLoad = [typography.display.name, typography.body.name];
    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const fontQuery = fontsToLoad
      .map(font => font.replace(/\s+/g, '+'))
      .join('|');
    link.href = `https://fonts.googleapis.com/css2?family=${fontQuery.split('|').map((f, i) => {
      const weight = i === 0 ? typography.display.style : typography.body.style;
      const weightMap: Record<string, string> = {
        'Light': '300',
        'Regular': '400',
        'Medium': '500',
        'Semi-Bold': '600',
        'Bold': '700',
        'Extra-Bold': '800'
      };
      const w = weightMap[weight] || '400';
      return `${f}:wght@${w}`;
    }).join('&family=')}&display=swap`;
  }, [typography]);

  const sections = [
    {
      id: "logo",
      title: "1. Brand Logo",
      icon: ImageIcon,
      description: "Upload and manage your primary brand logo assets.",
      content: (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {!logo ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-3xl p-12 bg-white/50 hover:bg-white/80 transition-all cursor-pointer group"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-primary/40" />
              </div>
              <p className="text-primary/60 font-medium uppercase tracking-widest text-sm">Upload Logo Asset</p>
              <p className="text-primary/40 text-xs mt-2 italic">SVG, PNG, or JPG (Max 5MB)</p>
            </div>
          ) : (
            <div className="relative group max-w-md mx-auto">
              <div className="border-2 border-primary/10 rounded-3xl p-[10px] bg-white/80 shadow-inner flex items-center justify-center min-h-[200px]">
                <img src={logo} alt="Brand Logo" className="max-h-48 w-full object-contain rounded-2xl" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-3xl">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
                >
                  Change Logo
                </Button>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: "colors",
      title: "2. Brand Colors",
      icon: Palette,
      description: "Define your hex codes and preview your brand palette (6 slots).",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {colors.map((color: any, idx: number) => (
            <div key={idx} className="space-y-3 bg-white/40 p-4 rounded-2xl border-2 border-primary/5">
              <div 
                className="h-24 rounded-xl border-2 border-primary/5 shadow-inner transition-colors duration-300"
                style={{ backgroundColor: color.hex.length === 7 || color.hex.length === 4 ? color.hex : "#cccccc" }}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Color {idx + 1}</label>
                <Input 
                  value={color.hex}
                  onChange={(e) => handleColorChange(idx, e.target.value)}
                  className="h-9 text-xs font-mono uppercase border-primary/10 focus-visible:ring-primary/20 rounded-lg"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "typography",
      title: "3. Typography",
      icon: Type,
      description: "Standardize your brand fonts and text hierarchies.",
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-white/50 rounded-2xl border-2 border-primary/5 relative group overflow-hidden">
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Display Font</p>
            {editingFont === 'display' ? (
              <Input
                autoFocus
                value={typography.display.name}
                onChange={(e) => handleFontChange('display', e.target.value)}
                onBlur={() => setEditingFont(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingFont(null)}
                className="text-4xl font-bold text-primary tracking-tighter uppercase h-auto py-2 bg-transparent border-primary/20"
                style={{ fontFamily: typography.display.name }}
              />
            ) : (
              <h2 className="text-4xl font-bold text-primary tracking-tighter uppercase" style={{ fontFamily: typography.display.name, fontWeight: 
                typography.display.style === 'Light' ? 300 :
                typography.display.style === 'Regular' ? 400 :
                typography.display.style === 'Medium' ? 500 :
                typography.display.style === 'Semi-Bold' ? 600 :
                typography.display.style === 'Bold' ? 700 : 800
              }}>{typography.display.name}</h2>
            )}
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-primary/60 italic font-medium">{typography.display.style}</p>
              <Select 
                value={typography.display.style} 
                onValueChange={(val) => setTypography((prev: any) => ({ ...prev, display: { ...prev.display, style: val } }))}
              >
                <SelectTrigger className="h-7 w-28 text-[10px] uppercase font-bold tracking-widest border-primary/10">
                  <SelectValue placeholder="Weight" />
                </SelectTrigger>
                <SelectContent>
                  {['Light', 'Regular', 'Medium', 'Semi-Bold', 'Bold', 'Extra-Bold'].map(w => (
                    <SelectItem key={w} value={w} className="text-[10px] uppercase font-bold tracking-widest">{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-2xl">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingFont('display')}
                className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
              >
                Change Font
              </Button>
            </div>
          </div>

          <div className="p-6 bg-white/50 rounded-2xl border-2 border-primary/5 relative group overflow-hidden">
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Body Font</p>
            {editingFont === 'body' ? (
              <Input
                autoFocus
                value={typography.body.name}
                onChange={(e) => handleFontChange('body', e.target.value)}
                onBlur={() => setEditingFont(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingFont(null)}
                className="text-lg text-primary leading-relaxed font-medium h-auto py-1 bg-transparent border-primary/20"
                style={{ fontFamily: typography.body.name }}
              />
            ) : (
              <p className="text-lg text-primary leading-relaxed font-medium" style={{ fontFamily: typography.body.name, fontWeight: 
                typography.body.style === 'Light' ? 300 :
                typography.body.style === 'Regular' ? 400 :
                typography.body.style === 'Medium' ? 500 :
                typography.body.style === 'Semi-Bold' ? 600 :
                typography.body.style === 'Bold' ? 700 : 800
              }}>The quick brown fox jumps over the lazy dog. ({typography.body.name})</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-primary/60 italic font-medium">{typography.body.style}</p>
              <Select 
                value={typography.body.style} 
                onValueChange={(val) => setTypography((prev: any) => ({ ...prev, body: { ...prev.body, style: val } }))}
              >
                <SelectTrigger className="h-7 w-28 text-[10px] uppercase font-bold tracking-widest border-primary/10">
                  <SelectValue placeholder="Weight" />
                </SelectTrigger>
                <SelectContent>
                  {['Light', 'Regular', 'Medium', 'Semi-Bold', 'Bold', 'Extra-Bold'].map(w => (
                    <SelectItem key={w} value={w} className="text-[10px] uppercase font-bold tracking-widest">{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-2xl">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEditingFont('body')}
                className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
              >
                Change Font
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "elements",
      title: "4. Brand Elements",
      icon: Box,
      description: "Iconography, patterns, and other visual brand identifiers.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-4">
              <input
                type="file"
                ref={elementInputRefs[idx]}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleElementUpload(idx, e)}
              />
              {!elements[idx] ? (
                <div 
                  onClick={() => elementInputRefs[idx].current?.click()}
                  className="aspect-square bg-white/50 rounded-2xl border-2 border-primary/5 flex flex-col items-center justify-center border-dashed cursor-pointer hover:bg-white/80 transition-all group"
                >
                  <Plus className="w-8 h-8 text-primary/20 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-2">Upload Element</p>
                </div>
              ) : (
                <div className="relative group aspect-square">
                  <div className="h-full w-full border-2 border-primary/10 rounded-2xl p-[10px] bg-white/80 shadow-inner flex items-center justify-center overflow-hidden">
                    <img src={elements[idx]!} alt={`Element ${idx + 1}`} className="max-h-full w-full object-contain rounded-lg" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-2xl">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => elementInputRefs[idx].current?.click()}
                      className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl scale-75 bg-white/90"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-primary uppercase tracking-tighter mb-4">
            Brand Identity
          </h1>
          <p className="text-xl text-primary/80 font-medium italic">Define the visual soul of your business.</p>
        </motion.div>

        <div className="grid gap-12">
          {sections.map((section, idx) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-primary uppercase tracking-tight leading-none">
                    {section.title}
                  </h2>
                  <p className="text-sm text-primary/60 font-medium italic">{section.description}</p>
                </div>
                <div className="h-px flex-1 bg-primary/10" />
              </div>
              
              <Card className="border-2 border-primary/10 rounded-[2rem] bg-[#f0f9ff]/30 shadow-xl shadow-primary/5 overflow-hidden">
                <CardContent className="p-8">
                  {section.content}
                </CardContent>
              </Card>
            </motion.section>
          ))}
        </div>

        <div className="pt-12 flex justify-center">
          <Button size="lg" className="px-12 py-8 bg-primary text-white rounded-3xl font-bold text-xl uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
            Save Brand Identity
          </Button>
        </div>
      </div>
    </Layout>
  );
}
