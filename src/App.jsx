import React, { useEffect, useMemo, useState } from "react";

// ----------------------------- Branding -----------------------------
const BRAND = {
  nameEN: "Jaspresso",
  nameKR: "재스프레소",
  primary: "from-amber-700 to-orange-600",
  accent: "amber-700",
};

function Logo({ size = 28 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" className="shrink-0" aria-label="Jaspresso logo">
      <defs>
        <linearGradient id="jg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#jg)" />
      <g transform="translate(12,28)">
        <rect x="0" y="6" width="28" height="12" rx="3" fill="#fff" />
        <rect x="28" y="8" width="8" height="8" rx="4" fill="#fff" />
        <rect x="-2" y="19" width="40" height="3" rx="1.5" fill="#f3f4f6" />
        <text x="14" y="15" textAnchor="middle" fontSize="12" fill="#7c2d12" fontWeight="700">あ</text>
      </g>
      <path d="M26 16c0 4 4 4 4 8s-4 4-4 8" stroke="#fde68a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M36 14c0 4 4 4 4 8s-4 4-4 8" stroke="#fde68a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ----------------------------- Utilities -----------------------------
const LS_KEY = "jaspresso_state_v1";
const nowTs = () => Date.now();
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(([,v])=>v);

// Basic romaji map for kana typing assist
const ROMAJI_HINT = {
  あ:"a", い:"i", う:"u", え:"e", お:"o",
  か:"ka", き:"ki", く:"ku", け:"ke", こ:"ko",
  さ:"sa", し:"shi", す:"su", せ:"se", そ:"so",
  た:"ta", ち:"chi", つ:"tsu", て:"te", と:"to",
  な:"na", に:"ni", ぬ:"nu", ね:"ne", の:"no",
  は:"ha", ひ:"hi", ふ:"fu", へ:"he", ほ:"ho",
  ま:"ma", み:"mi",  む:"mu", め:"me", も:"mo",
  や:"ya", ゆ:"yu", よ:"yo",
  ら:"ra", り:"ri", る:"ru", れ:"re", ろ:"ro",
  わ:"wa", を:"wo", ん:"n",
  ア:"a", イ:"i", ウ:"u", エ:"e", オ:"o",
  カ:"ka", キ:"ki", ク:"ku", ケ:"ke", コ:"ko",
  サ:"sa", シ:"shi", ス:"su", セ:"se", ソ:"so",
  タ:"ta", チ:"chi", ツ:"tsu", テ:"te", ト:"to",
  ナ:"na", ニ:"ni", ヌ:"nu", ネ:"ne", ノ:"no",
  ハ:"ha", ヒ:"hi", フ:"fu", ヘ:"he", ホ:"ho",
  マ:"ma", ミ:"mi", ム:"mu", メ:"me", モ:"mo",
  ヤ:"ya", ユ:"yu", ヨ:"yo",
  ラ:"ra", リ:"ri", ル:"ru", レ:"re", ロ:"ro",
  ワ:"wa", ヲ:"wo", ン:"n",
};

// ----------------------------- Seed Data -----------------------------
const SEED = {
  phrases: [
    { id:"p1", jp:"はじめまして。よろしくお願いします。", romaji:"Hajimemashite. Yoroshiku onegai shimasu.", kr:"처음 뵙겠습니다. 잘 부탁드립니다.", en:"Nice to meet you. I look forward to working with you.", tag:["greeting","business-polite"] },
    { id:"p2", jp:"おはようございます", romaji:"Ohayō gozaimasu", kr:"좋은 아침입니다", en:"Good morning", tag:["greeting"] },
    { id:"p3", jp:"ありがとうございます", romaji:"Arigatō gozaimasu", kr:"감사합니다", en:"Thank you", tag:["greeting"] },
    { id:"p4", jp:"すみません、もう一度お願いします。", romaji:"Sumimasen, mō ichido onegai shimasu.", kr:"죄송하지만, 한 번 더 말씀해 주세요.", en:"Excuse me, could you say that again?", tag:["meeting","business-polite"] },
    { id:"p5", jp:"これはどういう意味ですか？", romaji:"Kore wa dō iu imi desu ka?", kr:"이건 무슨 의미인가요?", en:"What does this mean?", tag:["meeting"] },
    { id:"p6", jp:"今お時間よろしいでしょうか。", romaji:"Ima ojikan yoroshii deshō ka?", kr:"지금 시간 괜찮으실까요?", en:"Do you have a moment now?", tag:["business-polite"] },
    { id:"p7", jp:"少々お待ちください。", romaji:"Shōshō omachi kudasai.", kr:"잠시만 기다려 주세요.", en:"Please wait a moment.", tag:["service"] },
    { id:"p8", jp:"ご連絡ありがとうございます。", romaji:"Go-renraku arigatō gozaimasu.", kr:"연락 주셔서 감사합니다.", en:"Thank you for your message.", tag:["email","business-polite"] },
    { id:"p9", jp:"失礼いたします。", romaji:"Shitsurei itashimasu.", kr:"실례하겠습니다.", en:"Excuse me (polite).", tag:["business-polite"] },
    { id:"p10", jp:"よろしくお願いいたします。", romaji:"Yoroshiku onegai itashimasu.", kr:"부탁드립니다.", en:"Thank you in advance.", tag:["email","business-polite"] },
    { id:"p11", jp:"これは経費で落とせますか？", romaji:"Kore wa keihi de otosemasu ka?", kr:"이건 비용 처리 가능할까요?", en:"Can this be expensed?", tag:["office","business"] },
    { id:"p12", jp:"最終確認をお願いします。", romaji:"Saishū kakunin o onegai shimasu.", kr:"최종 확인 부탁드립니다.", en:"Please do a final check.", tag:["business","meeting","email"] },
    { id:"p13", jp:"今日は予約しています。", romaji:"Kyō wa yoyaku shite imasu.", kr:"오늘 예약했습니다.", en:"I have a reservation today.", tag:["travel","daily"] },
    { id:"p14", jp:"領収書をいただけますか。", romaji:"Ryōshūsho o itadakemasu ka?", kr:"영수증 주실 수 있을까요?", en:"May I have a receipt?", tag:["daily","payment"] },
    { id:"p15", jp:"おすすめは何ですか？", romaji:"Osusume wa nan desu ka?", kr:"추천 메뉴가 무엇인가요?", en:"What do you recommend?", tag:["restaurant","daily"] },
  ],
  roleplays: [
    {
      id:"r1", title:"첫 인사 (비즈니스)",
      jp:["A: はじめまして、ソンと申します。","B: はじめまして。ABCの田中です。","A: 本日はお時間をいただき、ありがとうございます。"],
      kr:["A: 처음 뵙겠습니다, 손이라고 합니다.","B: 처음 뵙겠습니다. ABC의 다나카입니다.","A: 오늘 시간 내주셔서 감사합니다."],
      en:["A: Nice to meet you, I’m Son.","B: Nice to meet you. I’m Tanaka from ABC.","A: Thank you for your time today."],
    },
    { id:"r2", title:"식당 예약 확인",
      jp:["A: 予約のソンです。","B: ありがとうございます。二名様ですね。","A: はい、よろしくお願いします。"],
      kr:["A: 예약한 손입니다.","B: 감사합니다. 두 분이시죠?","A: 네, 부탁드립니다."],
      en:["A: I’m Son with a reservation.","B: Thank you. Table for two?","A: Yes, please."],
    },
  ],
  kana: {
    hiragana:["あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ","た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ","ま","み","む","め","も","や","ゆ","よ","ら","り","る","れ","ろ","わ","を","ん"],
    katakana:["ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ","サ","シ","ス","セ","ソ","タ","チ","ツ","テ","ト","ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ","マ","ミ","ム","メ","モ","ヤ","ユ","ヨ","ラ","リ","ル","レ","ロ","ワ","ヲ","ン"],
  },
  grammar:[
    { id:"g1", point:"です／ます 체", jp:"丁寧体（です・ます）", kr:"정중체: 문장을 공손하게.", en:"Polite style used in business." },
    { id:"g2", point:"〜でしょうか", jp:"確認・依頼のやわらかい表現", kr:"확인/요청을 부드럽게.", en:"Soft check/request." },
    { id:"g3", point:"〜ていただけますか", jp:"依頼の丁寧表現", kr:"정중한 부탁.", en:"Polite request." },
  ],
  emails:[
    { id:"e1", subjectJP:"ご挨拶", bodyJP:"いつもお世話になっております。ABCのソンでございます。〜", subjectKR:"인사", subjectEN:"Greetings", bodyKR:"평소 도움에 감사드립니다. ABC의 손입니다. ~", bodyEN:"I hope you are well. This is Son from ABC. ~" },
    { id:"e2", subjectJP:"打ち合わせのお願い", bodyJP:"打ち合わせのお時間をいただけますでしょうか。〜", subjectKR:"미팅 요청", subjectEN:"Meeting Request", bodyKR:"미팅 시간을 내주실 수 있을까요? ~", bodyEN:"May I request time for a meeting? ~" },
  ],
};

// ----------------------------- State & Persistence -----------------------------
function usePersistentState(){
  const [state, setState] = useState(()=>{
    try{
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {
        langUI:"KR",
        user: null, // { uid, name, provider }
        srs: {},
        stats: { learned:0, quizzes:0, streak:0, lastTs: nowTs() },
        settings: { showRomaji:true, fontSize: "base", voice:"" },
      };
    }catch{ return {}; }
  });
  useEffect(()=>{ localStorage.setItem(LS_KEY, JSON.stringify(state)); },[state]);
  return [state, setState];
}

function nextSrsReview(prev={interval:0, ease:2.5}, correct){
  const ease = Math.max(1.3, (prev.ease || 2.5) + (correct? 0.1 : -0.2));
  let interval;
  if(!prev.interval) interval = correct? 1 : 0;
  else if(prev.interval===1) interval = correct? 3 : 1;
  else interval = Math.round((prev.interval || 1) * (correct? ease : 0.5));
  const dueTs = nowTs() + interval * 24*60*60*1000;
  return { interval, ease, dueTs };
}

// ----------------------------- UI Primitives -----------------------------
const Pill = ({children, className=""}) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ${className}`}>{children}</span>
);
const Section = ({title, children, right}) => (
  <section className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div>{right}</div>
    </div>
    <div className="bg-white rounded-2xl shadow-sm border p-4">{children}</div>
  </section>
);
const Card = ({children}) => (<div className="bg-white rounded-2xl shadow-sm border p-4">{children}</div>);

// ----------------------------- Header -----------------------------
function Header({state, setState, current, setCurrent}){
  const nav = [
    {id:"dashboard", label: state.langUI==="EN"?"Dashboard":"대시보드"},
    {id:"phrases", label: state.langUI==="EN"?"Phrases":"문장"},
    {id:"kana", label: state.langUI==="EN"?"Kana":"가나"},
    {id:"grammar", label: state.langUI==="EN"?"Grammar":"문법"},
    {id:"emails", label: state.langUI==="EN"?"Biz Email":"비즈 이메일"},
    {id:"games", label: state.langUI==="EN"?"Games":"게임"},
    {id:"review", label: state.langUI==="EN"?"Review":"복습"},
    {id:"admin", label: state.langUI==="EN"?"Admin":"관리"},
    {id:"settings", label: state.langUI==="EN"?"Settings":"설정"},
  ];
  return (
    <header className={`sticky top-0 z-10 bg-gradient-to-r ${BRAND.primary} text-white`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Logo size={28} />
        <div className="text-2xl font-bold">{BRAND.nameEN}</div>
        <Pill className="bg-white/20 text-white">KR→JP w/ EN help</Pill>
        <nav className="ml-auto hidden md:flex gap-2">
          {nav.map(n=> (
            <button key={n.id} onClick={()=>setCurrent(n.id)}
              className={`px-3 py-1.5 rounded-full text-sm ${current===n.id?"bg-white text-indigo-600":"hover:bg-white/10"}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto md:ml-2 flex items-center gap-2">
          <AuthBadge state={state} setState={setState} />
          <select
            value={state.langUI}
            onChange={(e)=>setState(s=>({...s, langUI:e.target.value}))}
            className="bg-white/90 text-gray-800 rounded-xl px-2 py-1 text-sm">
            <option value="KR">KR UI</option>
            <option value="EN">EN UI</option>
          </select>
        </div>
      </div>
      <div className="md:hidden bg-white/10 px-3 pb-3 flex gap-2 overflow-x-auto">
        {nav.map(n=> (
          <button key={n.id} onClick={()=>setCurrent(n.id)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${current===n.id?"bg-white text-indigo-600":"hover:bg-white/10"}`}>
            {n.label}
          </button>
        ))}
      </div>
    </header>
  );
}

function AuthBadge({state, setState}){
  const user = state.user;
  return user ? (
    <div className="flex items-center gap-2">
      <Pill className="bg-white/20 text-white">{user.provider}</Pill>
      <span className="text-sm">{user.name||"User"}</span>
      <button onClick={()=>setState(s=>({...s, user:null}))} className="px-2 py-1 rounded-lg bg-white text-indigo-600 text-sm">Logout</button>
    </div>
  ) : (
    <LoginButton setState={setState} />
  );
}

function LoginButton({setState}){
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded-xl bg-white text-indigo-600 text-sm">Login</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 w-full max-w-sm">
            <div className="text-lg font-semibold mb-1">Sign in</div>
            <div className="text-sm text-gray-500 mb-3">(Demo) Choose a provider to simulate login</div>
            <div className="grid gap-2">
              {['Naver','Kakao','Apple','Google'].map(p=> (
                <button key={p} onClick={()=>{ setState(s=>({...s, user:{uid:"demo", name:"손현호", provider:p}})); setOpen(false); }} className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center justify-center gap-2">
                  <span>{p}</span>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-3">Real SSO later: Auth.js + custom OAuth for Naver/Kakao.</div>
            <div className="mt-3 text-right">
              <button onClick={()=>setOpen(false)} className="px-3 py-1.5 rounded-xl bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------- Dashboard -----------------------------
function Dashboard({state}){
  const { learned=0, quizzes=0, streak=0, lastTs } = state.stats || {};
  const lastSeen = new Date(lastTs).toLocaleString();
  const tipKR = "매일 15분: 생활 문장 5개 + 가나 5개 + 미니게임 1판";
  const tipEN = "15 min daily: 5 phrases + 5 kana + 1 mini game";
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <div className="text-sm text-gray-500">진도 / Progress</div>
        <div className="mt-2 text-3xl font-bold">{learned}</div>
        <div className="text-gray-500">items learned</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">퀴즈 횟수 / Quizzes</div>
        <div className="mt-2 text-3xl font-bold">{quizzes}</div>
        <div className="text-gray-500">completed</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">연속 학습 / Streak</div>
        <div className="mt-2 text-3xl font-bold">{streak}d</div>
        <div className="text-gray-500">Last: {lastSeen}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">오늘의 팁 / Today’s tip</div>
        <div className="mt-2 font-medium">{tipKR}</div>
        <div className="text-gray-500">{tipEN}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">추천 학습 경로 / Suggested Path</div>
        <ol className="list-decimal pl-5 space-y-1 mt-2 text-gray-800">
          <li>생활 필수 문장 5개 익히기 (정중체)</li>
          <li>히라가나/가타카나 10개 복습</li>
          <li>미니게임 1판</li>
          <li>비즈 이메일 템플릿 1개 읽고 저장</li>
        </ol>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">빠른 링크 / Quick Links</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <AnchorBtn href="#phrases">문장</AnchorBtn>
          <AnchorBtn href="#kana">가나</AnchorBtn>
          <AnchorBtn href="#games">게임</AnchorBtn>
          <AnchorBtn href="#emails">이메일</AnchorBtn>
          <AnchorBtn href="#review">복습</AnchorBtn>
        </div>
      </Card>
    </div>
  );
}

const AnchorBtn = ({href, children}) => (
  <a href={href} onClick={(e)=>{e.preventDefault(); document.querySelector(href)?.scrollIntoView({behavior:'smooth'});}}
     className="px-3 py-1.5 rounded-xl border shadow-sm bg-white hover:bg-gray-50">{children}</a>
);

// ----------------------------- Audio (Web Speech) -----------------------------
function speakJP(text, voiceName=""){
  try{
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const jp = voices.find(v=> v.lang.startsWith("ja") && (voiceName? v.name===voiceName : true));
    if(jp) u.voice = jp;
    u.lang = "ja-JP";
    window.speechSynthesis.speak(u);
  }catch{}
}

function VoicePicker({state, setState}){
  const [voices, setVoices] = useState([]);
  useEffect(()=>{
    const load = ()=> setVoices(window.speechSynthesis.getVoices().filter(v=>v.lang.startsWith("ja")));
    load(); window.speechSynthesis.onvoiceschanged = load;
  },[]);
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500">JP Voice</span>
      <select className="px-2 py-1 border rounded-xl" value={state.settings.voice||""}
        onChange={(e)=>setState(s=>({...s, settings:{...s.settings, voice:e.target.value}}))}>
        <option value="">Default</option>
        {voices.map(v=> <option key={v.name} value={v.name}>{v.name}</option>)}
      </select>
    </div>
  );
}

// ----------------------------- Phrases -----------------------------
function Phrases({state, setState}){
  const [filter, setFilter] = useState("");
  const list = useMemo(()=> SEED.phrases.filter(p=> !filter || p.tag.includes(filter)), [filter]);
  const addToSrs = (id) => setState(s=>({
    ...s,
    srs: { ...s.srs, [id]: s.srs[id] || { interval:0, ease:2.5, dueTs: nowTs() } },
    stats: { ...s.stats, learned: (s.stats.learned||0)+1 }
  }));
  const showR = state.settings?.showRomaji;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <FilterChip active={!filter} onClick={()=>setFilter("")}>ALL</FilterChip>
        {['greeting','daily','restaurant','meeting','email','business','business-polite','service','payment','travel','office'].map(t=> (
          <FilterChip key={t} active={filter===t} onClick={()=>setFilter(t)}>{t}</FilterChip>
        ))}
        <div className="ml-auto"><VoicePicker state={state} setState={setState} /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(item => (
          <div key={item.id} className="rounded-2xl border p-4 bg-white shadow-sm">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-lg font-semibold mb-1">{item.jp}</div>
                {showR && <div className="text-sm text-gray-500">{item.romaji}</div>}
                <div className="mt-1 text-gray-800">KR: {item.kr}</div>
                <div className="text-gray-500">EN: {item.en}</div>
              </div>
              <button title="듣기" onClick={()=>speakJP(item.jp, state.settings.voice)} className="px-2 py-1 rounded-lg border">🔊</button>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white" onClick={()=>addToSrs(item.id)}>복습에 추가</button>
              <button className="px-3 py-1.5 rounded-xl bg-gray-100" onClick={()=>quizOne(item, setState)}>퀴즈</button>
              <div className="ml-auto flex gap-1">{item.tag.map(t=> <Pill key={t}>{t}</Pill>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function quizOne(item, setState){
  const opts = shuffle([item.kr, sample(SEED.phrases).kr, sample(SEED.phrases).kr]);
  const correctIndex = opts.indexOf(item.kr);
  const pick = window.prompt(`${item.jp}\n\n무슨 뜻일까요? (번호로 입력)\n${opts.map((o,i)=>`${i+1}. ${o}`).join("\n")}`);
  const ok = String(Number(pick)-1) === String(correctIndex);
  alert(ok?"정답!" : `오답: ${item.kr}`);
  bumpQuiz(setState);
}

const FilterChip = ({active, onClick, children}) => (
  <button onClick={onClick} className={`px-2.5 py-1 rounded-full text-xs border ${active?"bg-indigo-600 text-white border-indigo-600":"bg-white hover:bg-gray-50"}`}>{children}</button>
);

// ----------------------------- Kana -----------------------------
function Kana(){
  const [mode, setMode] = useState("hiragana");
  const [current, setCurrent] = useState(sample(SEED.kana[mode]));
  const [input, setInput] = useState("");
  useEffect(()=>{ setCurrent(sample(SEED.kana[mode])); setInput(""); }, [mode]);
  const onSubmit = (e)=>{
    e.preventDefault();
    const ok = input.trim().toLowerCase() === (ROMAJI_HINT[current]||"");
    alert(ok?"정답!":`오답: ${ROMAJI_HINT[current]}`);
    setCurrent(sample(SEED.kana[mode]));
    setInput("");
  };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <FilterChip active={mode==='hiragana'} onClick={()=>setMode('hiragana')}>히라가나</FilterChip>
          <FilterChip active={mode==='katakana'} onClick={()=>setMode('katakana')}>가타카나</FilterChip>
        </div>
        <div className="text-center py-10">
          <div className="text-7xl font-bold">{current}</div>
          <div className="text-gray-500 mt-2">romaji hint</div>
          <div className="text-lg font-mono">{ROMAJI_HINT[current]}</div>
          <form onSubmit={onSubmit} className="mt-4 flex gap-2 justify-center">
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="타자 입력 (romaji)" className="px-3 py-2 border rounded-xl" />
            <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white">체크</button>
          </form>
        </div>
      </Card>
      <Card>
        <div className="grid grid-cols-10 gap-1">
          {SEED.kana[mode].map(k=> (
            <div key={k} className="border rounded-lg py-2 text-center bg-white hover:bg-indigo-50">
              <div>{k}</div>
              <div className="text-[10px] text-gray-500">{ROMAJI_HINT[k]}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ----------------------------- Grammar -----------------------------
function Grammar(){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {SEED.grammar.map(g=> (
        <Card key={g.id}>
          <div className="text-sm text-indigo-600">{g.jp}</div>
          <div className="text-lg font-semibold">{g.point}</div>
          <div className="text-gray-800">KR: {g.kr}</div>
          <div className="text-gray-500">EN: {g.en}</div>
          <div className="mt-2 text-sm text-gray-600">예) 今お時間よろしいでしょうか（부드러운 확인）</div>
        </Card>
      ))}
    </div>
  );
}

// ----------------------------- Emails -----------------------------
function Emails(){
  const [picked, setPicked] = useState(SEED.emails[0]);
  const [copied, setCopied] = useState(false);
  const copy = async() => {
    try{
      await navigator.clipboard.writeText(`件名: ${picked.subjectJP}\n\n${picked.bodyJP}`);
      setCopied(true); setTimeout(()=>setCopied(false), 1200);
    }catch{}
  };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <div className="mb-2 font-medium">템플릿 선택</div>
        <div className="flex flex-wrap gap-2">
          {SEED.emails.map(e=> (
            <button key={e.id} onClick={()=>setPicked(e)} className={`px-3 py-1.5 rounded-xl border ${picked.id===e.id?"bg-indigo-600 text-white border-indigo-600":"bg-white"}`}>{e.subjectKR} / {e.subjectEN}</button>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-500">Subject</div>
          <div className="text-lg font-semibold">{picked.subjectJP}</div>
          <div className="whitespace-pre-wrap mt-2 p-3 bg-gray-50 rounded-xl border">{picked.bodyJP}</div>
          <div className="mt-2 text-sm text-gray-600">KR: {picked.bodyKR}</div>
          <div className="text-sm text-gray-500">EN: {picked.bodyEN}</div>
          <button onClick={copy} className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white">일본어 본문 복사</button>
          {copied && <span className="ml-2 text-green-600">복사됨!</span>}
        </div>
      </Card>
      <Card>
        <div className="font-medium mb-2">롤플레이 / Roleplay</div>
        {SEED.roleplays.map(r=> (
          <details key={r.id} className="mb-3">
            <summary className="cursor-pointer font-medium">{r.title}</summary>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="bg-white border rounded-xl p-3"><div className="text-sm text-gray-500">JP</div>{r.jp.map((l,i)=>(<div key={i}>{l}</div>))}</div>
              <div className="bg-white border rounded-xl p-3"><div className="text-sm text-gray-500">KR</div>{r.kr.map((l,i)=>(<div key={i}>{l}</div>))}</div>
              <div className="bg-white border rounded-xl p-3"><div className="text-sm text-gray-500">EN</div>{r.en.map((l,i)=>(<div key={i}>{l}</div>))}</div>
            </div>
          </details>
        ))}
      </Card>
    </div>
  );
}

// ----------------------------- Games -----------------------------
function Games({setState}){
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <GameQuickMatch setState={setState} />
      <GameTypeSprint setState={setState} />
      <GameMultipleChoice />
      <GameMemoryMatch />
    </div>
  );
}

// Game 1: Quick Match (JP -> KR)
function GameQuickMatch({setState}){
  const [q, setQ] = useState(()=> sample(SEED.phrases));
  const choices = useMemo(()=> shuffle([q.kr, sample(SEED.phrases).kr, sample(SEED.phrases).kr]), [q]);
  const pick = (c)=>{ const ok = c===q.kr; alert(ok?"정답!":"오답"); setQ(sample(SEED.phrases)); bumpQuiz(setState); };
  return (
    <Card>
      <div className="text-sm text-gray-500">게임: 빠른 매칭</div>
      <div className="text-lg font-semibold mt-1">{q.jp}</div>
      <div className="text-xs text-gray-500 mb-3">{q.romaji}</div>
      <div className="flex flex-col gap-2">
        {choices.map((c,i)=>(<button key={i} onClick={()=>pick(c)} className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-left">{i+1}. {c}</button>))}
      </div>
    </Card>
  );
}

// Game 2: Type Sprint (Kana romaji typing)
function GameTypeSprint({setState}){
  const [k, setK] = useState(()=> sample([ ...SEED.kana.hiragana, ...SEED.kana.katakana ]));
  const [inT, setInT] = useState("");
  const [score, setScore] = useState(0);
  const onSubmit = (e)=>{
    e.preventDefault();
    const ok = inT.trim().toLowerCase() === ROMAJI_HINT[k];
    if(ok) { setScore(s=>s+1); setK(sample([ ...SEED.kana.hiragana, ...SEED.kana.katakana ])); setInT(""); }
    else { alert(`정답: ${ROMAJI_HINT[k]}`); setK(sample([ ...SEED.kana.hiragana, ...SEED.kana.katakana ])); setInT(""); }
  };
  return (
    <Card>
      <div className="text-sm text-gray-500">게임: 타자 스프린트</div>
      <div className="text-6xl font-bold text-center my-4">{k}</div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input value={inT} onChange={e=>setInT(e.target.value)} placeholder="romaji" className="px-3 py-2 border rounded-xl w-full" />
        <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white">입력</button>
      </form>
      <div className="mt-2 text-gray-700">점수: {score}</div>
    </Card>
  );
}

// Game 3: Multiple Choice (KR -> JP)
function GameMultipleChoice(){
  const [q, setQ] = useState(()=> sample(SEED.phrases));
  const choices = useMemo(()=> shuffle([q.jp, sample(SEED.phrases).jp, sample(SEED.phrases).jp]), [q]);
  const pick = (c)=>{ const ok = c===q.jp; alert(ok?"정답!":"오답: "+q.jp); setQ(sample(SEED.phrases)); };
  return (
    <Card>
      <div className="text-sm text-gray-500">게임: 객관식 (KR→JP)</div>
      <div className="text-lg font-medium mt-1">{q.kr}</div>
      <div className="flex flex-col gap-2 mt-2">
        {choices.map((c,i)=>(<button key={i} onClick={()=>pick(c)} className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-left">{i+1}. {c}</button>))}
      </div>
    </Card>
  );
}

// Game 4: Memory Match (Kana ↔ Romaji)
function GameMemoryMatch(){
  const base = shuffle([ ...SEED.kana.hiragana.slice(0,8) ]); // 8 pairs
  const pairs = shuffle(base.flatMap(k=> [{t:k, k}, {t:ROMAJI_HINT[k], k}]));
  const [open, setOpen] = useState([]); // indices open
  const [gone, setGone] = useState(new Set());
  const click = (i)=>{
    if(gone.has(i) || open.includes(i)) return;
    const next = [...open, i].slice(-2);
    setOpen(next);
    if(next.length===2){
      const [a,b] = next;
      const m = pairs[a].k === pairs[b].k && pairs[a].t !== pairs[b].t;
      setTimeout(()=>{
        if(m){ setGone(g=> new Set([...g, a, b])); }
        setOpen([]);
      }, 600);
    }
  };
  const done = gone.size === pairs.length;
  return (
    <Card>
      <div className="text-sm text-gray-500">게임: 메모리 매칭 (가나↔로마자)</div>
      {done ? <div className="py-6 text-center">완료! 🎉</div> : (
        <div className="grid grid-cols-4 gap-2">
          {pairs.map((c,i)=>{
            const isOpen = open.includes(i) || gone.has(i);
            return (
              <button key={i} onClick={()=>click(i)} className={`h-16 rounded-xl border flex items-center justify-center ${isOpen?"bg-indigo-50":"bg-white hover:bg-gray-50"}`}>
                <span className="text-lg">{isOpen? c.t : "?"}</span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function bumpQuiz(setState){
  setState(s=> ({ ...s, stats:{...s.stats, quizzes:(s.stats.quizzes||0)+1, lastTs:nowTs(), streak: updateStreak(s.stats?.lastTs)} }));
}

function updateStreak(lastTs){
  try{
    const last = new Date(lastTs);
    const today = new Date();
    const diffDays = Math.floor((today - last)/(1000*60*60*24));
    if(diffDays === 0) return (Number(localStorage.getItem("_streak"))||0);
    const prev = Number(localStorage.getItem("_streak"))||0;
    const next = diffDays===1? prev+1 : 1;
    localStorage.setItem("_streak", String(next));
    return next;
  }catch{ return 0; }
}

// ----------------------------- Review (SRS) -----------------------------
function Review({state, setState}){
  const dueIds = Object.entries(state.srs||{})
    .filter(([,v])=> (v?.dueTs||0) <= nowTs())
    .map(([id])=>id);
  const queue = dueIds.length? dueIds : Object.keys(state.srs||{});
  const [idx, setIdx] = useState(0);
  const id = queue[idx];
  const item = SEED.phrases.find(p=>p.id===id);
  if(!item) return <div className="text-gray-600">복습 항목이 없습니다. 문장에서 “복습에 추가”를 눌러보세요.</div>;
  const answer = (correct)=>{
    const prev = state.srs[id]||{};
    const next = nextSrsReview(prev, correct);
    setState(s=> ({...s, srs: { ...s.srs, [id]: { ...(s.srs[id]||{}), ...next } }}));
    setIdx((i)=> (i+1) % (queue.length||1));
  };
  return (
    <div className="max-w-xl">
      <Card>
        <div className="text-sm text-gray-500">복습 SRS</div>
        <div className="text-lg font-semibold mt-1">{item.jp}</div>
        <div className="text-sm text-gray-500">{item.romaji}</div>
        <div className="mt-2 text-gray-800">KR: {item.kr}</div>
        <div className="text-gray-500">EN: {item.en}</div>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>answer(false)} className="px-3 py-1.5 rounded-xl bg-gray-100">틀림</button>
          <button onClick={()=>answer(true)} className="px-3 py-1.5 rounded-xl bg-green-600 text-white">맞음</button>
        </div>
      </Card>
    </div>
  );
}

// ----------------------------- Admin (progress/report) -----------------------------
function Admin({state}){
  const s = state.stats || {};
  const srsCount = Object.keys(state.srs||{}).length;
  const user = state.user;
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <div className="text-sm text-gray-500">사용자</div>
        <div className="mt-1">{user? `${user.name} (${user.provider})` : '게스트'}</div>
        <div className="text-xs text-gray-500">* 실제 배포 시 관리자만 접근</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">누적 학습 항목</div>
        <div className="text-3xl font-bold">{s.learned||0}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">SRS 큐</div>
        <div className="text-3xl font-bold">{srsCount}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-500">다음 단계</div>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>SSO 실연결 (Auth.js + Naver/Kakao OAuth)</li>
          <li>오디오: Web Speech → 클라우드 TTS</li>
          <li>데이터셋 확장: 업계별 회화/이메일</li>
          <li>진행률 서버 저장(Supabase/Firestore)</li>
        </ul>
      </Card>
    </div>
  );
}

// ----------------------------- Settings -----------------------------
function Settings({state, setState}){
  const s = state.settings || {};
  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <div className="font-medium">표시 옵션</div>
        <label className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={!!s.showRomaji} onChange={e=>setState(st=>({...st, settings:{...st.settings, showRomaji:e.target.checked}}))} />
          로마자 표기 보이기
        </label>
        <div className="mt-3">
          <div className="text-sm text-gray-500 mb-1">글자 크기</div>
          <select value={s.fontSize} onChange={e=>setState(st=>({...st, settings:{...st.settings, fontSize:e.target.value}}))} className="px-2 py-1 border rounded-xl">
            <option value="sm">작게</option>
            <option value="base">기본</option>
            <option value="lg">크게</option>
          </select>
        </div>
      </Card>
      <Card>
        <div className="font-medium mb-2">데이터</div>
        <button className="px-3 py-1.5 rounded-xl bg-red-600 text-white" onClick={()=>{ if(confirm('모든 학습 데이터를 초기화할까요?')) localStorage.removeItem(LS_KEY); location.reload(); }}>초기화</button>
      </Card>
      <Card>
        <div className="font-medium mb-2">학습 팁</div>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>정중체(です・ます) 중심으로 먼저 익히고 캐주얼은 나중에.</li>
          <li>가나는 매일 10자씩, 총 9일 완성 루틴.</li>
          <li>비즈 이메일은 일본어 본문을 복사해서 실제로 써보기.</li>
        </ul>
      </Card>
    </div>
  );
}

// ----------------------------- Help (Non-coder guide) -----------------------------
function HelpFab(){
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} title="도움말" className="fixed bottom-6 right-6 px-4 py-3 rounded-full shadow-lg bg-amber-600 text-white">?</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg">
            <div className="text-lg font-semibold">관리자/데모 확인 가이드</div>
            <ol className="list-decimal pl-5 mt-3 space-y-2 text-sm text-gray-700">
              <li>우상단 <b>Login</b> 클릭 → <b>Naver/Kakao/Apple/Google</b> 중 하나 선택(데모).</li>
              <li><b>필수 문장</b>에서 <b>복습에 추가</b> 버튼을 눌러 항목을 SRS에 넣어보세요.</li>
              <li><b>미니 게임</b> 1~2판 플레이하여 <b>퀴즈</b> 카운트를 쌓습니다.</li>
              <li>상단의 <b>관리/리포트</b> 탭에서 누적 학습, SRS 큐를 확인합니다.</li>
              <li>오른쪽 상단 <b>KR UI/EN UI</b>로 언어 전환, <b>설정</b>에서 글자 크기/로마자 표기 조정.</li>
              <li><b>초기화</b> 버튼(설정 탭)으로 전체 데이터를 리셋할 수 있습니다.</li>
            </ol>
            <div className="mt-3 text-xs text-gray-500">실서비스에서는 소셜로그인과 서버 저장을 연결해 여러 기기에서 동일한 진도를 불러옵니다.</div>
            <div className="mt-4 text-right">
              <button onClick={()=>setOpen(false)} className="px-3 py-1.5 rounded-xl bg-gray-100">닫기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ----------------------------- App -----------------------------
export default function App(){
  const [state, setState] = usePersistentState();
  const [current, setCurrent] = useState("dashboard");

  useEffect(()=>{
    document.documentElement.classList.remove('text-sm','text-base','text-lg');
    const fs = state.settings?.fontSize || 'base';
    document.documentElement.classList.add(fs==='sm'?'text-sm': fs==='lg'?'text-lg':'text-base');
  },[state.settings?.fontSize]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header state={state} setState={setState} current={current} setCurrent={setCurrent} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div id="dashboard">
          <Section title={state.langUI==="EN"?"Dashboard":"대시보드"} right={<SmallNav current={current} setCurrent={setCurrent} />}>
            <Dashboard state={state} />
          </Section>
        </div>
        <div id="phrases">
          <Section title={state.langUI==="EN"?"Essential Phrases":"필수 문장"}>
            <Phrases state={state} setState={setState} />
          </Section>
        </div>
        <div id="kana">
          <Section title={state.langUI==="EN"?"Kana Trainer":"가나 트레이너"}>
            <Kana />
          </Section>
        </div>
        <div id="grammar">
          <Section title={state.langUI==="EN"?"Bite‑size Grammar":"한입 문법"}>
            <Grammar />
          </Section>
        </div>
        <div id="emails">
          <Section title={state.langUI==="EN"?"Business Email Kits":"비즈 이메일 킷"}>
            <Emails />
          </Section>
        </div>
        <div id="games">
          <Section title={state.langUI==="EN"?"Mini Games":"미니 게임"}>
            <Games setState={setState} />
          </Section>
        </div>
        <div id="review">
          <Section title={state.langUI==="EN"?"SRS Review":"SRS 복습"}>
            <Review state={state} setState={setState} />
          </Section>
        </div>
        <div id="admin">
          <Section title={state.langUI==="EN"?"Admin / Reports":"관리 / 리포트"}>
            <Admin state={state} />
          </Section>
        </div>
        <div id="settings">
          <Section title={state.langUI==="EN"?"Settings":"설정"}>
            <Settings state={state} setState={setState} />
          </Section>
        </div>
      </main>
      <HelpFab />
      <footer className="text-center text-xs text-gray-500 py-6">© {new Date().getFullYear()} {BRAND.nameEN} — KR Professionals</footer>
    </div>
  );
}

function SmallNav({current, setCurrent}){
  const tabs = [
    {id:"phrases", label:"문장"},
    {id:"kana", label:"가나"},
    {id:"games", label:"게임"},
    {id:"review", label:"복습"},
  ];
  return (
    <div className="hidden sm:flex gap-2">
      {tabs.map(t=> (
        <button key={t.id} onClick={()=>{ setCurrent(t.id); document.getElementById(t.id)?.scrollIntoView({behavior:'smooth'}); }}
                className={`px-3 py-1.5 rounded-full text-sm border ${current===t.id?"bg-indigo-600 text-white border-indigo-600":"bg-white"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}