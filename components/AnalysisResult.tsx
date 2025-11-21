
import React from 'react';
import { AnalysisResponse, VerdictType, AnalysisItem } from '../types';

interface AnalysisResultProps {
  result: AnalysisResponse;
  onReset: () => void;
  onItemClick: (item: AnalysisItem) => void;
}

const getVerdictColor = (verdict: VerdictType) => {
  switch (verdict) {
    case VerdictType.VERIFIED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
    case VerdictType.EXAGGERATED: return 'bg-amber-500/10 text-amber-400 border-amber-500/50';
    case VerdictType.MISSING: return 'bg-rose-500/10 text-rose-400 border-rose-500/50';
    case VerdictType.UNCERTAIN: return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    default: return 'bg-slate-500/10 text-slate-400';
  }
};

const getScoreColor = (score: number) => {
  if (score < 30) return 'text-emerald-400';
  if (score < 70) return 'text-amber-400';
  return 'text-rose-500';
};

const ResultItemCard: React.FC<{ item: AnalysisItem; index: number; onClick: () => void }> = ({ item, index, onClick }) => {
  
  const renderQuestionBasis = (text: string) => {
    // Attempt to parse the structured output from Gemini
    // Format: [JD 요건]: ... [코드 현황]: ... [면접관의 의도]: ...
    
    const jdMatch = text.match(/\[JD 요건\]:?\s*([\s\S]*?)(?=\[코드 현황\]|\[면접관의 의도\]|$)/);
    const codeMatch = text.match(/\[코드 현황\]:?\s*([\s\S]*?)(?=\[면접관의 의도\]|$)/);
    const intentMatch = text.match(/\[면접관의 의도\]:?\s*([\s\S]*?)$/);

    const hasStructure = jdMatch || codeMatch || intentMatch;

    if (hasStructure) {
      return (
        <div className="space-y-4 pt-1">
          {jdMatch && (
            <div className="bg-slate-900/50 p-3 rounded border-l-4 border-slate-500">
              <p className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                📋 JD 요건
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {jdMatch[1].trim()}
              </p>
            </div>
          )}
          {codeMatch && (
            <div className="bg-slate-900/50 p-3 rounded border-l-4 border-rose-500/50">
              <p className="text-xs font-bold text-rose-400 mb-1 flex items-center gap-1">
                💻 코드 현황
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {codeMatch[1].trim()}
              </p>
            </div>
          )}
          {intentMatch && (
            <div className="bg-amber-950/10 p-3 rounded border-l-4 border-amber-500/50">
              <p className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1">
                🧐 면접관의 의도
              </p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {intentMatch[1].trim()}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Fallback for unstructured text
    return (
      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-800 border border-slate-700 rounded-lg p-5 transition-all hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-900/20 cursor-pointer relative overflow-hidden"
    >
      {/* Hover Indication */}
      <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-colors pointer-events-none"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">#{index + 1}</span>
          <h3 className="font-bold text-xl text-slate-200 group-hover:text-rose-400 transition-colors">{item.topic}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getVerdictColor(item.verdict)}`}>
          {item.verdict === VerdictType.VERIFIED ? '검증됨' : 
           item.verdict === VerdictType.EXAGGERATED ? '과장 의심' :
           item.verdict === VerdictType.MISSING ? '허위 의심' : '판독 불가'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            자소서 주장
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{item.resumeClaim}</p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-rose-500/20 to-transparent"></div>
          <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider flex items-center gap-1">
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            코드 팩트 체크
          </p>
          <p className="text-sm text-slate-300 font-mono bg-black/20 p-2 rounded leading-relaxed">{item.codeObservation}</p>
        </div>
      </div>

      {/* Question Basis Section (Parsed Structure) */}
      <div className="mb-5 px-5 py-4 bg-slate-950/80 rounded-lg border border-amber-900/30 shadow-inner">
        <p className="text-xs text-amber-500 uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          질문 도출 근거 (Reasoning)
        </p>
        {renderQuestionBasis(item.questionBasis)}
      </div>

      <div className="mt-4 bg-rose-950/30 border border-rose-900/30 p-5 rounded-lg group-hover:bg-rose-950/50 transition-colors">
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center gap-2">
             <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span className="text-sm font-bold text-rose-400 uppercase">AI 면접관의 압박 질문</span>
           </div>
           <span className="text-xs text-rose-400/90 bg-rose-950 px-3 py-1 rounded-full border border-rose-900 group-hover:text-white group-hover:border-rose-500 transition-all flex items-center gap-1">
             면접 시작 <span className="text-[10px]">▶</span>
           </span>
        </div>
        <p className="text-lg font-bold text-slate-200 italic leading-snug">
          "{item.interviewQuestion}"
        </p>
      </div>
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset, onItemClick }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-5">판독 결과 리포트</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 bg-slate-950/30 p-5 rounded-xl border border-slate-800 shadow-inner">
              {result.summary}
            </p>
            <div className="flex gap-4 text-sm text-slate-500 font-medium">
               <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>허위 의심</div>
               <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>과장 의심</div>
               <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>검증 완료</div>
            </div>
          </div>
          
          {/* Score Section with Rubric */}
          <div className="flex flex-col items-center bg-slate-950/80 p-6 rounded-2xl border border-slate-800 min-w-[260px] shadow-xl">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">신뢰도 점수 (Trust Score)</span>
            
            <div className="relative flex items-center justify-center w-36 h-36 mb-6">
               <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                 {/* Background Circle */}
                 <circle cx="64" cy="64" r={radius} fill="transparent" stroke="#1e293b" strokeWidth="8" />
                 {/* Progress Circle */}
                 <circle 
                    cx="64" cy="64" r={radius} 
                    fill="transparent" 
                    stroke={result.overallTrustScore > 70 ? '#10b981' : result.overallTrustScore > 40 ? '#f59e0b' : '#f43f5e'} 
                    strokeWidth="8" 
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - result.overallTrustScore / 100)}
                    strokeLinecap="round"
                 />
               </svg>
               <div className={`text-5xl font-black ${getScoreColor(100 - result.overallTrustScore)}`}>
                 {result.overallTrustScore}
               </div>
            </div>

            {/* Rubric Explanation */}
            <div className="w-full pt-4 border-t border-slate-800">
                <p className="text-[11px] text-slate-500 font-bold mb-3 text-center">점수 산정 기준 (기본 100점)</p>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] text-center font-mono items-stretch">
                    {/* Missing */}
                    <div className="bg-rose-500/10 text-rose-400 py-2.5 rounded border border-rose-500/20 flex flex-col justify-center h-full">
                      <span className="font-bold mb-0.5 text-sm">-20</span>
                      <span className="opacity-80">허위</span>
                    </div>
                    
                    {/* Exaggerated (Hover Tooltip) */}
                    <div className="bg-amber-500/10 text-amber-400 py-2.5 rounded border border-amber-500/20 flex flex-col justify-center h-full group relative cursor-help">
                      <span className="font-bold mb-0.5 text-sm">-10</span>
                      <span className="opacity-80">과장</span>
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[160px] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-200 text-[11px] p-3 rounded border border-slate-700 shadow-xl z-50 text-center leading-tight">
                        구현은 했으나<br/>깊이가 얕음
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>

                    {/* Uncertain (Hover Tooltip) */}
                    <div className="bg-slate-500/10 text-slate-400 py-2.5 rounded border border-slate-500/20 flex flex-col justify-center h-full group relative cursor-help">
                      <span className="font-bold mb-0.5 text-sm">-5</span>
                      <span className="opacity-80">판독불가</span>
                       {/* Tooltip */}
                       <div className="pointer-events-none absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[160px] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-200 text-[11px] p-3 rounded border border-slate-700 shadow-xl z-50 text-center leading-tight">
                        코드가 없거나<br/>검증이 애매함
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Resume Fact Check */}
      <div className="space-y-5">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-8 bg-rose-500 rounded-full"></span>
          자소서 vs 코드 팩트체크 ({result.items.length})
        </h3>
        <div className="grid gap-6">
          {result.items.map((item, idx) => (
            <ResultItemCard 
              key={idx} 
              item={item} 
              index={idx} 
              onClick={() => onItemClick(item)} 
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-10 pb-16">
        <button
          onClick={onReset}
          className="px-8 py-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all text-lg font-semibold"
        >
          새로운 분석 시작하기
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;
