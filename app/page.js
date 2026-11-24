'use client';

import { useEffect, useRef, useState } from 'react';
import { downloadCases, saveCase } from '../lib/cases';

const blankId = () => Array(6).fill('');
const hint = 'Find your Case ID in your email or ask support';

function storageMessage(error) {
  if (error.message === 'unsupported-storage') {
    return 'Open this page in a current browser using HTTPS or localhost to save files.';
  }
  return 'Couldn’t access cases.json. Check that browser storage is available and try again.';
}

export default function CaseDesk() {
  const [digits, setDigits] = useState(blankId);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const inputs = useRef([]);
  const supportDialog = useRef(null);
  const busy = useRef(false);
  const caseId = digits.join('');

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) inputs.current[0]?.focus();
  }, []);

  function selectDigit(index) {
    const field = inputs.current[index];
    field?.focus();
    field?.select();
  }

  function enterDigits(index, text) {
    if (busy.current) return;
    const value = text.replace(/[\s-]/g, '');
    if (!/^\d*$/.test(value) || value.length > 6) {
      setNotice({ kind: 'error', text: 'Enter six digits, using the numbers 0–9.' });
      return;
    }
    const start = value.length === 6 ? 0 : index;
    if (start + value.length > 6) {
      setNotice({ kind: 'error', text: 'The case ID has space for six digits.' });
      return;
    }
    setDigits((previous) => {
      const next = [...previous];
      next.splice(start, value.length || 1, ...(value ? value.split('') : ['']));
      return next;
    });
    setNotice(null);
    if (value) selectDigit(Math.min(start + value.length, 5));
  }

  function handleKey(event, index) {
    if (event.ctrlKey || event.metaKey || event.altKey || busy.current) return;
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      enterDigits(index, event.key);
      return;
    }
    const destinations = { ArrowLeft: Math.max(0, index - 1), ArrowRight: Math.min(5, index + 1), Home: 0, End: 5 };
    if (event.key in destinations) {
      event.preventDefault();
      selectDigit(destinations[event.key]);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      const target = event.key === 'Backspace' && !digits[index] ? Math.max(0, index - 1) : index;
      enterDigits(target, '');
      selectDigit(target);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (busy.current || caseId.length !== 6) return;
    busy.current = true;
    setSaving(true);
    try {
      const added = await saveCase(caseId);
      setNotice({ kind: 'success', text: added ? `Case ${caseId} saved to cases.json.` : `Case ${caseId} is already in your log.` });
      setDigits(blankId());
      selectDigit(0);
    } catch (error) {
      setNotice({ kind: 'error', text: storageMessage(error) });
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  async function download() {
    try {
      await downloadCases();
      setNotice({ kind: 'success', text: 'Your cases.json download is ready.' });
    } catch (error) {
      setNotice({ kind: 'error', text: storageMessage(error) });
    }
  }

  return (
    <main>
      <aside className="demo-tools" aria-label="Local demo tools">
        <span>Local demo · No identity checks or diagnostics sharing</span>
        <button type="button" onClick={download}>Download JSON</button>
      </aside>
      <section className="case-card" aria-labelledby="page-title">
        <header>
          <img className="case-mark" src="/icon.svg" alt="" width="76" height="84" />
          <h1 id="page-title">Enter Case ID</h1>
          <p className="intro">Enter the 6-digit Case ID provided by our support team to verify your identity and continue.</p>
        </header>

        <form onSubmit={submit}>
          <fieldset aria-describedby="case-hint">
            <legend>Case ID</legend>
            <div className="digits">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { inputs.current[index] = element; }}
                  type="text" inputMode="numeric" autoComplete="off" spellCheck={false}
                  aria-label={`Case ID digit ${index + 1} of 6`}
                  value={digit} readOnly={saving}
                  onFocus={(event) => event.target.select()}
                  onClick={(event) => event.target.select()}
                  onKeyDown={(event) => handleKey(event, index)}
                  onChange={(event) => enterDigits(index, event.target.value)}
                  onPaste={(event) => {
                    event.preventDefault();
                    enterDigits(index, event.clipboardData.getData('text'));
                  }}
                />
              ))}
            </div>
          </fieldset>

          <div className={`hint ${notice?.kind ?? ''}`} id="case-hint" role="status" aria-live="polite">
            <span className="hint-dot" aria-hidden="true" />
            <span>{notice?.text ?? hint}</span>
          </div>
          <p className="storage-note">By continuing, technical browser and device diagnostics are shared with the support team for this case.</p>
          <button className="save-button" type="submit" disabled={caseId.length !== 6 || saving}>
            {saving ? 'Saving…' : <>Verify Case <span aria-hidden="true">→</span></>}
          </button>
        </form>
        <footer>Don't have a Case ID? <button type="button" onClick={() => supportDialog.current.showModal()}>Contact Support</button></footer>
      </section>
      <dialog ref={supportDialog} aria-labelledby="support-title">
        <h2 id="support-title">Contact Support</h2>
        <p>If you need a Case ID, contact the support team through the official app or website where you opened your case.</p>
        <form method="dialog"><button className="save-button">Close</button></form>
      </dialog>
    </main>
  );
}
