
import React, { useState, useEffect, useCallback } from 'react';

// --- DATABASE AND CONFIGURATION (Moved inside component or constants file) ---
const RANKS_ORIGINAL = [
    { id: 'recruta', level: 0, name: 'Recruta', minDays: 0, maxDays: 9, resets: 5, icon: 'https://c.animaapp.com/wYjpt5p0/img/recruta@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/recruta-1@2x.png' },
    { id: 'soldado', level: 1, name: 'Soldado', minDays: 10, maxDays: 29, resets: 4, icon: 'https://c.animaapp.com/wYjpt5p0/img/soldado@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/soldado@2x.png' },
    { id: 'cabo',    level: 2, name: 'Cabo',    minDays: 30, maxDays: 59, resets: 3, icon: 'https://c.animaapp.com/wYjpt5p0/img/cabo@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/cabo@2x.png' },
    { id: 'sargento',level: 3, name: 'Sargento',minDays: 60, maxDays: 89, resets: 3, icon: 'https://c.animaapp.com/wYjpt5p0/img/sargento@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/sargento@2x.png' },
    { id: 'marechal',level: 4, name: 'Marechal',minDays: 90, maxDays: 179, resets: 2, icon: 'https://c.animaapp.com/wYjpt5p0/img/marechal@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/marechal@2x.png' },
    { id: 'tenente', level: 5, name: 'Tenente', minDays: 180, maxDays: 364, resets: 2, icon: 'https://c.animaapp.com/wYjpt5p0/img/tenente@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/tenente@2x.png' },
    { id: 'capitao', level: 6, name: 'Capitão', minDays: 365, maxDays: Infinity, resets: 1, icon: 'https://c.animaapp.com/wYjpt5p0/img/capit-o@2x.png', iconSmall: 'https://c.animaapp.com/wYjpt5p0/img/capit-o@2x.png' }
];
const RANKS_FOR_SEARCH = [...RANKS_ORIGINAL].reverse();

const DB_USERS = [
    { id: 0, sobrenome: "Stravelli", avatar: "https://c.animaapp.com/wYjpt5p0/img/profile-photo-5@2x.png" },
    { id: 1, sobrenome: "Rodriguez", rankId: 'soldado', avatar: "https://c.animaapp.com/wYjpt5p0/img/profile-photo@2x.png" },
    { id: 2, sobrenome: "Silva", rankId: 'cabo', avatar: "https://c.animaapp.com/wYjpt5p0/img/profile-photo-2@2x.png" },
    { id: 3, sobrenome: "Nascimento", rankId: 'sargento', avatar: "https://c.animaapp.com/wYjpt5p0/img/profile-photo-4@2x.png" },
    { id: 4, sobrenome: "Souza", rankId: 'recruta', avatar: "https://i.pravatar.cc/150?u=souza" }
];

const INITIAL_MESSAGES = {
    recruta: [
        { userId: 4, timestamp: "23 Oct • 10:01 AM", text: "Primeiro dia aqui, vamos com tudo!" },
        { userId: 0, timestamp: "23 Oct • 10:05 AM", text: "Bem vindo, Souza! A jornada é longa mas vale a pena." },
        { userId: 4, timestamp: "23 Oct • 10:10 AM", text: "Obrigado pelo apoio, Stravelli!" },
    ],
    soldado: [
        { userId: 1, timestamp: "23 Oct • 11:30 AM", text: "Atingi 15 dias hoje! Me sentindo ótimo." },
        { userId: 0, timestamp: "23 Oct • 11:32 AM", text: "Parabéns, Rodriguez! Continue firme." }
    ],
    cabo: [{ userId: 2, timestamp: "23 Oct • 01:15 PM", text: "Pessoal, alguma dica para superar a marca dos 30 dias?" }],
    sargento: [{ userId: 3, timestamp: "23 Oct • 04:00 PM", text: "A disciplina é a chave. Lembrem-se porque começaram." }],
    marechal: [], tenente: [], capitao: []
};

const defaultUserState = { id: 0, sobrenome: "Stravelli", days: 7, remainingResets: 5 };

const findRank = (rankId: string) => RANKS_ORIGINAL.find(r => r.id === rankId);
const findCurrentRank = (days: number) => {
    for (const rank of RANKS_FOR_SEARCH) {
        if (days >= rank.minDays) return rank;
    }
    return RANKS_ORIGINAL[0];
};

const ChatPage: React.FC = () => {
    const [userState, setUserState] = useState(defaultUserState);
    const [activeServerId, setActiveServerId] = useState('recruta');
    const [messages, setMessages] = useState<{ [key: string]: any[] }>(INITIAL_MESSAGES);
    const [chatInput, setChatInput] = useState('');

    const currentRank = findCurrentRank(userState.days);

    const handleReset = () => {
        if (userState.remainingResets <= 0) return;
        
        const confirmed = confirm(`VOCÊ TEM CERTEZA?\n\nResetar sua contagem de ${userState.days} dias usará 1 de suas ${userState.remainingResets} chances restantes.`);
        if (confirmed) {
            setUserState(prevState => {
                const newResets = prevState.remainingResets - 1;
                const newRank = RANKS_ORIGINAL[0];
                return {
                    ...prevState,
                    days: 0,
                    remainingResets: newResets <= 0 ? 0 : newRank.resets
                };
            });
            setActiveServerId('recruta');
        }
    };

    const handleSendMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && chatInput.trim() !== '') {
            const newMessage = {
                userId: userState.id,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                text: chatInput.trim()
            };

            setMessages(prevMessages => ({
                ...prevMessages,
                [activeServerId]: [...prevMessages[activeServerId], newMessage]
            }));

            setChatInput('');
        }
    };
    
    useEffect(() => {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages, activeServerId]);

    const rankGoalDays = isFinite(currentRank.maxDays) ? currentRank.maxDays + 1 : userState.days;
    const daysInThisTier = userState.days - currentRank.minDays;
    const totalDaysInTier = rankGoalDays - currentRank.minDays;
    const progressPercentage = (userState.days > 0 && totalDaysInTier > 0) 
        ? (daysInThisTier / totalDaysInTier) * 100 
        : (isFinite(totalDaysInTier) ? 0 : 100);

    return (
        <div className="bg-[#0b0b0a] min-h-screen p-4 sm:p-8 flex flex-col font-['Inter',_sans-serif]">
            <img className="absolute top-[49px] left-1/2 -translate-x-1/2 w-[39px] h-[41px] hidden lg:block" alt="Opidas logo" src="https://c.animaapp.com/wYjpt5p0/img/opidas-logo@4x.png" />
            
            <header className="flex flex-col lg:flex-row justify-between items-center gap-4 h-auto lg:h-[90px] mb-4">
                <div className="flex items-center gap-4">
                    <img alt="Profile photo" src="https://c.animaapp.com/wYjpt5p0/img/profile-photo-5@2x.png" className="w-[34px] h-[34px] rounded-full" />
                    <div>
                        <div className="text-[10px] text-[#eeeeee]">Bem vindo(a) de volta</div>
                        <div className="text-xl font-medium text-[#eeeeee]">{currentRank.name} {userState.sobrenome}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-[#151515] p-2 rounded-lg flex-wrap justify-center">
                    <div className="bg-[#0b0b0a] rounded-[5px] w-[41px] h-[41px] flex justify-center items-center">
                        <img alt={currentRank.name} src={currentRank.iconSmall} className="w-[21px]" />
                    </div>
                    <div className="flex flex-col gap-2 w-full text-center sm:w-[180px] sm:text-left">
                        <p className="text-sm">
                            {String(userState.days).padStart(2, '0')}
                            <span className="text-[#909090]">
                                {currentRank.maxDays === Infinity ? ' Dias' : `/${String(rankGoalDays).padStart(2, '0')} Dias`}
                            </span>
                        </p>
                        <div className="w-full h-[9px] bg-[#7a7a7a] rounded-full overflow-hidden">
                            <div className="h-full bg-[rgba(238,238,238,0.91)] rounded-full transition-width duration-300" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                    <button className="icon-button"><img alt="Notificação button" src="https://c.animaapp.com/wYjpt5p0/img/notifica--obutton@2x.png" className="w-[41px] h-[41px]" /></button>
                    <button className="icon-button"><img alt="Light/Dark mode" src="https://c.animaapp.com/wYjpt5p0/img/light-darkmode@2x.png" className="w-[41px] h-[41px]" /></button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[348px_1fr] gap-8 flex-grow overflow-hidden">
                <aside className="border-[1.5px] border-[#151515] rounded-[13px] p-6 flex flex-col overflow-hidden min-h-[500px] lg:min-h-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] text-[#909090]">Campo contra o(a)</div>
                            <div className="text-xl mt-1">Masturbação</div>
                        </div>
                        <img className="w-[35px] h-[34px]" alt="Configuração do campo" src="https://c.animaapp.com/wYjpt5p0/img/configcampo@2x.png" />
                    </div>

                    <nav className="flex items-center gap-6 border-b border-transparent relative mt-4">
                        <div className="absolute h-[25px] w-[1.5px] bg-[#333] left-1/2 -translate-x-1/2"></div>
                        <button className="text-[#585858] text-sm pb-2 text-[#eeeeee] border-b-2 border-[#eeeeee]">Patentes</button>
                        <button className="text-[#585858] text-sm pb-2">Admin</button>
                    </nav>

                    <ul className="flex-grow overflow-y-auto mt-4 pr-2 space-y-3">
                        {RANKS_FOR_SEARCH.map(rank => {
                            const isLocked = rank.level > currentRank.level;
                            return (
                                <li key={rank.id} onClick={() => !isLocked && setActiveServerId(rank.id)}
                                    className={`bg-[#151515] rounded-lg p-3 flex items-center gap-3 relative transition-colors ${!isLocked ? 'cursor-pointer hover:bg-[#2a2a2a]' : 'cursor-not-allowed'}`}>
                                    <div className="w-[40px] h-[40px]"><img alt={rank.name} src={rank.icon} /></div>
                                    <div className="flex-grow">
                                        <div className="text-sm">{rank.name}</div>
                                        <div className="text-[10px] text-[#909090]">Dias: {rank.minDays}{rank.maxDays === Infinity ? '+' : '-' + rank.maxDays}</div>
                                    </div>
                                    {rank.id === 'recruta' && (
                                        <div className="text-right pr-2.5">
                                            <div className="text-[10px] text-[#909090]">1.054 membros</div>
                                            <div className="text-[10px] text-[#c5a47e]">579 online</div>
                                        </div>
                                    )}
                                    <div className={`absolute w-[3px] h-[3px] rounded-full top-1/2 right-3 -translate-y-1/2 ${activeServerId === rank.id ? 'bg-[#c5a47e]' : 'bg-[#eeeeee]'}`}></div>
                                    {isLocked && <div className="absolute inset-0 bg-[#151515b2] rounded-lg"></div>}
                                </li>
                            );
                        })}
                    </ul>

                    <div className="mt-auto text-center">
                        <p className="text-[10px] mb-2 text-[#909090]">Chances de reset <span className="text-[#eeeeee]">{userState.remainingResets} restantes</span></p>
                        <button onClick={handleReset} disabled={userState.remainingResets <= 0} className="bg-[#7d0f0f] text-[#eeeeee] text-sm w-full p-3 rounded-lg transition-colors hover:bg-[#a11b1b] disabled:bg-[#5a2828] disabled:cursor-not-allowed">
                            {userState.remainingResets <= 0 ? 'Sem chances' : 'Resetar contagem'}
                        </button>
                    </div>
                </aside>
                
                <main className="border-[1.5px] border-[#151515] rounded-[13px] flex flex-col overflow-hidden relative p-6 h-[70vh] min-h-[600px] lg:h-auto lg:min-h-0">
                    <header className="flex items-center gap-4 pr-4 flex-shrink-0">
                        <img alt="Logo Chat Opidas" src="https://c.animaapp.com/wYjpt5p0/img/logochatopidas@4x.png" className="w-[34px] h-[34px]" />
                        <button className="icon-button"><img alt="Membros do grupo" src="https://c.animaapp.com/wYjpt5p0/img/pessoasdogrupobot-o@2x.png" className="w-[34px] h-[34px]" /></button>
                        <div className="relative flex-grow">
                            <input type="search" placeholder="Pesquisar" className="w-full bg-transparent border border-[#151515] rounded-full py-2.5 pr-10 pl-5 text-[#eeeeee] text-sm placeholder-[#585858] outline-none" />
                            <img className="absolute right-5 top-1/2 -translate-y-1/2 w-[14px] h-[14px]" alt="Search" src="https://c.animaapp.com/wYjpt5p0/img/vector.svg" />
                        </div>
                        <button className="icon-button"><img alt="Tela cheia" src="https://c.animaapp.com/wYjpt5p0/img/deixarocampoemtelacheia@2x.png" className="w-[34px] h-[34px]" /></button>
                    </header>

                    <div id="messages-container" className="flex-grow overflow-y-auto py-6 pr-4 space-y-6">
                        {messages[activeServerId].map((msg, index) => {
                             const user = DB_USERS.find(u => u.id === msg.userId);
                             if (!user) return null;

                             const isCurrentUser = user.id === userState.id;
                             const rankOfSender = findRank(isCurrentUser ? currentRank.id : (user.rankId || 'recruta'));
                             const displayName = `${rankOfSender?.name || 'Membro'} ${user.sobrenome}`;

                            return (
                                <div key={index} className="flex gap-3 max-w-[80%]">
                                    <img className="w-[34px] h-[34px] rounded-full flex-shrink-0" alt="Avatar" src={user.avatar} />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] font-medium">{displayName}</div>
                                            <div className="text-[10px] text-[#909090]">{msg.timestamp}</div>
                                        </div>
                                        <div className="bg-[#151515] p-3 rounded-[5px] text-sm leading-snug mt-1">{msg.text}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-[#0b0b0a] via-[#0b0b0a] to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 bg-[#151515] rounded-lg px-4 flex-grow h-[54px]">
                                <button><img src="https://c.animaapp.com/wYjpt5p0/img/uploadbutton.svg" alt="Upload" /></button>
                                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleSendMessage} placeholder={`Conversar no servidor ${findRank(activeServerId)?.name}`} className="bg-transparent border-none outline-none text-[#eeeeee] w-full text-sm placeholder-[#585858]" />
                                <button><img src="https://c.animaapp.com/wYjpt5p0/img/sendemojibutton.svg" alt="Emoji" /></button>
                            </div>
                            <button><img alt="Gravar voz" src="https://c.animaapp.com/wYjpt5p0/img/voicebutton@2x.png" className="w-[53px] h-[54px]" /></button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatPage;
