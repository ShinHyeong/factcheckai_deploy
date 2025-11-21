
import React from 'react';
import { InterviewFeedbackResponse } from '../types';

interface InterviewFeedbackProps {
  feedback: InterviewFeedbackResponse;
  onClose: () => void;
}

const ScoreItem: React.FC<{
  label: string;
  score: number;
  maxScore: number;
  reasoning: string;
  improvement: string;
  colorClass: string;
  barClass: string;
}> = ({ label, score, maxScore, reasoning, improvement, colorClass, barClass }) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  
  return (
    <div className="mb-8 last:mb-0 group">
      <div className="flex justify-between items-end mb-2">
        <span className={`font-bold ${colorClass} text-lg`}>{label}</span>
        <span className="text-sm font-mono text-slate-400">
          <span className={`text-2xl font-bold ${colorClass}`}>{score}</span>
          <span className="text-slate-600">/{maxScore}</span>
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mb-4 border border-slate-700 shadow-inner">
        <div 
          className={`h-full rounded-full ${barClass} transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {/* Reasoning & Improvement Grid */}
      <div className="grid grid-cols-1 gap-3">
        {/* Good Point (Green) */}
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3 transition-colors hover:bg-emerald-950/50">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
             <span className="text-emerald-400 text-xs">👍</span>
          </div>
          <div>
             <span className="block text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1">획득 근거</span>
             <p className="text-sm text-slate-300 leading-relaxed">{reasoning}</p>
          </div>
        </div>
        
        {/* Bad Point (Red) - Show if score is deducted or improvement text exists */}
        {(score < maxScore || (improvement && improvement.length > 0)) && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 flex items-start gap-3 transition-colors hover:bg-rose-950/50">
             <div className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center mt-0.5">
                <span className="text-rose-400 text-xs">👎</span>
             </div>
             <div>
                <span className="block text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">감점 사유</span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {improvement || "구체적인 설명이 부족하거나 논리가 약하여 감점되었습니다."}
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeedbackList: React.FC<{ title: string; items: string[]; color: string; icon: string; bgClass?: string }> = ({ title, items, color, icon, bgClass }) => (
  <div className={`rounded-xl p-5 border h-full flex flex-col ${bgClass || 'bg-slate-800/30 border-slate-700/50'}`}>
    <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${color}`}>
       <span className="text-xl filter drop-shadow-lg">{icon}</span>
       {title}
    </h3>
    <ul className="space-y-3 flex-1">
      {items && items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 group">
          <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5 transition-transform group-hover:scale-150 ${color.replace('text-', 'bg-')}`}></div>
          <span className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-100 transition-colors">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({ feedback, onClose }) => {
  // Determine logic for color coding total score
  const totalScoreColor = feedback.defenseScore >= 70 ? 'text-emerald-400' : feedback.defenseScore >= 40 ? 'text-amber-400' : 'text-rose-500';
  const totalBorderColor = feedback.defenseScore >= 70 ? 'border-emerald-500' : feedback.defenseScore >= 40 ? 'border-amber-500' : 'border-rose-500';
  const totalRingColor = feedback.defenseScore >= 70 ? 'ring-emerald-500/20' : feedback.defenseScore >= 40 ? 'ring-amber-500/20' : 'ring-rose-500/20';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* 1. Total Score Summary Header */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-slate-800/0 via-slate-800/0 to-slate-800/50 pointer-events-none"></div>
        
        <div className={`relative w-40 h-40 flex-shrink-0 rounded-full border-8 ${totalBorderColor} flex items-center justify-center bg-slate-950 shadow-[0_0_40px_rgba(0,0,0,0.6)] ring-4 ${totalRingColor}`}>
          <div className="text-center z-10">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Score</span>
            <span className={`text-6xl font-black tracking-tighter ${totalScoreColor}`}>{feedback.defenseScore}</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center md:justify-start gap-3">
            면접 방어력 분석 리포트
            <span className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400 border border-slate-700 font-normal">AI 검증 완료</span>
          </h2>
          <p className="text-slate-400 mb-6 max-w-2xl leading-relaxed">
            심층 압박 면접 결과를 바탕으로 <span className="text-slate-200 font-semibold">지원자님</span>의 기술적 타당성과 정직함을 분석했습니다.
            <br className="hidden md:block"/>
            점수가 낮더라도 걱정하지 마세요. 아래의 <span className="text-indigo-400 font-semibold">Action Item</span>을 통해 보완할 수 있습니다.
          </p>
           <div className="inline-flex items-center gap-3 bg-slate-950/50 px-6 py-4 rounded-xl text-sm text-slate-200 border border-slate-700 shadow-lg">
            <span className="text-2xl">💡</span>
            <span className="italic font-medium text-slate-300">"{feedback.feedbackSummary}"</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Detailed Score Breakdown (Left Side - 5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 pb-4 border-b border-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            평가 항목별 상세 채점표
          </h3>
          
          <ScoreItem 
            label="논리적 타당성" 
            score={feedback.logicScore} 
            maxScore={40} 
            reasoning={feedback.logicReasoning}
            improvement={feedback.logicImprovement}
            colorClass="text-indigo-400"
            barClass="bg-indigo-500"
          />
          
          <ScoreItem 
            label="솔직함 & 인정" 
            score={feedback.honestyScore} 
            maxScore={30} 
            reasoning={feedback.honestyReasoning}
            improvement={feedback.honestyImprovement}
            colorClass="text-emerald-400"
            barClass="bg-emerald-500"
          />
          
          <ScoreItem 
            label="해결 방안 제시" 
            score={feedback.solutionScore} 
            maxScore={30} 
            reasoning={feedback.solutionReasoning}
            improvement={feedback.solutionImprovement}
            colorClass="text-amber-400"
            barClass="bg-amber-500"
          />
        </div>

        {/* 3. Actionable Feedback (Right Side - 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Top Row: Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <FeedbackList 
              title="칭찬 (Positive)" 
              items={feedback.positiveFeedback} 
              color="text-emerald-400" 
              icon="🎉"
              bgClass="bg-emerald-900/10 border-emerald-500/10"
            />
            <FeedbackList 
              title="보완점 (Constructive)" 
              items={feedback.constructiveFeedback} 
              color="text-rose-400" 
              icon="🩹"
              bgClass="bg-rose-900/10 border-rose-500/10"
            />
          </div>

          {/* Bottom Row: Action Items */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden shadow-lg flex-1">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
             
             <h3 className="text-base font-bold text-indigo-300 uppercase tracking-wider mb-5 flex items-center gap-2">
               <span className="text-xl">🚀</span>
               Action Items (실행 과제)
             </h3>
             
             <div className="grid gap-4">
               {feedback.actionItems && feedback.actionItems.map((item, idx) => (
                 <div key={idx} className="flex items-start gap-4 bg-slate-950/40 p-4 rounded-xl border border-indigo-500/10 transition-all hover:border-indigo-500/30 hover:bg-slate-950/60">
                    <div className="flex-shrink-0 w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-slate-200 font-medium text-sm leading-relaxed">{item}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Navigation */}
          <div className="pt-4">
             <button
              onClick={onClose}
              className="w-full group relative bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-600 shadow-lg overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                분석 결과 리스트로 돌아가기
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InterviewFeedback;
