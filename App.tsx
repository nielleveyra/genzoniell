

import React, { useState, useCallback, ChangeEvent, useMemo, useEffect } from 'react';
import { analyzeScene, editImage, generateImage } from './services/geminiService';
import { LookType, StyleChoices, SceneAnalysisResult } from './types';
import { STYLE_OPTIONS, CLOTHING_OPTIONS, HIJAB_STYLE_OPTIONS, HAIR_STYLE_OPTIONS } from './constants';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

// --- SVG Icons ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

// --- Shared Helper Components ---
const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-4 text-pastel-text dark:text-dark-text">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-accent-dark dark:border-dark-accent"></div>
    <p className="mt-4 text-center">{message}</p>
  </div>
);

// --- Image Generator Component ---
const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageData = await generateImage(prompt, aspectRatio);
            setGeneratedImage(`data:image/jpeg;base64,${imageData}`);
        } catch (err) {
            console.error('Error generating image:', err);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, aspectRatio]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-pastel-card dark:bg-dark-card rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-pastel-accent-dark dark:text-dark-accent mb-4">Image Generator</h2>
                <p className="text-pastel-text dark:text-dark-text mb-6">Describe the image you want to create. Be as descriptive as you like!</p>
                
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-40 p-4 font-mono text-sm bg-pastel-bg dark:bg-dark-bg border border-lilac dark:border-dark-border rounded-lg resize-y text-pastel-text dark:text-dark-text"
                    placeholder="e.g., A majestic white cat wearing a tiny crown, sitting on a velvet cushion in a sunlit library."
                />

                <div className="mt-4">
                    <label className="block text-sm font-medium text-pastel-text dark:text-dark-text mb-1">Aspect Ratio</label>
                    <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full p-2 border border-lilac dark:border-dark-border rounded-md bg-white dark:bg-dark-card text-pastel-text dark:text-dark-text">
                        <option value="1:1">Square (1:1)</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="9:16">Portrait (9:16)</option>
                        <option value="4:3">Standard (4:3)</option>
                        <option value="3:4">Tall (3:4)</option>
                    </select>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt}
                    className="w-full mt-6 px-6 py-3 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-pastel-accent-dark dark:bg-dark-accent text-white dark:text-dark-bg shadow-lg hover:bg-pastel-accent-dark/90 dark:hover:bg-dark-accent-dark/90 transform hover:scale-105"
                >
                    {isGenerating ? 'Generating...' : '✨ Generate Image'}
                </button>
            </div>

            {(isGenerating || error || generatedImage) && (
                 <div className="bg-pastel-card dark:bg-dark-card rounded-2xl shadow-lg p-6 md:p-8">
                    {isGenerating && <Loader message="Creating your image..." />}
                    {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                    {generatedImage && (
                        <div className="flex flex-col items-center animate-fade-in">
                            <h3 className="text-xl font-bold text-pastel-accent-dark dark:text-dark-accent mb-4">Your Creation</h3>
                            <img src={generatedImage} alt="Generated with AI" className="max-w-full mx-auto rounded-lg shadow-md" />
                            <a 
                                href={generatedImage} 
                                download="nielle-ai-generated-image.jpeg"
                                className="mt-4 px-6 py-2 bg-lilac dark:bg-dark-border text-pastel-text dark:text-dark-text rounded-full font-semibold transition-all hover:bg-pastel-accent dark:hover:bg-dark-accent"
                            >
                                Download Image
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Image Editor Component ---
const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setOriginalImage(file);
            setOriginalImagePreview(URL.createObjectURL(file));
            setEditedImage(null);
            setError(null);
        }
    };

    const handleEdit = useCallback(async () => {
        if (!originalImage || !prompt) {
            setError('Please upload an image and enter an editing prompt.');
            return;
        }
        setIsEditing(true);
        setError(null);
        setEditedImage(null);

        try {
            const base64 = await fileToBase64(originalImage);
            const imageData = await editImage(base64, originalImage.type, prompt);
            setEditedImage(`data:image/png;base64,${imageData}`);
        } catch (err) {
            console.error('Error editing image:', err);
            setError('Failed to edit image. Please try again.');
        } finally {
            setIsEditing(false);
        }
    }, [originalImage, prompt]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-pastel-card dark:bg-dark-card rounded-2xl shadow-lg p-6 md:p-8">
                 <h2 className="text-2xl font-bold text-pastel-accent-dark dark:text-dark-accent mb-4">Image Editor</h2>
                 <p className="text-pastel-text dark:text-dark-text mb-6">Upload an image and tell me how you'd like to change it.</p>
                
                {!originalImagePreview && (
                    <>
                        <label htmlFor="image-editor-upload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-pastel-accent dark:border-dark-border rounded-lg p-10 hover:bg-lilac dark:hover:bg-dark-border transition-colors">
                            <UploadIcon />
                            <span className="text-pastel-text dark:text-dark-text">Click to upload an image</span>
                        </label>
                        <input id="image-editor-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                    </>
                )}

                {originalImagePreview && (
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div>
                             <h3 className="text-lg font-semibold text-pastel-text dark:text-dark-text mb-2">Your Image</h3>
                             <img src={originalImagePreview} alt="Original" className="w-full rounded-lg shadow-md" />
                             <button onClick={() => { setOriginalImage(null); setOriginalImagePreview(null); }} className="w-full mt-2 text-sm text-pastel-accent-dark dark:text-dark-accent hover:underline">Change Image</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-pastel-text dark:text-dark-text mb-1">Editing Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full h-24 p-2 font-sans text-sm bg-pastel-bg dark:bg-dark-bg border border-lilac dark:border-dark-border rounded-lg resize-y text-pastel-text dark:text-dark-text"
                                    placeholder="e.g., Add a retro filter, remove the person in the background, make it look like a watercolor painting..."
                                />
                            </div>
                            <button
                                onClick={handleEdit}
                                disabled={isEditing || !prompt || !originalImage}
                                className="w-full px-6 py-3 rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-pastel-accent-dark dark:bg-dark-accent text-white dark:text-dark-bg shadow-lg hover:bg-pastel-accent-dark/90 dark:hover:bg-dark-accent-dark/90 transform hover:scale-105"
                            >
                                {isEditing ? 'Editing...' : '🪄 Edit Image'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {(isEditing || error || editedImage) && (
                 <div className="bg-pastel-card dark:bg-dark-card rounded-2xl shadow-lg p-6 md:p-8">
                    {isEditing && <Loader message="Applying your edits..." />}
                    {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                    {editedImage && (
                        <div className="flex flex-col items-center animate-fade-in">
                            <h3 className="text-xl font-bold text-pastel-accent-dark dark:text-dark-accent mb-4">Edited Result</h3>
                            <img src={editedImage} alt="Edited with AI" className="max-w-full mx-auto rounded-lg shadow-md" />
                            <a 
                                href={editedImage} 
                                download="nielle-ai-edited-image.png"
                                className="mt-4 px-6 py-2 bg-lilac dark:bg-dark-border text-pastel-text dark:text-dark-text rounded-full font-semibold transition-all hover:bg-pastel-accent dark:hover:bg-dark-accent"
                            >
                                Download Image
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// --- Style Refiner Components ---
interface StepCardProps {
  step: number;
  title: string;
  children: React.ReactNode;
  isDisabled?: boolean;
}
const StepCard: React.FC<StepCardProps> = ({ step, title, children, isDisabled = false }) => (
  <div className={`bg-pastel-card dark:bg-dark-card rounded-2xl shadow-lg p-6 md:p-8 mb-8 transition-opacity duration-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
    <h2 className="text-2xl font-bold text-pastel-accent-dark dark:text-dark-accent mb-4">
      <span className="bg-lilac dark:bg-dark-border/50 text-pastel-accent-dark dark:text-dark-accent rounded-full h-8 w-8 inline-flex items-center justify-center mr-3 font-mono">{step}</span>
      {title}
    </h2>
    <div className={isDisabled ? 'pointer-events-none' : ''}>
        {children}
    </div>
  </div>
);

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  previewUrl: string | null;
  id: string;
  title: string;
}
const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, previewUrl, id, title }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };
  return (
    <div>
      <label htmlFor={id} className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-pastel-accent dark:border-dark-border rounded-lg p-6 hover:bg-lilac dark:hover:bg-dark-border transition-colors">
        <UploadIcon />
        <span className="text-pastel-text dark:text-dark-text">{title}</span>
      </label>
      <input id={id} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl} alt="Preview" className="max-w-xs mx-auto rounded-lg shadow-md" />
        </div>
      )}
    </div>
  );
};

interface StyleSelectorProps {
    onStyleChange: (choices: Partial<StyleChoices>) => void;
    initialChoices: StyleChoices;
    sceneAnalysis: SceneAnalysisResult | null;
    useReferenceStyle: boolean;
    onToggleReferenceStyle: () => void;
}
const StyleSelector: React.FC<StyleSelectorProps> = ({ onStyleChange, initialChoices, sceneAnalysis, useReferenceStyle, onToggleReferenceStyle }) => {
    const { lookType } = initialChoices;
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => { onStyleChange({ [e.target.name]: e.target.value }); };
    const handleLookTypeChange = (type: LookType) => {
        const defaultStyle = STYLE_OPTIONS[type][0];
        const defaultClothing = CLOTHING_OPTIONS[type][0];
        const defaultHijab = HIJAB_STYLE_OPTIONS[0];
        const defaultHair = HAIR_STYLE_OPTIONS[0];
        onStyleChange({ lookType: type, style: defaultStyle, clothing: defaultClothing, hijabStyle: type === LookType.HIJAB ? defaultHijab : '', hairStyle: type === LookType.NON_HIJAB ? defaultHair : '' });
    }
    return (
        <div>
            <div className="flex justify-center gap-4 mb-6">
                <button onClick={() => handleLookTypeChange(LookType.HIJAB)} className={`px-6 py-2 rounded-full font-semibold transition-all ${lookType === LookType.HIJAB ? 'bg-pastel-accent-dark dark:bg-dark-accent text-white dark:text-dark-bg shadow-md' : 'bg-lilac dark:bg-dark-border text-pastel-text dark:text-dark-text hover:bg-pastel-accent dark:hover:bg-dark-accent'}`}>Gaya Hijab</button>
                <button onClick={() => handleLookTypeChange(LookType.NON_HIJAB)} className={`px-6 py-2 rounded-full font-semibold transition-all ${lookType === LookType.NON_HIJAB ? 'bg-pastel-accent-dark dark:bg-dark-accent text-white dark:text-dark-bg shadow-md' : 'bg-lilac dark:bg-dark-border text-pastel-text dark:text-dark-text hover:bg-pastel-accent dark:hover:bg-dark-accent'}`}>Gaya Non-Hijab</button>
            </div>
            {lookType && (
                <div className="space-y-4 animate-fade-in">
                     <button 
                        onClick={onToggleReferenceStyle}
                        className={`w-full text-center p-3 mb-4 rounded-lg font-semibold transition-all ${useReferenceStyle ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 border-2 border-green-400' : 'bg-lilac dark:bg-dark-border text-pastel-text dark:text-dark-text hover:bg-pastel-accent dark:hover:bg-dark-accent'}`}
                    >
                       {useReferenceStyle ? '✓ Menggunakan Gaya dari Foto' : '✨ Gunakan Gaya dari Foto Referensi'}
                    </button>
                    {useReferenceStyle && sceneAnalysis?.outfitDescription && (
                         <p className="text-sm text-center text-pastel-text dark:text-dark-text/80 p-2 bg-green-100 dark:bg-green-900/50 rounded-md">
                            Gaya terdeteksi: <strong>{sceneAnalysis.outfitDescription}</strong>
                        </p>
                    )}
                    <div className={useReferenceStyle ? 'opacity-40 pointer-events-none' : ''}>
                        <SelectInput label="Gaya Pakaian" name="style" value={initialChoices.style} options={STYLE_OPTIONS[lookType]} onChange={handleSelectChange} />
                        {lookType === LookType.HIJAB && (<SelectInput label="Gaya Hijab" name="hijabStyle" value={initialChoices.hijabStyle} options={HIJAB_STYLE_OPTIONS} onChange={handleSelectChange} />)}
                        {lookType === LookType.NON_HIJAB && (<SelectInput label="Gaya Rambut" name="hairStyle" value={initialChoices.hairStyle} options={HAIR_STYLE_OPTIONS} onChange={handleSelectChange} />)}
                        <SelectInput label="Pakaian" name="clothing" value={initialChoices.clothing} options={CLOTHING_OPTIONS[lookType]} onChange={handleSelectChange} />
                    </div>
                     {sceneAnalysis?.accessories && sceneAnalysis.accessories.length > 0 && <p className="text-sm text-pastel-text dark:text-dark-text/80 pt-2">Aksesori terdeteksi ({sceneAnalysis.accessories.join(', ')}) akan disesuaikan gayanya secara otomatis.</p>}
                </div>
            )}
        </div>
    );
};

interface SelectInputProps { label: string; name: string; value: string; options: string[]; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; }
const SelectInput: React.FC<SelectInputProps> = ({ label, name, value, options, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-pastel-text dark:text-dark-text mb-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full p-2 border border-lilac dark:border-dark-border rounded-md focus:ring-pastel-accent dark:focus:ring-dark-accent focus:border-pastel-accent dark:focus:border-dark-accent bg-white dark:bg-dark-card text-pastel-text dark:text-dark-text">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);
interface DoodleToggleProps { enabled: boolean; onToggle: (enabled: boolean) => void; }
const DoodleToggle: React.FC<DoodleToggleProps> = ({ enabled, onToggle }) => (
    <div className="flex items-center justify-between bg-lilac dark:bg-dark-border p-4 rounded-lg">
        <span className="font-medium text-pastel-text dark:text-dark-text">Tambah doodle estetik & warnai ulang properti?</span>
        <button onClick={() => onToggle(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-pastel-accent-dark dark:bg-dark-accent' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);
interface PromptPreviewProps { styleChoices: StyleChoices; sceneAnalysis: SceneAnalysisResult | null; addDoodles: boolean; useReferenceStyle: boolean; }
const PromptPreview: React.FC<PromptPreviewProps> = ({ styleChoices, sceneAnalysis, addDoodles, useReferenceStyle }) => {
    const promptParts = useMemo(() => {
        if (!styleChoices.lookType) return null;
        const parts: { label: string; value: string }[] = [];
        const detectedAccessories = sceneAnalysis?.accessories || [];
        
        if (useReferenceStyle) {
             parts.push({ label: 'Gaya', value: `Menggunakan gaya dari foto: "${sceneAnalysis?.outfitDescription}"` });
        } else {
            if (styleChoices.style) parts.push({ label: 'Gaya', value: styleChoices.style });
            if (styleChoices.clothing) parts.push({ label: 'Pakaian', value: styleChoices.clothing });
        }

        if (styleChoices.lookType === LookType.HIJAB && styleChoices.hijabStyle) { parts.push({ label: 'Hijab', value: styleChoices.hijabStyle }); } 
        else if (styleChoices.lookType === LookType.NON_HIJAB && styleChoices.hairStyle) { parts.push({ label: 'Rambut', value: styleChoices.hairStyle }); }
        
        if (detectedAccessories.length > 0) { parts.push({ label: 'Aksesori', value: `Aksesori terdeteksi (${detectedAccessories.join(', ')}) akan di-styling ulang.` }); }
        if (addDoodles) { parts.push({ label: 'Estetika', value: 'Doodle & properti yang diwarnai ulang akan ditambahkan.' }); }
        return parts;
    }, [styleChoices, sceneAnalysis, addDoodles, useReferenceStyle]);

    if (!promptParts || promptParts.length === 0) return null;

    return (
        <div className="bg-lilac/50 dark:bg-dark-border/50 p-4 rounded-lg mb-6 border border-pastel-accent dark:border-dark-accent animate-fade-in">
            <h4 className="font-semibold text-pastel-text dark:text-dark-text mb-2 text-center text-md">Pratinjau Prompt</h4>
            <ul className="space-y-1 text-sm text-pastel-text/90 dark:text-dark-text/90">
                {promptParts.map(part => (<li key={part.label} className="flex items-start"><span className="font-semibold w-24 flex-shrink-0">{part.label}:</span><span>{part.value}</span></li>))}
            </ul>
        </div>
    );
};

// --- Style Refiner Main Component ---
const getEnhancedClothingDescription = (clothingChoice: string): string => {
    // The base description is the user's choice.
    const baseDescription = `Pakaian spesifiknya adalah: "${clothingChoice}".`;
    const details: string[] = [];

    // --- Material/Texture Analysis ---
    if (/\brajut\b/i.test(clothingChoice)) details.push("Tekstur rajut (knit) harus terlihat jelas dan detail, baik itu rajutan halus atau tebal (chunky).");
    if (/\bsatin\b/i.test(clothingChoice)) details.push("Kain harus memiliki kilau mewah dan jatuhan lembut khas satin.");
    if (/\bkatun\b/i.test(clothingChoice)) details.push("Tampilkan tekstur matte dan sedikit kerutan alami dari kain katun.");
    if (/\bflanel\b/i.test(clothingChoice)) details.push("Pastikan kain flanel terlihat lembut dengan tekstur sedikit berbulu.");
    if (/\bkulit\b/i.test(clothingChoice)) details.push("Material kulit harus memiliki kilap dan tekstur yang realistis, entah itu matte atau glossy.");
    if (/\blinen\b/i.test(clothingChoice)) details.push("Tekstur kain linen harus terlihat ringan dan memiliki efek kusut alami yang khas.");
    if (/\bcrinkle\b/i.test(clothingChoice)) details.push("Efek 'crinkle' atau kerut pada bahan harus terlihat jelas dan disengaja, memberikan tekstur yang kaya.");
    if (/\bjeans\b/i.test(clothingChoice)) details.push("Gunakan tekstur kain denim yang otentik, lengkap dengan detail jahitan yang khas.");

    // --- Fit/Silhouette Analysis ---
    if (/\boversized\b/i.test(clothingChoice)) details.push("Siluet oversized harus terlihat jelas, modern, dan jatuh dengan baik di tubuh, bukan sekadar baju kebesaran.");
    if (/\blonggar\b/i.test(clothingChoice)) details.push("Ciptakan kesan longgar (loose-fit) yang nyaman dan memberikan gerakan yang alami pada pakaian.");
    if (/\bwide-leg\b/i.test(clothingChoice)) details.push("Celana harus memiliki potongan 'wide-leg' yang tegas, lebar dari pinggul hingga ke bawah.");
    if (/\bflowy\b/i.test(clothingChoice)) details.push("Tekankan sifat 'flowy' pada gaun atau rok, dengan kain yang seolah bergerak tertiup angin.");
    if (/\bhigh-waisted\b/i.test(clothingChoice)) details.push("Potongan 'high-waisted' harus jelas berada di atas pinggang, menonjolkan siluet.");
    if (/\bbaggy\b/i.test(clothingChoice)) details.push("Gaya 'baggy' harus terlihat otentik, dengan volume ekstra di sekitar pinggul dan paha.");
    if (/\bA-line\b/i.test(clothingChoice)) details.push("Rok harus memiliki bentuk 'A-line' yang klasik, sempit di pinggang dan melebar ke bawah.");
    if (/\bparachute\b/i.test(clothingChoice)) details.push("Celana parachute harus terbuat dari bahan nilon yang ringan dan memiliki siluet yang menggembung.");

    // --- Design Element Analysis ---
    if (/\bplisket\b/i.test(clothingChoice)) details.push("Lipatan plisket (pleats) harus terlihat tajam, rapi, dan konsisten di seluruh bagian rok.");
    if (/\bbordir\b/i.test(clothingChoice)) details.push("Detail bordir (embroidery) harus terlihat halus, mendetail, dan berkualitas tinggi.");
    if (/\btumpuk\b/i.test(clothingChoice)) details.push("Tampilkan gaya tumpuk (layering) dengan jelas, di mana setiap lapisan pakaian terlihat berbeda dan menambah dimensi.");
    if (/\bkancing\b/i.test(clothingChoice)) details.push("Kancing pada kemeja atau atasan harus terlihat jelas dan fungsional.");
    if (/\bcorset\b/i.test(clothingChoice)) details.push("Bagian corset top harus memiliki struktur yang jelas, menonjolkan bentuk tubuh.");
    if (/\btartan\b/i.test(clothingChoice)) details.push("Pola tartan pada rok harus terlihat jelas dengan warna dan garis yang presisi.");


    if (details.length > 0) {
        // Combine base description with detailed instructions for the AI
        return `${baseDescription}\n\n**PERINTAH DETAIL UNTUK AI MENGENAI PAKAIAN:**\n- ${details.join('\n- ')}`;
    }

    return baseDescription;
};

const StyleRefiner: React.FC = () => {
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [sceneImagePreview, setSceneImagePreview] = useState<string | null>(null);
  const [sceneAnalysis, setSceneAnalysis] = useState<SceneAnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [styleChoices, setStyleChoices] = useState<StyleChoices>({ lookType: null, style: '', clothing: '', hijabStyle: '', hairStyle: '' });
  const [addDoodles, setAddDoodles] = useState(false);
  const [useReferenceStyle, setUseReferenceStyle] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const resetGeneration = () => {
    setGeneratedPrompt(null);
    setIsCopied(false);
  };

  const handleSceneUpload = useCallback(async (file: File) => {
    resetGeneration();
    setSceneImage(file);
    setSceneImagePreview(URL.createObjectURL(file));
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    setSceneAnalysis(null);
    setUseReferenceStyle(false);
    try {
      const base64Image = await fileToBase64(file);
      const result = await analyzeScene(base64Image, file.type);
      setSceneAnalysis(result);
    } catch (error) {
      console.error("Error analyzing scene:", error);
      setAnalysisError("Maaf, kami tidak bisa menganalisis foto ini. Coba foto lain.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, []);

  const handleStyleChange = useCallback((choices: Partial<StyleChoices>) => { resetGeneration(); setStyleChoices(prev => ({ ...prev, ...choices })); }, []);
  const handleDoodleToggle = useCallback((enabled: boolean) => { resetGeneration(); setAddDoodles(enabled); }, []);
  const handleToggleReferenceStyle = useCallback(() => { resetGeneration(); setUseReferenceStyle(prev => !prev); }, []);

  const isStepsUnlocked = useMemo(() => sceneAnalysis !== null, [sceneAnalysis]);
  const isPromptReady = useMemo(() => isStepsUnlocked && styleChoices.lookType !== null, [isStepsUnlocked, styleChoices.lookType]);

  const handleGeneratePrompt = useCallback(() => {
    if (!isPromptReady || !sceneAnalysis) return;

    const identitySection = `**PERINTAH MUTLAK - IDENTITAS SUBJEK:**
Ini adalah foto saya. JANGAN UBAH fitur wajah, struktur tulang, warna kulit, atau bentuk tubuh saya. Hasilnya harus 99-100% IDENTIK dengan wajah dan fisik asli saya. Pertahankan tekstur kulit alami, proporsi tubuh, dan realisme secara keseluruhan. Perubahan APAPUN pada identitas subjek dilarang keras.`;

    const poseSection = `**PERINTAH MUTLAK - POSE, GESTUR & EKSPRESI (TINGKAT KESETIAAN TERTINGGI):**
Ini adalah bagian paling KRITIS dari perintah. Kegagalan untuk mereplikasi pose secara akurat akan membuat hasil tidak dapat diterima.
- **Analisis Pose Detail:** ${sceneAnalysis.poseAndExpression}

- **PERINTAH REPLIKASI 1:1 (SATU BANDING SATU):**
  - **Postur Tubuh:** Tiru persis sudut dan kemiringan tubuh, bahu, dan pinggul.
  - **Bahasa Tubuh & Gestur:** Replikasi posisi setiap lengan, tangan, dan jari dengan presisi absolut.
  - **Posisi Kepala & Arah Pandang:** Sudut kepala, kemiringan, dan arah pandangan mata harus identik.
  - **Ekspresi Wajah:** Tangkap dan tiru kembali setiap detail ekspresi wajah—senyuman, tatapan, atau emosi lainnya—dengan ketepatan 100%.

- **KEBIJAKAN TANPA TOLERANSI (ZERO TOLERANCE):** Tidak ada ruang untuk interpretasi artistik atau modifikasi pada pose, gestur, atau ekspresi. Setiap penyimpangan dari foto referensi asli dianggap sebagai kegagalan.`;

    const sceneSection = `**PERINTAH MUTLAK - LOKASI & LINGKUNGAN:**
Latar belakang, setting, dan lingkungan HARUS TETAP SAMA PERSIS seperti foto asli. Ini HANYA merujuk pada elemen-elemen fisik di dalam adegan, BUKAN pencahayaan atau gaya kamera.
- **Deskripsi Adegan Terdeteksi:** ${sceneAnalysis.description}`;
    
    const photoStyleSection = `**PERINTAH MUTLAK - GAYA FOTOGRAFI & SINEMATOGRAFI:**
Kualitas visual, pencahayaan, bayangan, dan framing dari foto asli HARUS direplikasi dengan presisi absolut untuk mempertahankan mood dan atmosfer asli.
- **Analisis Pencahayaan & Bayangan Terdeteksi:** ${sceneAnalysis.lightingAndShadows}
- **Analisis Perspektif Kamera Terdeteksi:** ${sceneAnalysis.cameraPerspective}`;

    let styleSection = '**PERINTAH GAYA BARU:**\n';
    const { accessories=[], outfitDescription } = sceneAnalysis;
    const accessoriesText = accessories.length > 0 ? `Aksesori asli yang terdeteksi (${accessories.join(', ')}) harus dipertahankan tetapi gayanya disesuaikan agar cocok dengan pakaian baru.` : '';

    if (useReferenceStyle) {
        styleSection += `Gunakan kembali gaya pakaian dari foto referensi: "${outfitDescription}".`;
        if (styleChoices.lookType === LookType.HIJAB) {
            styleSection += ` Adaptasi gaya ini menjadi versi yang ramah hijab (misalnya, lengan panjang, dll.) dan tambahkan hijab dengan gaya ${styleChoices.hijabStyle}.`;
        } else if (styleChoices.lookType === LookType.NON_HIJAB) {
            styleSection += ` Ubah gaya rambut menjadi ${styleChoices.hairStyle} sambil mempertahankan pakaian asli.`;
        }
    } else {
        const enhancedClothingDescription = getEnhancedClothingDescription(styleChoices.clothing);
        if (styleChoices.lookType === LookType.HIJAB) {
            styleSection += `Ubah pakaian subjek menjadi gaya ${styleChoices.style}. ${enhancedClothingDescription}. Tambahkan hijab yang ditata sebagai ${styleChoices.hijabStyle}.`;
        } else if (styleChoices.lookType === LookType.NON_HIJAB) {
            styleSection += `Ubah pakaian subjek menjadi gaya ${styleChoices.style}. ${enhancedClothingDescription}. Ubah gaya rambut menjadi ${styleChoices.hairStyle}.`;
        }
    }

    const aestheticSection = addDoodles ? `**Detail Estetika Tambahan:** Sertakan doodle estetika putih yang halus dan minimalis di sekitar subjek. Warnai ulang properti di latar belakang agar sesuai dengan palet warna pastel yang lembut namun tetap realistis.` : '';
    
    const finalQualitySection = `**KUALITAS AKHIR:** Gambar akhir harus ultra-fotorealistis, resolusi tinggi 8K, dengan detail tajam seperti foto editorial profesional.`;

    const fullPrompt = [identitySection, poseSection, sceneSection, photoStyleSection, styleSection, accessoriesText, aestheticSection, finalQualitySection].filter(Boolean).join('\n\n');
    setGeneratedPrompt(fullPrompt);
  }, [isPromptReady, sceneAnalysis, styleChoices, addDoodles, useReferenceStyle]);

  const handleCopy = () => {
    if (generatedPrompt) {
        navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in">
        <StepCard step={1} title="Unggah Foto Referensi">
          <FileUpload onFileUpload={handleSceneUpload} previewUrl={sceneImagePreview} id="scene-upload" title="Klik untuk mengunggah foto" />
          {isLoadingAnalysis && <Loader message="Menganalisis suasana, postur, dan pakaian..." />}
          {analysisError && <p className="text-red-500 dark:text-red-400 text-center mt-4">{analysisError}</p>}
        </StepCard>
        <StepCard step={2} title="Pilih Perubahan Gaya" isDisabled={!isStepsUnlocked}>
            <StyleSelector 
              onStyleChange={handleStyleChange} 
              initialChoices={styleChoices} 
              sceneAnalysis={sceneAnalysis}
              useReferenceStyle={useReferenceStyle}
              onToggleReferenceStyle={handleToggleReferenceStyle}
            />
        </StepCard>
        <StepCard step={3} title="Tambah Doodle Estetik (Opsional)" isDisabled={!isStepsUnlocked}>
            <DoodleToggle enabled={addDoodles} onToggle={handleDoodleToggle} />
        </StepCard>
        <StepCard step={4} title="Hasilkan Prompt Anda" isDisabled={!isPromptReady}>
            <PromptPreview styleChoices={styleChoices} sceneAnalysis={sceneAnalysis} addDoodles={addDoodles} useReferenceStyle={useReferenceStyle} />
            <div className="text-center space-y-4 mt-6">
                <button 
                  onClick={handleGeneratePrompt} 
                  disabled={!isPromptReady}
                  className="w-full px-6 py-4 rounded-lg font-semibold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-soft-pink text-pastel-accent-dark dark:bg-dark-accent dark:text-dark-bg shadow-lg hover:bg-pastel-accent hover:text-white dark:hover:bg-dark-accent-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 transform hover:scale-105"
                >
                  ✨ Hasilkan Prompt ✨
                </button>
                {generatedPrompt && (
                    <div className="mt-4 text-left animate-fade-in">
                        <textarea
                            readOnly
                            value={generatedPrompt}
                            className="w-full h-48 p-4 font-mono text-sm bg-pastel-bg dark:bg-dark-bg border border-lilac dark:border-dark-border rounded-lg resize-y text-pastel-text dark:text-dark-text"
                            aria-label="Generated Prompt"
                        />
                        <button 
                            onClick={handleCopy}
                            className="w-full mt-2 px-6 py-2 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all bg-lilac dark:bg-dark-border text-pastel-text dark:text-dark-text hover:bg-pastel-accent dark:hover:bg-dark-accent disabled:opacity-75"
                        >
                            {isCopied ? <><CheckIcon /> Tersalin!</> : <><CopyIcon/> Salin Prompt</>}
                        </button>
                    </div>
                )}
            </div>
        </StepCard>
    </div>
  );
}

// --- App Shell ---
const AppHeader: React.FC = () => (
  <header className="text-center py-8 px-4">
    <div className="h-16 flex justify-center items-center mb-2">
      <h1 className="text-4xl font-bold text-pastel-accent-dark dark:text-dark-accent tracking-wider">NIELLE AI CREATIVE SUITE</h1>
    </div>
    <p className="text-md text-pastel-text dark:text-dark-text mt-2">Kumpulan alat AI canggih untuk mewujudkan visi kreatif Anda.</p>
  </header>
);

type Tool = 'refiner' | 'editor' | 'generator';
const ToolTabs: React.FC<{ activeTool: Tool; onToolChange: (tool: Tool) => void }> = ({ activeTool, onToolChange }) => {
    const tabs: { id: Tool; label: string, emoji: string }[] = [
        { id: 'refiner', label: 'Style Refiner', emoji: '🎨' },
        { id: 'editor', label: 'Image Editor', emoji: '🪄' },
        { id: 'generator', label: 'Image Generator', emoji: '✨' },
    ];
    return (
        <nav className="flex justify-center gap-2 md:gap-4 mb-8">
            {tabs.map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => onToolChange(tab.id)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold transition-all text-sm md:text-base flex items-center gap-2 ${activeTool === tab.id ? 'bg-pastel-accent-dark dark:bg-dark-accent text-white dark:text-dark-bg shadow-lg' : 'bg-pastel-card dark:bg-dark-card text-pastel-text dark:text-dark-text hover:bg-lilac dark:hover:bg-dark-border'}`}
                >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('refiner');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme) return storedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  const isApiKeyMissing = !process.env.API_KEY;

  if (isApiKeyMissing) {
    return (
      <div className="min-h-screen bg-pastel-bg dark:bg-dark-bg flex flex-col items-center justify-center p-4 text-pastel-text dark:text-dark-text">
        <div className="bg-pastel-card dark:bg-dark-card rounded-2xl shadow-lg p-8 max-w-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-2xl font-bold text-pastel-accent-dark dark:text-dark-accent mb-2">API Key Diperlukan</h2>
          <p className="text-pastel-text dark:text-dark-text">Untuk menggunakan NIELLE AI CREATIVE SUITE, Anda memerlukan kunci API Gemini. Harap pastikan kunci tersebut sudah diatur dengan benar di environment Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-pastel-text dark:text-dark-text font-sans relative">
      <button onClick={toggleTheme} className="fixed top-4 right-4 z-50 p-2 rounded-full bg-pastel-card dark:bg-dark-card shadow-lg text-pastel-accent-dark dark:text-dark-accent hover:scale-110 transition-transform" aria-label="Toggle theme">
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>

      <AppHeader />
      
      <main className="max-w-3xl mx-auto p-4">
        <ToolTabs activeTool={activeTool} onToolChange={setActiveTool} />
        {activeTool === 'refiner' && <StyleRefiner />}
        {activeTool === 'editor' && <ImageEditor />}
        {activeTool === 'generator' && <ImageGenerator />}
      </main>

      <footer className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
        <p>Powered by NIELLE AI</p>
      </footer>
    </div>
  );
}
