
import React, { useState, useRef } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import AnalysisResult from './components/AnalysisResult';
import InterviewChat from './components/InterviewChat';
import InterviewFeedback from './components/InterviewFeedback';
import { analyzeCandidate, getInterviewFeedback } from './services/geminiService';
import { fetchRepoData } from './services/githubService';
import { InputData, AnalysisResponse, AnalysisItem, ChatMessage, InterviewFeedbackResponse } from './types';

type ViewState = 'INPUT' | 'ANALYSIS' | 'INTERVIEW' | 'FEEDBACK';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('INPUT');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnalysisItem | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedbackResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleAnalyze = async (data: InputData) => {
    setIsLoading(true);
    setLoadingMessage("GitHub 레포지토리 연결 중...");

    try {
      // Step 1: Fetch GitHub Repo Data
      setLoadingMessage(`'${data.githubUrl}' 전체 구조 스캔 중...`);
      const repoContextData = await fetchRepoData(data.githubUrl, data.githubToken);
      
      setLoadingMessage(`핵심 코드 (${repoContextData.fileContents.length / 2}KB) 분석 및 검증 중...`);
      
      const fullCodeContext = `
        ${repoContextData.structure}
        
        ${repoContextData.fileContents}
      `;

      // Step 2: Gemini Analysis
      const analysisData = await analyzeCandidate(
        data.jobDescription,
        data.resumeText,
        fullCodeContext
      );
      
      setResult(analysisData);
      setView('ANALYSIS');
    } catch (error: any) {
      console.error("Analysis failed:", error);
      alert(`오류 발생: ${error.message || "분석에 실패했습니다."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: AnalysisItem) => {
    setSelectedItem(item);
    setView('INTERVIEW');
    window.scrollTo(0, 0);
  };

  const handleInterviewFinish = async (history: ChatMessage[]) => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    setLoadingMessage("면접 답변을 분석하고 피드백을 생성 중입니다...");
    
    try {
      const feedbackData = await getInterviewFeedback(history, selectedItem);
      setFeedback(feedbackData);
      setView('FEEDBACK');
    } catch (error) {
      alert("피드백 생성 중 오류가 발생했습니다.");
      // Fallback to analysis view
      setView('ANALYSIS');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedItem(null);
    setFeedback(null);
    setView('INPUT');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-[#0f172a] to-black text-slate-50 font-sans">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section (Only on Input) */}
        {view === 'INPUT' && !isLoading && (
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-white to-rose-400 pb-2">
              그 스펙, 진짜입니까?
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              자소서의 화려한 주장과 GitHub의 차가운 현실을 교차 검증합니다.<br/>
              <span className="text-rose-400 font-semibold">팩트 체크 AI 면접관</span>이 레포지토리를 탈탈 털어드립니다.
            </p>
          </div>
        )}

        {/* Loading View */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-t-4 border-rose-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-t-4 border-emerald-500 rounded-full animate-spin reverse-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white animate-pulse">AI 처리 중...</h3>
              <p className="text-slate-400 font-mono text-sm">
                {`> ${loadingMessage}`}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Views */}
        {!isLoading && (
          <>
            {view === 'INPUT' && (
              <InputForm onSubmit={handleAnalyze} isLoading={isLoading} />
            )}

            {view === 'ANALYSIS' && result && (
              <AnalysisResult 
                result={result} 
                onReset={handleReset} 
                onItemClick={handleItemClick}
              />
            )}

            {view === 'INTERVIEW' && selectedItem && (
              <InterviewChat 
                item={selectedItem}
                onFinish={handleInterviewFinish}
                onCancel={() => setView('ANALYSIS')}
              />
            )}

            {view === 'FEEDBACK' && feedback && (
              <InterviewFeedback 
                feedback={feedback}
                onClose={() => setView('ANALYSIS')}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-900 mt-12 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2024 FactCheck.AI - Powered by Google Gemini 2.5 Flash</p>
          <p className="text-xs mt-1 text-slate-700">API Rate Limit에 따라 분석이 제한될 수 있습니다.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
