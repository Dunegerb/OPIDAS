import React, { useState, useEffect } from 'react';

// --- Types and Constants ---
interface Habit { id: string; label: string; }
interface Patent { name: string; minDays: number; maxDays: number; }

interface OnboardingPageProps {
    onCompleteOnboarding: () => void;
}

const habits: Habit[] = [
    { id: "masturbacao", label: "Masturbação" }, { id: "pornografia", label: "Pornografia" },
    { id: "fumar", label: "Fumar" }, { id: "bebida", label: "Bebida Alcólica" }, { id: "outro", label: "Outro" },
];

const patents: Patent[] = [
    { name: "Recruta", minDays: 0, maxDays: 9 }, { name: "Soldado", minDays: 10, maxDays: 29 },
    { name: "Cabo", minDays: 30, maxDays: 59 }, { name: "Sargento", minDays: 60, maxDays: 89 },
    { name: "Marechal", minDays: 90, maxDays: 179 }, { name: "Tenente", minDays: 180, maxDays: 364 },
    { name: "Capitão", minDays: 365, maxDays: Infinity },
];

const monthNames = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const monthNamesFull = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onCompleteOnboarding }) => {
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState({
        firstName: '', lastName: '', habit: null as Habit | null, profilePhotoUrl: 'https://c.animaapp.com/rDKbXW1a/img/rectangle-40@2x.png',
        lastHabitDate: new Date(), enlistmentDate: new Date(), rank: '', retentionDays: 0,
    });
    const [fileName, setFileName] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());
    
    useEffect(() => {
        const calculateRank = () => {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const lastDate = new Date(userData.lastHabitDate); lastDate.setHours(0, 0, 0, 0);
            if (lastDate > today) return { rank: "DATA INVÁLIDA", retentionDays: 0 };
            
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const retentionDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const currentPatent = [...patents].reverse().find(p => retentionDays >= p.minDays);
            return { rank: currentPatent?.name || 'Recruta', retentionDays };
        };
        const { rank, retentionDays } = calculateRank();
        setUserData(prev => ({ ...prev, rank, retentionDays }));
    }, [userData.lastHabitDate]);
    
    const handleFileChange = (file: File | null) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return alert('File is too large (Max 5MB).');
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return alert('Invalid format.');
        
        const reader = new FileReader();
        reader.onload = (e) => setUserData(prev => ({ ...prev, profilePhotoUrl: e.target?.result as string }));
        reader.readAsDataURL(file);
        setFileName(file.name);
    };

    const enlistment = {
        day: userData.enlistmentDate.getDate().toString().padStart(2, '0'),
        month: monthNames[userData.enlistmentDate.getMonth()],
        year: userData.enlistmentDate.getFullYear(),
    };
    
    const stepClasses = { 1: '', 2: 'step-2-active', 3: 'step-3-active', 4: 'step-4-active' };

    const Calendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;
        const days = [];
        
        for (let i = dayOffset; i > 0; i--) {
            const day = new Date(year, month, 0).getDate() - i + 1;
            days.push(<button key={`prev-${i}`} className="text-[#707070]" disabled>{day}</button>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const thisDayDate = new Date(year, month, i);
            const isSelected = thisDayDate.toDateString() === userData.lastHabitDate.toDateString();
            const isFuture = thisDayDate > new Date();
            days.push(
                <button key={i} disabled={isFuture} onClick={() => setUserData(p => ({...p, lastHabitDate: thisDayDate}))}
                    className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs disabled:cursor-default disabled:text-[#707070] 
                    ${isSelected ? 'bg-[#d9d9d9] text-[#11110f] font-medium' : 'hover:bg-zinc-700'}`}>
                    {i}
                </button>
            );
        }
        
        const totalCells = days.length;
        const remainingCells = (totalCells > 35 ? 42 : 35) - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            days.push(<button key={`next-${i}`} className="text-[#707070]" disabled>{i}</button>);
        }

        return (
            <div className="w-full max-w-sm border-[1.5px] border-[#27272a] rounded-lg p-4">
                <div className="flex justify-between items-center text-sm mb-6">
                    <button onClick={() => setCalendarDate(new Date(year, month - 1))}><img src="https://c.animaapp.com/ScVkXsrq/img/vector-1.svg" alt="Prev"/></button>
                    <span>{monthNamesFull[month]} {year}</span>
                    <button onClick={() => setCalendarDate(new Date(year, month + 1))}><img src="https://c.animaapp.com/ScVkXsrq/img/vector.svg" alt="Next"/></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-[#707070] font-medium mb-4">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sxt', 'Sab', 'Dom'].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-y-4">{days}</div>
            </div>
        );
    };

    return (
        <div className="bg-[#0b0b0a] min-h-screen flex flex-col justify-center items-center p-4 lg:p-8 font-['Inter',_sans-serif]">
            <header className="mb-6 flex-shrink-0">
                <img alt="OPIDAS Logos" src="https://c.animaapp.com/rDKbXW1a/img/group-37@2x.png" className="w-[102px] h-auto" style={{ mixBlendMode: 'exclusion' }}/>
            </header>

            <div id="onboardingCard" className={`w-full max-w-7xl border-[1.5px] border-[#27272a] rounded-[13px] relative flex justify-center items-center 
                ${step === 2 ? 'p-0' : 'p-4'} transition-all duration-300`}>
                <main className="flex flex-col lg:flex-row justify-around items-center w-full gap-12 z-10">
                    {/* Identity Card */}
                    <section className={`w-[429px] h-[301px] relative flex-shrink-0 rounded-[13px] overflow-hidden ${step === 2 ? 'hidden' : ''}`}>
                        <div className="absolute inset-0 bg-[#231d17]"></div>
                        <img className="absolute inset-0 w-full h-full mix-blend-overlay" src="https://c.animaapp.com/rDKbXW1a/img/texturecard@2x.png" alt="" />
                        <h1 className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-medium z-10">IDENTIDADE DO CAMPO</h1>
                        <img className="absolute top-3 right-3 w-[50px] h-[20px] mix-blend-exclusion z-10" src="https://c.animaapp.com/rDKbXW1a/img/group-55@2x.png" alt=""/>
                        <img id="cardProfilePhoto" className="absolute top-[44px] left-[85px] w-[100px] h-[100px] object-cover rounded-full z-10" src={userData.profilePhotoUrl} alt="Profile" />
                        
                        <div className="absolute top-[67px] left-[215px] text-xs flex items-center gap-2 z-10">Contra: <span className="border-b-[1.5px] border-dashed border-[#787878] min-w-[100px] font-medium">{userData.habit?.label.toUpperCase()}</span></div>
                        <div className="absolute top-[115px] left-[215px] text-xs flex items-center gap-2 z-10">Assinatura: <span className="border-b-[1.5px] border-dashed border-[#787878] min-w-[100px] font-medium">{userData.lastName.toUpperCase()}</span></div>
                        
                        <div className="absolute top-[157px] left-[85px] text-xs text-[#c5a47e] font-medium z-10">DADOS:</div>
                        <div className="absolute top-[177px] left-[85px] text-xs flex items-center gap-2 z-10">N.º de registro: <span className="border-b-[1.5px] border-dashed border-[#787878] font-medium">M0RSI-00000000</span></div>
                        <div className="absolute top-[204px] left-[85px] text-xs flex items-center gap-2 z-10">Nome do Guerreiro(a): <span className="border-b-[1.5px] border-dashed border-[#787878] font-medium">{`${userData.firstName} ${userData.lastName}`.toUpperCase()}</span></div>
                        <div className="absolute top-[231px] left-[85px] text-xs flex items-center gap-2 z-10">Patente: <span className="border-b-[1.5px] border-dashed border-[#787878] font-medium">{userData.rank.toUpperCase()}</span></div>
                        <div className="absolute top-[258px] left-[85px] text-xs flex items-center gap-2 z-10">Data de Alistamento: 
                            <span className="flex gap-1.5 items-center">
                                <span className="border-b-[1.5px] border-dashed border-[#787878] px-1">{enlistment.day}</span>/
                                <span className="border-b-[1.5px] border-dashed border-[#787878] px-1">{enlistment.month}</span>/
                                <span className="border-b-[1.5px] border-dashed border-[#787878] px-1">{enlistment.year}</span>
                            </span>
                        </div>
                    </section>

                    {/* Form Steps */}
                    <div className={`w-full ${step === 2 ? 'max-w-full' : 'max-w-2xl'} overflow-hidden`}>
                        <div className={`flex w-[400%] transition-transform duration-500 ${stepClasses[step as keyof typeof stepClasses]}`}
                          style={{ transform: `translateX(-${(step-1)*25}%)` }}>
                            
                            {/* Step 1: Identification */}
                            <div className="w-1/4 bg-[#11110f] rounded-[13px] p-10 flex flex-col items-center gap-5 min-h-[570px]">
                                <h1 className="text-xl">Sua identificação</h1>
                                <p className="text-xs text-center text-[#b7b7b7] max-w-xs">Coloque todos seus dados para criar sua identificação para o campo.</p>
                                <div className="flex gap-4 w-full justify-center">
                                    <input type="text" placeholder="Primeiro Nome" value={userData.firstName} onChange={e => setUserData(p => ({...p, firstName: e.target.value}))} className="bg-transparent border border-[#27272a] rounded-lg h-11 px-4 text-sm w-44 placeholder:text-[#707070]"/>
                                    <input type="text" placeholder="Sobrenome" value={userData.lastName} onChange={e => setUserData(p => ({...p, lastName: e.target.value}))} className="bg-transparent border border-[#27272a] rounded-lg h-11 px-4 text-sm w-44 placeholder:text-[#707070]"/>
                                </div>
                                <div className="relative w-[350px]">
                                    <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="w-full h-11 bg-[#11110f] border border-[#27272a] rounded-lg px-4 text-sm text-left flex justify-between items-center">
                                        <span className={!userData.habit ? 'text-[#707070]' : ''}>{userData.habit?.label || 'Contra o hábito'}</span>
                                        <img src="https://c.animaapp.com/rDKbXW1a/img/vector.svg" alt="arrow"/>
                                    </button>
                                    {isDropdownOpen && <ul className="absolute top-full mt-2 w-full bg-[#11110f] border border-[#27272a] rounded-lg z-20">
                                        {habits.map(h => <li key={h.id} onClick={() => {setUserData(p => ({...p, habit: h})); setDropdownOpen(false);}} className="px-4 py-2.5 text-xs cursor-pointer hover:bg-[#27272a] border-t border-[#27272a] first:border-t-0 flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-md border border-[#707070] flex justify-center items-center ${userData.habit?.id === h.id ? 'bg-[#c5a47e]' : ''}`} />{h.label}</li>)}
                                    </ul>}
                                </div>
                                <div className="text-center w-[350px] min-h-[105px]">
                                  <label htmlFor="file-upload" onDrop={(e) => {e.preventDefault(); handleFileChange(e.dataTransfer.files?.[0] ?? null)}} onDragOver={e=>e.preventDefault()} className="w-36 h-20 mx-auto bg-opacity-5 bg-[#c5a47e] border border-dashed border-[#27272a] rounded-lg flex flex-col justify-center items-center cursor-pointer gap-1">
                                      <img src="https://c.animaapp.com/rDKbXW1a/img/union.svg" alt="upload"/>
                                      <span className="text-xs text-[#707070]">Arraste e solte</span>
                                      <p className="text-[8px] text-[#707070]">(PNG, JPG, WEBP) Max 5MB</p>
                                  </label>
                                  <input type="file" id="file-upload" className="hidden" onChange={e => handleFileChange(e.target.files?.[0] ?? null)}/>
                                  <label htmlFor="file-upload" className="block text-xs text-[#707070] cursor-pointer mt-2">Escolha o arquivo</label>
                                  <p className="text-xs text-[#c5a47e] mt-2">{fileName}</p>
                                </div>
                                <div className="mt-auto w-[350px]"><button onClick={() => setStep(2)} className="w-full h-11 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] relative"><span>Avançar</span><img src="https://c.animaapp.com/rDKbXW1a/img/group-54@2x.png" alt="" className="absolute right-1 top-1 w-8 h-8"/></button></div>
                            </div>
                            
                            {/* Step 2: Investment */}
                            <div className="w-1/4 p-4 flex flex-col lg:flex-row gap-4 items-stretch">
                               <div className="flex-1 bg-[#11110f] rounded-xl p-8 flex flex-col justify-center items-center text-center gap-7">
                                  <h1 className="text-xl">Investimento OPIDAS</h1>
                                  <p className="text-xs text-[#b7b7b7] max-w-sm leading-relaxed">Tenha acesso ao <span className="text-white">campo</span>, uma área para a <span className="text-white">comunidade</span> de pessoas que estão alinhados com seu <span className="text-white">propósito</span> de autoconhecimento. E uma <span className="text-white">área de séries</span> que você não encontrará na netflix.</p>
                               </div>
                               <div className="flex-1 bg-[#11110f] rounded-xl p-8 flex flex-col items-center">
                                  <div className="w-[230px] h-[73px] border border-[rgba(183,183,183,0.08)] rounded-xl flex justify-center items-center my-10">
                                      <p className="text-4xl font-medium">R$3<span className="text-2xl font-normal text-zinc-500">/semana</span></p>
                                  </div>
                                  <button onClick={() => setStep(3)} className="w-full max-w-xs h-11 rounded-lg bg-gradient-to-b from-[#eeeeee] to-[#b8b8b8] text-[#11110f] text-sm font-medium shadow-[inset_0_2px_6px_#ffffff,0_0_21px_rgba(255,255,255,0.25)] hover:scale-105 transition-transform">Começar Gratuitamente</button>
                                  <div className="mt-6 mb-8 flex items-center gap-2"><img src="https://c.animaapp.com/8j0Bi7lE/img/vector.svg" alt="secure" className="w-2 h-2.5"/><p className="text-xs text-[#c5a47e]">Pagamento 100% seguro</p></div>
                                  <ul className="list-none self-start ml-10 space-y-4 mb-8 text-xs text-[#b7b7b7]">
                                      {['Patentes Hierárquicas', 'Campo (Chat da comunidade)', 'Área de conhecimento (séries)', 'Veja seu progresso'].map(f => <li key={f} className="flex items-center gap-2"><svg className="w-2.5 h-2.5 text-[#c5a47e]" viewBox="0 0 12 9"><path d="M1 4.5L4.33 8L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{f}</li>)}
                                  </ul>
                                  <p className="text-xs text-[#4d4d4d] mt-auto">7 dias de avaliação gratuita</p>
                                  <button onClick={() => setStep(1)} className="mt-4 text-xs text-[#707070] hover:text-white">Voltar</button>
                               </div>
                            </div>

                            {/* Step 3: Habit Tracking */}
                            <div className="w-1/4 bg-[#11110f] rounded-[13px] p-10 flex flex-col items-center gap-5 min-h-[570px]">
                               <h1 className="text-xl">Última vez que cometeu o hábito</h1>
                               <p className="text-xs text-center text-[#b7b7b7] max-w-xs leading-relaxed">Coloque no calendário a última vez que praticou o hábito de <span className="text-white font-medium">{userData.habit?.label}</span>. Esta etapa calculará sua patente.</p>
                               <Calendar/>
                               <div className="mt-auto w-[350px] space-y-4">
                                  <button onClick={() => setStep(4)} className="w-full h-11 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] relative"><span>Finalizar</span><img src="https://c.animaapp.com/rDKbXW1a/img/group-54@2x.png" alt="" className="absolute right-1 top-1 w-8 h-8"/></button>
                                  <button onClick={() => setStep(2)} className="w-full text-xs text-[#707070] hover:text-white">Voltar</button>
                               </div>
                            </div>
                            
                            {/* Step 4: Welcome */}
                            <div className="w-1/4 bg-[#11110f] rounded-[13px] p-10 flex flex-col items-center gap-5 min-h-[570px]">
                                <h1 className="text-xl text-center max-w-xs mt-6">Bem Vindo(a) <span className="font-medium">{userData.rank} {userData.lastName}</span></h1>
                                <p className="text-xs text-center text-[#b7b7b7] max-w-xs leading-relaxed mt-4">De acordo com o calculo você está a <span className="text-white font-medium">{userData.retentionDays} dias</span> transmutando sua energia sagrada em objetivos maiores. Agora a batalha continua. <span className="text-[#c5a47e]">Bem vindo(a) ao campo.</span> <span className="text-white font-medium">Assista o tutorial abaixo.</span></p>
                                <img src="https://c.animaapp.com/YigEEBTG/img/videotutorial@2x.png" alt="Tutorial" className="w-full max-w-md rounded-lg mt-8 cursor-pointer"/>
                                <div className="mt-auto w-[350px] space-y-4">
                                  <button onClick={onCompleteOnboarding} className="w-full h-11 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] relative"><span>Entrar no Campo</span><img src="https://c.animaapp.com/YigEEBTG/img/group-54@2x.png" alt="" className="absolute right-1 top-1 w-8 h-8"/></button>
                                  <button onClick={() => setStep(3)} className="w-full text-xs text-[#707070] hover:text-white">Voltar</button>
                               </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OnboardingPage;
