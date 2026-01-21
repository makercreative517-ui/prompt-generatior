import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { generatePromptFromImage } from './services/geminiService';
import { ImageFile, PromptResult, AppState } from './types';
import { SparklesIcon, XIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<ImageFile | null>(null);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = async (image: ImageFile) => {
    setCurrentImage(image);
    setAppState(AppState.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await generatePromptFromImage(image.base64, image.mimeType);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while analyzing the image.');
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
               <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LensPrompt
            </h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Gemini Vision Powered
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
        
        {/* Error Notification */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-3 text-red-400">
               <span className="font-semibold">Error:</span>
               <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[600px]">
          
          {/* Left Column: Input / Image Preview */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Upload Area or Preview */}
            {!currentImage ? (
              <div className="flex-1 flex flex-col">
                 <ImageUploader 
                   onImageSelected={handleImageSelected} 
                   disabled={appState === AppState.ANALYZING} 
                 />
                 <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-indigo-400 font-bold text-lg mb-1">Text Prompt</div>
                      <p className="text-slate-500 text-xs">Midjourney & Flux ready detailed descriptions.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-emerald-400 font-bold text-lg mb-1">JSON Data</div>
                      <p className="text-slate-500 text-xs">Structured attributes for API integration.</p>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative group">
                <div className="relative flex-grow bg-slate-950 flex items-center justify-center p-4">
                   <img 
                     src={currentImage.previewUrl} 
                     alt="Analyzed" 
                     className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                   />
                   
                   {/* Overlay Actions */}
                   <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={handleReset}
                        className="p-2 bg-slate-900/90 hover:bg-red-500/90 text-white rounded-lg backdrop-blur-sm shadow-xl border border-slate-700 hover:border-red-500 transition-all"
                        title="Remove Image"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* Status Bar inside Image Card */}
                <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${appState === AppState.ANALYZING ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                        {appState === AppState.ANALYZING ? 'Processing...' : 'Analyzed'}
                      </span>
                   </div>
                   {appState !== AppState.ANALYZING && (
                     <button 
                       onClick={() => handleImageSelected(currentImage)}
                       className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                     >
                       <RefreshIcon className="w-3 h-3" />
                       <span>Retry</span>
                     </button>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="w-full lg:w-2/3 h-full min-h-[500px] relative">
            {appState === AppState.IDLE && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
                <div className="text-center">
                   <p className="text-lg font-medium">Ready to Analyze</p>
                   <p className="text-sm">Upload an image to see the magic.</p>
                </div>
              </div>
            )}

            {appState === AppState.ANALYZING && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 z-20">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-indigo-200 animate-pulse font-medium">Generating detailed prompts...</p>
                <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
              </div>
            )}

            {result && appState === AppState.SUCCESS && (
               <div className="h-full animate-fade-in-up">
                 <ResultDisplay result={result} />
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;