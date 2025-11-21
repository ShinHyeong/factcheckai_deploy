
import React, { useState } from 'react';
import { InputData } from '../types';

interface InputFormProps {
  onSubmit: (data: InputData) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<InputData>({
    jobDescription: '',
    resumeText: '',
    codeSnippet: '',
    githubUrl: '',
    githubToken: ''
  });
  
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.githubUrl.includes('github.com')) {
      alert('유효한 GitHub URL을 입력해주세요.');
      return;
    }
    onSubmit(formData);
  };

  // Mock function to fill data for demo purposes
  const fillDemoData = () => {
    setFormData(prev => ({
      ...prev,
      jobDescription: `[백엔드 개발자 채용]
- 대용량 트래픽 처리 경험 필수
- MSA(Microservices Architecture) 설계 및 운영 경험
- Redis, Kafka 등을 활용한 이벤트 기반 아키텍처
- Spring Boot, JPA 능숙자`,
      resumeText: `[자기소개서 핵심 역량]
1. 대규모 트래픽 대응 경험
- 일일 100만 건의 트래픽을 처리하기 위해 Redis를 도입하여 캐싱 전략을 수립했습니다.
- Kafka를 활용하여 주문 시스템과 배송 시스템 간의 결합도를 낮추고 비동기 처리를 구현했습니다.

2. MSA 전환 주도
- 기존 모놀리식 아키텍처를 4개의 마이크로서비스로 분리하여 배포 효율성을 300% 증대시켰습니다.`,
      githubUrl: 'https://github.com/spring-projects/spring-petclinic', // A popular public repo as a placeholder
      codeSnippet: '' 
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            분석 자료 입력
          </h2>
          <button 
            type="button" 
            onClick={fillDemoData}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline decoration-dotted"
          >
            데모 데이터 채우기
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">채용 공고 (JD)</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none scrollbar-thin placeholder-slate-600"
              placeholder="채용 공고 내용을 붙여넣으세요..."
              required
            />
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">자소서 / 이력서 (Text)</label>
            <textarea
              name="resumeText"
              value={formData.resumeText}
              onChange={handleChange}
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none placeholder-slate-600"
              placeholder="검증받고 싶은 자소서의 핵심 내용을 입력하세요."
              required
            />
          </div>

          {/* GitHub URL Section */}
          <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700">
             <label className="block text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
              GitHub Repository URL (전체 스캔)
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-sm text-slate-300 focus:ring-1 focus:ring-rose-500 font-mono"
                required
              />
              
              {/* Advanced: GitHub Token */}
              <div className="mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowTokenInput(!showTokenInput)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors group"
                >
                  <svg className={`w-3 h-3 transform transition-transform ${showTokenInput ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  <span className="group-hover:underline">API 호출 제한(Rate Limit) 오류가 발생하나요?</span>
                </button>
                
                {showTokenInput && (
                  <div className="mt-2 animate-fade-in-down p-4 bg-slate-950/80 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-end mb-2">
                       <div>
                         <p className="text-xs font-bold text-slate-300">GitHub Personal Access Token (Classic)</p>
                         <p className="text-[10px] text-slate-500 mt-0.5">시간당 60회 → 5,000회로 호출 한도 증가</p>
                       </div>
                       <a 
                        href="https://github.com/settings/tokens/new?description=FactCheckAI&scopes=public_repo" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded border border-slate-700 transition-colors flex items-center gap-1"
                      >
                        <span>👉 토큰 발급 바로가기</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    </div>
                    
                     <input
                      type="password"
                      name="githubToken"
                      value={formData.githubToken}
                      onChange={handleChange}
                      placeholder="ghp_..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-emerald-500 font-mono placeholder-slate-600"
                    />
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      * 위 버튼을 누르면 GitHub 설정 페이지로 이동합니다. 화면 하단의 
                      <span className="text-slate-300 font-bold mx-1">Generate token</span> 
                      버튼을 누르고 발급된 `ghp_` 로 시작하는 코드를 이곳에 붙여넣으세요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all transform active:scale-[0.98] 
              ${isLoading 
                ? 'bg-slate-700 cursor-wait' 
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-900/50'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                레포지토리 스캔 및 분석 중...
              </span>
            ) : (
              '자소서 vs 코드 팩트체크 시작'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;
