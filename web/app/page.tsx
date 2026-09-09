'use client';

import { useMemo, useState } from 'react';

type Check = { name: string; status: 'pending' | 'passed' | 'failed'; evidence: string };
const statuses = ['intake', 'requirements_ready', 'implementation', 'testing', 'review', 'blocked', 'done'] as const;
const expectedOwner: Record<string, string> = { intake: 'orchestrator', requirements_ready: 'requirements', implementation: 'developer', testing: 'tester', review: 'reviewer', blocked: 'orchestrator', done: 'orchestrator' };

export default function Home() {
  const [id, setId] = useState('TASK-001');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('intake');
  const [iteration, setIteration] = useState(1);
  const [criteria, setCriteria] = useState(['']);
  const [notes, setNotes] = useState(['']);
  const [checks, setChecks] = useState<Check[]>([]);
  const [copied, setCopied] = useState(false);
  const owner = expectedOwner[status];
  const task = useMemo(() => ({ id, title, status, owner, iteration, requirements: { summary, acceptance_criteria: criteria.filter(Boolean) }, artifacts: [], checks, notes: notes.filter(Boolean), history: [{ at: new Date().toISOString(), actor: 'human', from: null, to: 'intake', summary: 'Task created in Task Builder.' }] }), [id, title, status, owner, iteration, summary, criteria, checks, notes]);
  const json = JSON.stringify(task, null, 2);
  const errors = [!id.trim() && 'Task ID is required', !title.trim() && 'Title is required', status !== 'intake' && !criteria.some(c => c.trim()) && 'Add an acceptance criterion for this status'].filter(Boolean) as string[];
  function download() { if (errors.length) return; const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `${id || 'task'}.json`; a.click(); URL.revokeObjectURL(url); }
  async function copy() { await navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  return <main>
    <header className="topbar"><a className="brand" href="#top"><span>DL</span> Delivery Lab</a><div className="header-meta"><span className="status-dot" /> Local draft <a href="https://github.com/gitcty/swdeliveryagent" target="_blank">Repository ↗</a></div></header>
    <section className="hero" id="top"><div><p className="eyebrow">Software delivery workflow</p><h1>Shape the work.<br/><em>Ship with clarity.</em></h1><p className="lede">Build a valid task record for your five-agent delivery cycle—without hand-editing JSON.</p></div><div className="flow" aria-label="Workflow stages">{['Brief','Build','Test','Review'].map((step,i)=><div key={step}><b>0{i+1}</b><span>{step}</span></div>)}</div></section>
    <section className="workspace">
      <form className="builder" onSubmit={e=>e.preventDefault()}>
        <Section number="01" title="Task identity" text="Give this piece of work a clear handle." />
        <div className="grid two"><label>Task ID<input value={id} onChange={e=>setId(e.target.value)} placeholder="TASK-001"/></label><label>Current phase<select value={status} onChange={e=>setStatus(e.target.value as typeof status)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></label></div>
        <label>Task title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add a health-check endpoint"/></label>
        <div className="owner-line"><span>Assigned automatically</span><strong>{owner}</strong><label>Iteration <input type="number" min="1" value={iteration} onChange={e=>setIteration(Math.max(1,Number(e.target.value)))}/></label></div>
        <Section number="02" title="Delivery contract" text="Describe the outcome, then make it testable." />
        <label>Outcome summary<textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder="What should be true when this work is complete?" rows={3}/></label>
        <ListEditor title="Acceptance criteria" hint="One observable result per line" values={criteria} setValues={setCriteria} placeholder="GET /health returns 200 with service status"/>
        <Section number="03" title="Context & checks" text="Add useful boundaries and verification steps." />
        <ListEditor title="Notes" hint="Assumptions, exclusions, or decisions" values={notes} setValues={setNotes} placeholder="Deployment is excluded from this task"/>
        <div className="list-title"><div><label>Checks</label><small>Optional until implementation begins</small></div><button type="button" onClick={()=>setChecks([...checks,{name:'',status:'pending',evidence:''}])}>+ Add check</button></div>
        {checks.map((c,i)=><div className="check-row" key={i}><input aria-label="Check name" placeholder="Unit tests" value={c.name} onChange={e=>setChecks(checks.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/><select aria-label="Check status" value={c.status} onChange={e=>setChecks(checks.map((x,j)=>j===i?{...x,status:e.target.value as Check['status']}:x))}><option>pending</option><option>passed</option><option>failed</option></select><input aria-label="Evidence" placeholder="Command or run link" value={c.evidence} onChange={e=>setChecks(checks.map((x,j)=>j===i?{...x,evidence:e.target.value}:x))}/><button type="button" aria-label="Remove check" onClick={()=>setChecks(checks.filter((_,j)=>j!==i))}>×</button></div>)}
      </form>
      <aside className="preview"><div className="preview-head"><div><span className="live-dot"/> LIVE OUTPUT</div><button onClick={copy}>{copied?'Copied!':'Copy JSON'}</button></div><pre>{json}</pre><div className={errors.length?'validation warn':'validation'}><span>{errors.length?'!':'✓'}</span><div><strong>{errors.length?`${errors.length} item${errors.length>1?'s':''} to fix`:'Ready to use'}</strong><p>{errors[0]||'This task record passes the builder checks.'}</p></div></div><button className="download" type="button" disabled={!!errors.length} onClick={download}>Download task file <span>↓</span></button><p className="tip">Save the file in <code>tasks/</code>, then ask the Orchestrator to run the delivery cycle.</p></aside>
    </section>
    <footer><span>Built for focused delivery</span><p>Orchestrator · Requirements · Developer · Tester · Reviewer</p></footer>
  </main>;
}

function Section({number,title,text}:{number:string;title:string;text:string}) { return <div className="section-head"><div><span>{number}</span><h2>{title}</h2></div><p>{text}</p></div>; }
function ListEditor({title,hint,values,setValues,placeholder}:{title:string;hint:string;values:string[];setValues:React.Dispatch<React.SetStateAction<string[]>>;placeholder:string}) { return <div className="list-editor"><div className="list-title"><div><label>{title}</label><small>{hint}</small></div><button type="button" onClick={()=>setValues([...values,''])}>+ Add</button></div>{values.map((value,i)=><div className="list-row" key={i}><span>{String(i+1).padStart(2,'0')}</span><input value={value} onChange={e=>setValues(items=>items.map((item,j)=>j===i?e.target.value:item))} placeholder={placeholder}/><button type="button" aria-label={`Remove ${title} ${i+1}`} onClick={()=>setValues(items=>items.length===1?['']:items.filter((_,j)=>j!==i))}>×</button></div>)}</div>; }
