'use client';
import {Fragment,useMemo,useState} from 'react';
import {Plus,X,ArrowLeft} from 'lucide-react';
import './rates.css';

const DEFAULT_AMOUNTS=[35,69,99,199,299,499,999,1999,4999];
const DEFAULT_TIERS=[{id:1,min:0,pct:70},{id:2,min:300,pct:80},{id:3,min:1000,pct:100}];
let tierId=10;
const PCTS=[70,80,100];

const n0=v=>Math.round(v).toLocaleString('th-TH');
const n2=v=>v.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>(v*100).toLocaleString('th-TH',{maximumFractionDigits:1})+'%';

function calc(amount,pct,{full,fee,vat}){
  const exVat=vat?amount/1.07:amount;
  const vatAmt=amount-exVat;
  const feeAmt=exVat*fee/100;
  const net=exVat-feeAmt;
  const coins=Math.round(amount*full*pct/100);
  const coinValue=coins/full;
  return {amount,pct,coins,coinValue,vatAmt,feeAmt,net,netPct:amount?net/amount:0,netVsCoin:coinValue?net/coinValue:0,perBaht:full*pct/100};
}
const tierFor=(amount,tiers)=>{let t=tiers[0];for(const x of tiers)if(amount>=x.min)t=x;return t};

function Num({value,onChange,step=1,min=0,w}){
  return <input className="rt-num" style={w?{width:w}:undefined} type="number" inputMode="decimal" min={min} step={step} value={value} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))}/>;
}

function Table({rows,s,tiered,base}){
  const tot=rows.reduce((a,r)=>({amount:a.amount+r.amount,coins:a.coins+r.coins,coinValue:a.coinValue+r.coinValue,vatAmt:a.vatAmt+r.vatAmt,feeAmt:a.feeAmt+r.feeAmt,net:a.net+r.net}),{amount:0,coins:0,coinValue:0,vatAmt:0,feeAmt:0,net:0});
  return <div className="rt-tablewrap"><table className="rt-table">
    <thead><tr>
      <th>ยอดเติม (฿)</th><th>อัตรา</th><th>X / ฿1</th><th>เหรียญที่ได้</th>{tiered&&<th>โบนัส vs ขั้นแรก</th>}<th>มูลค่าเหรียญ (฿)<small>อัตราเต็ม</small></th>
      {s.vat&&<th>VAT (฿)</th>}<th>ค่าธรรมเนียมอินแอป (฿)</th><th>แอปเหลือ (฿)</th><th>แอปเหลือ %<small>ของยอดเติม</small></th><th>แอปเหลือ %<small>ของมูลค่าเหรียญ</small></th>
    </tr></thead>
    <tbody>{rows.map((r,i)=>{const bonus=tiered?r.coins-Math.round(r.amount*base):0;return <tr key={i}>
      <td className="rt-strong">{n0(r.amount)}</td>
      <td><span className={'rt-pill p'+r.pct}>{r.pct}%</span></td>
      <td>{n0(r.perBaht)}</td>
      <td className="rt-strong rt-coin">{n0(r.coins)}</td>
      {tiered&&<td className={bonus>0?'rt-pos':'rt-dim'}>{bonus>0?'+'+n0(bonus):'—'}</td>}
      <td>{n2(r.coinValue)}</td>
      {s.vat&&<td className="rt-neg">−{n2(r.vatAmt)}</td>}
      <td className="rt-neg">−{n2(r.feeAmt)}</td>
      <td className="rt-strong rt-net">{n2(r.net)}</td>
      <td>{pc(r.netPct)}</td>
      <td className={r.netVsCoin>=1?'rt-pos':'rt-neg'}>{pc(r.netVsCoin)}</td>
    </tr>})}</tbody>
    <tfoot><tr><td>{n0(tot.amount)}</td><td colSpan={2}>รวม</td><td>{n0(tot.coins)}</td>{tiered&&<td/>}<td>{n2(tot.coinValue)}</td>{s.vat&&<td>−{n2(tot.vatAmt)}</td>}<td>−{n2(tot.feeAmt)}</td><td>{n2(tot.net)}</td><td>{pc(tot.amount?tot.net/tot.amount:0)}</td><td>{pc(tot.coinValue?tot.net/tot.coinValue:0)}</td></tr></tfoot>
  </table></div>;
}

function ResultCard({title,r,s}){
  return <div className="rt-card">
    <div className="rt-card-head"><b>{title}</b><span className={'rt-pill p'+r.pct}>{r.pct}%</span></div>
    <div className="rt-big">{n0(r.coins)} <span>X</span></div>
    <dl>
      <dt>มูลค่าเหรียญ (อัตราเต็ม)</dt><dd>฿{n2(r.coinValue)}</dd>
      {s.vat&&<><dt>VAT</dt><dd className="rt-neg">−฿{n2(r.vatAmt)}</dd></>}
      <dt>ค่าธรรมเนียมอินแอป</dt><dd className="rt-neg">−฿{n2(r.feeAmt)}</dd>
      <dt>แอปเหลือ</dt><dd className="rt-net">฿{n2(r.net)}</dd>
      <dt>% ของยอดเติม</dt><dd>{pc(r.netPct)}</dd>
      <dt>% ของมูลค่าเหรียญ</dt><dd className={r.netVsCoin>=1?'rt-pos':'rt-neg'}>{pc(r.netVsCoin)}</dd>
    </dl>
  </div>;
}

export default function RatesPage(){
  const [full,setFull]=useState(100);
  const [fee,setFee]=useState(30);
  const [vat,setVat]=useState(false);
  const [amounts,setAmounts]=useState(DEFAULT_AMOUNTS);
  const [newAmt,setNewAmt]=useState('');
  const [fixedPct,setFixedPct]=useState(80);
  const [tiers,setTiers]=useState(DEFAULT_TIERS);
  const [tryAmt,setTryAmt]=useState(500);

  const s={full:Number(full)||0,fee:Number(fee)||0,vat};
  const sortedTiers=useMemo(()=>tiers.map(t=>({min:Number(t.min)||0,pct:Number(t.pct)||0})).sort((a,b)=>a.min-b.min),[tiers]);
  const list=[...amounts].sort((a,b)=>a-b);
  const fixedRows=list.map(a=>calc(a,fixedPct,s));
  const tierRows=list.map(a=>calc(a,tierFor(a,sortedTiers).pct,s));
  const basePerBaht=s.full*(sortedTiers[0]?.pct||0)/100;
  const t=Number(tryAmt)||0;

  const addAmt=()=>{const v=Number(newAmt);if(v>0&&!amounts.includes(v))setAmounts([...amounts,v]);setNewAmt('')};
  const setTier=(i,k,v)=>setTiers(tiers.map((x,j)=>j===i?{...x,[k]:v}:x));
  const addTier=()=>{const last=sortedTiers[sortedTiers.length-1]||{min:0,pct:70};setTiers([...tiers,{id:++tierId,min:last.min+1000,pct:Math.min(last.pct+10,150)}])};

  return <div className="rt-app">
    <header className="rt-top">
      <a className="rt-logo" href="/">kolx<span>✳</span></a>
      <a className="rt-back" href="/"><ArrowLeft size={15}/> หน้าหลัก</a>
    </header>

    <div className="rt-sticky">
      <div className="rt-settings">
        <label>อัตราเต็ม <span className="rt-eq">฿1 =</span><Num value={full} onChange={setFull} w={84}/><span>X</span></label>
        <label>ค่าธรรมเนียมอินแอป <Num value={fee} onChange={setFee} step={0.5} w={70}/><span>%</span>
          <span className="rt-chips">{[0,15,30].map(v=><button key={v} className={Number(fee)===v?'on':''} onClick={()=>setFee(v)}>{v}%</button>)}</span>
        </label>
        <label className="rt-check"><input type="checkbox" checked={vat} onChange={e=>setVat(e.target.checked)}/> หัก VAT 7% ก่อน</label>
      </div>
    </div>

    <main className="rt-main">
      <section className="rt-hero">
        <span className="rt-kicker">ข้อ 1</span>
        <h1>แนวทางการกำหนดอัตราแลก X-Coin สำหรับผู้ใช้งานทุกคน</h1>
      </section>

      <section className="rt-block">
        <div className="rt-block-head"><h2>ตัวเลือกยอดเติม (฿)</h2></div>
        <div className="rt-amounts">
          {list.map(a=><span key={a} className="rt-amt">{n0(a)}<button aria-label={'ลบ '+a} onClick={()=>setAmounts(amounts.filter(x=>x!==a))}><X size={13}/></button></span>)}
          <span className="rt-add"><Num value={newAmt} onChange={setNewAmt} w={90}/><button onClick={addAmt}><Plus size={14}/> เพิ่ม</button></span>
          <button className="rt-reset" onClick={()=>setAmounts(DEFAULT_AMOUNTS)}>ค่าเริ่มต้น</button>
        </div>
      </section>

      <section className="rt-block">
        <div className="rt-block-head">
          <span className="rt-tag">รูปแบบที่ 1</span>
          <h2>อัตราแลกเดียว (Fixed Rate)</h2>
        </div>
        <div className="rt-seg">{PCTS.map(p=><button key={p} className={fixedPct===p?'on':''} onClick={()=>setFixedPct(p)}>{p}%<small>฿1 = {n0(s.full*p/100)} X</small></button>)}</div>
        <Table rows={fixedRows} s={s}/>

        <h3 className="rt-sub">เทียบ 70% / 80% / 100% ทุกยอดเติม</h3>
        <div className="rt-tablewrap"><table className="rt-table rt-compact">
          <thead><tr><th rowSpan={2}>ยอดเติม (฿)</th>{PCTS.map(p=><th key={p} colSpan={2} className={'rt-colgroup p'+p}>{p}%</th>)}</tr>
          <tr>{PCTS.map(p=><Fragment key={p}><th>เหรียญ</th><th>แอปเหลือ / มูลค่าเหรียญ</th></Fragment>)}</tr></thead>
          <tbody>{list.map(a=><tr key={a}><td className="rt-strong">{n0(a)}</td>{PCTS.map(p=>{const r=calc(a,p,s);return <Fragment key={p}><td className="rt-coin">{n0(r.coins)}</td><td className={r.netVsCoin>=1?'rt-pos':'rt-neg'}>{pc(r.netVsCoin)}</td></Fragment>})}</tr>)}</tbody>
        </table></div>
      </section>

      <section className="rt-block">
        <div className="rt-block-head">
          <span className="rt-tag">รูปแบบที่ 2</span>
          <h2>อัตราแลกตามเปอร์เซ็นต์ (Percentage-Based Rate)</h2>
          <p className="rt-note">เติมเยอะ ได้เรทสูง · เติมน้อย ได้เรทต่ำ</p>
        </div>

        <div className="rt-tiers">
          {tiers.map((tr,i)=>{const mn=Number(tr.min)||0,pt=Number(tr.pct)||0;const next=sortedTiers.find(x=>x.min>mn);const rank=sortedTiers.findIndex(x=>x.min===mn)+1;return <div className="rt-tier" key={tr.id}>
            <span className="rt-tier-no">ขั้น {rank}</span>
            <div className="rt-tier-range">ตั้งแต่ ฿<Num value={tr.min} onChange={v=>setTier(i,'min',v)} w={90}/>{next?<span>ถึง ฿{n0(next.min-1)}</span>:<span>ขึ้นไป</span>}</div>
            <div className="rt-tier-rate">อัตรา <Num value={tr.pct} onChange={v=>setTier(i,'pct',v)} w={70}/>%<span className="rt-dim">= ฿1 → {n0(s.full*pt/100)} X</span></div>
            {tiers.length>1&&<button className="rt-x" aria-label="ลบขั้น" onClick={()=>setTiers(tiers.filter((_,j)=>j!==i))}><X size={14}/></button>}
          </div>})}
          <div className="rt-tier-actions">
            <button onClick={addTier}><Plus size={14}/> เพิ่มขั้น</button>
            <button onClick={()=>setTiers(DEFAULT_TIERS)}>ค่าเริ่มต้น 70 / 80 / 100</button>
          </div>
        </div>

        <div className="rt-ladder">{list.map(a=>{const r=tierRows.find(x=>x.amount===a);return <div key={a} className="rt-bar">
          <div className={'rt-bar-fill p'+r.pct} style={{height:Math.max(6,Math.min(100,r.pct))+'%'}}><span>{r.pct}%</span></div>
          <small>฿{n0(a)}</small>
        </div>})}</div>

        <Table rows={tierRows} s={s} tiered base={basePerBaht}/>
      </section>

      <section className="rt-block">
        <div className="rt-block-head"><h2>ลองใส่ยอดเติม</h2></div>
        <div className="rt-try"><span>฿</span><Num value={tryAmt} onChange={setTryAmt} w={150}/></div>
        <div className="rt-cards">
          <ResultCard title={`รูปแบบที่ 1 · Fixed ${fixedPct}%`} r={calc(t,fixedPct,s)} s={s}/>
          <ResultCard title="รูปแบบที่ 2 · ตามขั้น" r={calc(t,tierFor(t,sortedTiers)?.pct||0,s)} s={s}/>
        </div>
      </section>

      <footer className="rt-foot">ตัวเลขเป็นการจำลอง · ค่าธรรมเนียมและ VAT ปรับได้ด้านบน</footer>
    </main>
  </div>;
}
