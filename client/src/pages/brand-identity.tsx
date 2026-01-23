import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Upload, Palette, Type, Box, Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

export default function BrandIdentity() {
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [colors, setColors] = useState([
    { name: "Primary", hex: "#e26e6d" },
    { name: "Secondary", hex: "#c6e4f9" },
    { name: "Accent", hex: "#f0f9ff" },
    { name: "Dark", hex: "#1a1a1a" },
    { name: "Neutral 1", hex: "#f5f5f5" },
    { name: "Neutral 2", hex: "#ffffff" }
  ]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (index: number, newHex: string) => {
    const newColors = [...colors];
    // Ensure hex starts with #
    if (!newHex.startsWith("#") && newHex.length > 0) {
      newHex = "#" + newHex;
    }
    newColors[index].hex = newHex;
    setColors(newColors);
  };

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
              <div className="border-2 border-primary/10 rounded-3xl p-8 bg-white/80 shadow-inner flex items-center justify-center min-h-[200px]">
                <img src={logo} alt="Brand Logo" className="max-h-32 object-contain" />
              </div>
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute -top-2 -right-2 rounded-full shadow-lg"
                onClick={() => setLogo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="mt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/20 text-primary uppercase font-bold tracking-widest rounded-xl"
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
          {colors.map((color, idx) => (
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
          <div className="p-6 bg-white/50 rounded-2xl border-2 border-primary/5">
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Display Font</p>
            <h2 className="text-4xl font-display font-bold text-primary tracking-tighter uppercase">Heading One</h2>
            <p className="text-sm text-primary/60 mt-1 italic font-medium">Clash Display / Bold</p>
          </div>
          <div className="p-6 bg-white/50 rounded-2xl border-2 border-primary/5">
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Body Font</p>
            <p className="text-lg text-primary leading-relaxed font-medium">The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-primary/60 mt-1 italic font-medium">Inter / Medium</p>
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
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-white/50 rounded-2xl border-2 border-primary/5 flex items-center justify-center border-dashed">
              <Box className="w-8 h-8 text-primary/20" />
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
