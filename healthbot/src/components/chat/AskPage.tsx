'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { Topbar } from '@/components/ui/Topbar'
import { callClaude } from '@/lib/anthropic'
import { fmt } from '@/lib/utils'
import type { PageProps } from '@/components/layout/types'
import type { AnthropicContent } from '@/types'

type ChatMode = 'all' | 'records' | 'symptoms' | 'general'

interface Message {
  role: 'user' | 'assistant'
  displayHtml: string
  imageDataUrl?: string
  apiContent: string | AnthropicContent[]
}

const CHIPS: Record<ChatMode, string[]> = {
  all: ['When did I last see a doctor?', 'What medicines am I taking?', 'Explain my report in simple words', 'Summarize last 3 months'],
  records: ['Last doctor visit?', 'My diagnoses?', 'Show shoulder pain history', 'When was I last prescribed amoxicillin?'],
  symptoms: ['I have chest pain', 'Fever for 3 days, sore throat', 'Stomach pain after eating', 'Recurring morning headache'],
  general: ['Is Panadol safe daily?', 'What does HbA1c 5.8% mean?', 'Foods to avoid with high BP?', 'Signs of diabetes?'],
}

function fmtBotText(t: string): string {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:5px;margin:2px 0"><span style="color:var(--teal);flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/📋/g, '<span class="chat-stag">📋 Records</span>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

export function AskPage({ goBack }: PageProps) {
  const activeFam = useStore(s => s.activeFam)
  const apiKey = useStore(s => s.apiKey)
  const setApiKey = useStore(s => s.setApiKey)
  const getFamilyEvents = useStore(s => s.getFamilyEvents)
  const getFamilyData = useStore(s => s.getFamilyData)

  const [chatMode, setChatMode] = useState<ChatMode>('all')
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    displayHtml: `Hi! 👋 I'm your HealthBot AI assistant. I can:<br><br><strong>📎 Analyze a report</strong> — attach it with the paperclip button<br><strong>📋 Your records</strong> — ask about visits, medicines, diagnoses<br><strong>🤒 Symptoms</strong> — describe how you feel<br><strong>🩺 Health Q&A</strong> — medicines, conditions, tests<br><br>${apiKey ? '✅ AI is connected!' : '⚙️ Add your API key for full AI.'}`,
    apiContent: '',
  }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatImg, setChatImg] = useState<{ base64: string; mimeType: string; dataUrl: string } | null>(null)
  const [showApiInput, setShowApiInput] = useState(false)
  const [apiInput, setApiInput] = useState('')

  const winRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (winRef.current) winRef.current.scrollTop = winRef.current.scrollHeight
  }, [messages])

  function buildSystemPrompt() {
    const evs = getFamilyEvents(activeFam)
    const famData = getFamilyData(activeFam)
    let ctx = `Patient: ${famData.profile.name}\n\n`
    if (evs.length) {
      ctx += `HEALTH RECORDS (${evs.length}):\n\n`
      evs.slice(0, 20).forEach(e => {
        ctx += `[${fmt(e.date)} — ${e.eventType}]\n`
        if (e.doctor) ctx += `Doctor: ${e.doctor}${e.hospital ? ' at ' + e.hospital : ''}\n`
        if (e.diagnosis) ctx += `Diagnosis: ${e.diagnosis}\n`
        if ((e.medicines ?? []).length) ctx += `Medicines: ${e.medicines.map(m => `${m.name} ${m.dose} ${m.frequency}`).join('; ')}\n`
        if ((e.tests ?? []).length) ctx += `Tests: ${e.tests.map(t => `${t.name}${t.result ? ' — ' + t.result : ''}`).join('; ')}\n`
        ctx += '\n'
      })
    }
    return `You are HealthBot, a warm AI health assistant for a Pakistani health tracking app. You speak clear, friendly English a non-medical person can understand.

CAPABILITIES:
1. REPORT ANALYSIS — When the user shares a medical image, analyze every value in plain English. Use ✅ normal, ⚠️ borderline, 🔴 concerning. Explain what each means in simple words.
2. PERSONAL RECORDS — Reference specific dates/details from the records below.
3. SYMPTOM CHECK — List 2-4 possible causes, red flags, always recommend seeing a doctor.
4. GENERAL HEALTH Q&A — Accurate, Pakistan-relevant answers.

MODE: ${chatMode}

${ctx}

RULES: Use simple language. Tag record references with 📋. Never diagnose definitively. Always end symptom answers with: Please see a doctor if symptoms are severe or persistent.`
  }

  async function handleAttach(file: File) {
    const { fileToBase64 } = await import('@/lib/utils')
    const data = await fileToBase64(file)
    setChatImg(data)
    if (!input.trim()) setInput('Please analyze this report and explain the results in simple words.')
    textRef.current?.focus()
  }

  async function send() {
    const q = input.trim()
    const hasImg = !!chatImg
    if (!q && !hasImg) return

    const displayQ = q || 'Analyze this report'
    const imgSnapshot = chatImg
    setChatImg(null)
    setInput('')
    setSending(true)

    setMessages(prev => [...prev, {
      role: 'user',
      displayHtml: `${q}${hasImg ? `<br><img src="${imgSnapshot!.dataUrl}" style="max-width:160px;border-radius:6px;margin-top:6px;display:block">` : ''}`,
      imageDataUrl: imgSnapshot?.dataUrl,
      apiContent: hasImg
        ? [
            { type: 'image' as const, source: { type: 'base64' as const, media_type: imgSnapshot!.mimeType, data: imgSnapshot!.base64 } },
            { type: 'text' as const, text: q || 'Please analyze this medical report and explain everything in plain English.' },
          ]
        : q,
    }])

    // Typing indicator
    const typingId = Date.now().toString()
    setMessages(prev => [...prev, {
      role: 'assistant', displayHtml: '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>', apiContent: '', key: typingId,
    } as any])

    try {
      let reply = ''
      if (apiKey) {
        const history = messages
          .filter(m => m.apiContent)
          .map(m => ({ role: m.role, content: m.apiContent }))

        const newMsg = hasImg
          ? [
              { type: 'image' as const, source: { type: 'base64' as const, media_type: imgSnapshot!.mimeType, data: imgSnapshot!.base64 } },
              { type: 'text' as const, text: q || 'Analyze this medical image in plain English.' },
            ] as AnthropicContent[]
          : q

        reply = await callClaude(apiKey, buildSystemPrompt(), [...history.slice(-8), { role: 'user', content: newMsg }])
      } else {
        await new Promise(r => setTimeout(r, 700))
        reply = offlineReply(q, hasImg)
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !(m as any).key === false || (m as any).key !== typingId)
        // Remove typing bubble (last item) and add real reply
        return [...prev.slice(0, -1), {
          role: 'assistant',
          displayHtml: fmtBotText(reply),
          apiContent: reply,
        }]
      })
    } catch (e: any) {
      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        displayHtml: `⚠️ Error: ${e.message}`,
        apiContent: '',
      }])
    }
    setSending(false)
  }

  function offlineReply(q: string, hasImg: boolean): string {
    if (hasImg) return `📊 **Report Analysis (Offline)**\n\nTo get a full plain-English analysis, add your Anthropic API key via ⚙ API Key. I'll go value by value and explain everything simply.`
    const ql = q.toLowerCase()
    if (ql.includes('doctor')) return `📋 Ask me about your specific records once the API key is connected, or type a question and I'll answer from your stored data.`
    if (ql.includes('headache')) return `**Common causes of headache:**\n- Tension headache — stress, eye strain\n- Dehydration\n- Migraine — throbbing, light sensitivity\n- High BP\n\n🚨 Sudden severe headache? Go to ER.\n\nPlease see a doctor if symptoms are severe or persistent.`
    if (ql.includes('fever')) return `**Common causes of fever:**\n- Viral infection — flu, cold\n- Dengue — common in South Asia\n- Bacterial infection\n\n🚨 Fever 3+ days or 39.5°C+ — see a doctor.\n\nPlease see a doctor if symptoms are severe or persistent.`
    if (ql.includes('hba1c') || ql.includes('a1c')) return `**HbA1c explained:**\n- ✅ Below 5.7% — Normal\n- ⚠️ 5.7–6.4% — Pre-diabetes\n- 🔴 6.5%+ — Diabetes\n\nAt 5.8%, diet and exercise can fully reverse this.`
    return `I can help with:\n- 📎 **Analyze a report** — attach with the paperclip\n- 📋 **Your records** — visits, medicines, diagnoses\n- 🤒 **Symptoms** — describe how you feel\n- 🩺 **Health Q&A** — medicines, conditions\n\nAdd your API key via ⚙ API Key for real AI responses.`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
          <div>
            <div className="topbar-title">HealthBot AI</div>
            <div style={{ fontSize: 10, color: apiKey ? 'var(--teal)' : 'var(--amber)' }}>
              {apiKey ? '● AI connected' : '● Offline mode'}
            </div>
          </div>
        </div>
        <button
          onClick={() => { setShowApiInput(!showApiInput); setApiInput(apiKey) }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1px solid var(--bdr)', borderRadius: 10, fontSize: 11, fontWeight: 500, color: 'var(--t2)', background: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ⚙ API Key
        </button>
      </div>

      {showApiInput && (
        <div style={{ padding: '10px 14px', background: 'var(--amber-l)', borderBottom: '1px solid var(--amber-m)', display: 'flex', gap: 8 }}>
          <input
            type="password"
            className="form-input"
            placeholder="sk-ant-..."
            value={apiInput}
            onChange={e => setApiInput(e.target.value)}
            style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
          />
          <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12, flex: 'none' }}
            onClick={() => { setApiKey(apiInput.trim()); setShowApiInput(false) }}>Save</button>
          <button className="btn btn-ghost" style={{ padding: '7px 10px', fontSize: 12 }}
            onClick={() => { setApiKey(''); setShowApiInput(false) }}>Clear</button>
        </div>
      )}

      {/* Mode tabs */}
      <div className="chat-tabs">
        {(['all','records','symptoms','general'] as ChatMode[]).map(m => (
          <button key={m} className={`chat-tab ${chatMode === m ? 'active' : ''}`} onClick={() => setChatMode(m)}>
            {m === 'all' ? '💬 All-in-one' : m === 'records' ? '📋 My Records' : m === 'symptoms' ? '🤒 Symptoms' : '🩺 Health Q&A'}
          </button>
        ))}
      </div>

      {/* Chips */}
      <div className="chip-row">
        {CHIPS[chatMode].map(c => (
          <div key={c} className="chip" onClick={() => { setInput(c); textRef.current?.focus() }}>{c}</div>
        ))}
      </div>

      {/* Chat window */}
      <div className="chat-window" ref={winRef} style={{ paddingBottom: 80 }}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
            dangerouslySetInnerHTML={{ __html: m.displayHtml }}
          />
        ))}
      </div>

      {/* Input area */}
      <div className="chat-input-area" style={{ position: 'fixed', bottom: 60, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430 }}>
        {chatImg && (
          <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
            <img src={chatImg.dataUrl} alt="" style={{ maxHeight: 80, borderRadius: 8, border: '1px solid var(--bdr)', display: 'block' }} />
            <button onClick={() => setChatImg(null)} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', color: 'white', fontSize: 11, cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: 10, color: 'var(--teal)', marginTop: 3 }}>📸 Image attached</div>
          </div>
        )}
        <div className="chat-input-row">
          <label className="chat-attach-btn" title="Attach image">
            📎
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleAttach(e.target.files[0])} />
          </label>
          <textarea
            ref={textRef}
            className="chat-textarea"
            rows={1}
            value={input}
            placeholder="Ask anything, or attach a report to analyze…"
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          />
          <button className="chat-send-btn" onClick={send} disabled={sending}>➤</button>
        </div>
        <div className="chat-disclaimer">⚠️ Not a substitute for a doctor. Always consult a physician.</div>
      </div>
    </div>
  )
}
