// Helper
const $ = s => document.querySelector(s);

// Elements
const dropzone = $('#dropzone'),
      fileInput = $('#fileInput'),
      hashOut = $('#hashOut'),
      fileMeta = $('#fileMeta'),
      copyHash = $('#copyHash'),
      verdictIcon = $('#verdictIcon'),
      verdictText = $('#verdictText'),
      primaryHash = $('#primaryHash'),
      secondaryHash = $('#secondaryHash'),
      tertiaryHash = $('#tertiaryHash'),
      compareBtn = $('#compareBtn'),
      saveTxt = $('#saveTxt'),
      saveJson = $('#saveJson'),
      saveBadge = $('#saveBadge'),
      storyBtn = $('#storyBtn'),
      storyDlg = $('#storyDlg'),
      storyBody = $('#storyBody'),
      storyOnline = $('#storyOnline'),
      resetStory = $('#resetStory'),
      closeStory = $('#closeStory'),
      badgeCanvas = $('#badgeCanvas');

let current = {
  file: null, name: null, bytes: 0,
  algo: 'SHA-256', hash: null,
  verdict: 'UNKNOWN', matches: []
};

// Drag/drop handling
['dragenter','dragover'].forEach(evt =>
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.add('hover');
  })
);
['dragleave','drop'].forEach(evt =>
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.remove('hover');
  })
);
dropzone.addEventListener('drop', e => {
  if(e.dataTransfer.files && e.dataTransfer.files[0])
    handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', e => {
  if(e.target.files && e.target.files[0])
    handleFile(e.target.files[0]);
});

// Handle file + hash
async function handleFile(file) {
  current.file = file;
  current.name = file.name;
  current.bytes = file.size;
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const hex = [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2,'0'))
    .join('').toUpperCase();
  current.hash = hex;
  setVerdict('UNKNOWN', []);
  render();
}

function render() {
  hashOut.textContent = current.hash || '—';
  fileMeta.textContent =
    `Filename: ${current.name||'—'} • Bytes: ${current.bytes||'—'}`;
}

function setVerdict(v, matches=[]) {
  current.verdict = v;
  current.matches = matches;
  verdictIcon.className =
    'icon ' + (v==='MATCH'?'ok':v==='DIFFERENT'?'bad':'unknown');
  verdictIcon.textContent =
    v==='MATCH'?'✅':v==='DIFFERENT'?'❌':'❔';
  const note = matches.length ? ` with ${matches.join(' + ')}` : '';
  verdictText.textContent =
    (v==='MATCH'?'MATCH':v==='DIFFERENT'?'NOT A MATCH':'UNKNOWN (no original provided)') + note;
}

function normalize(s) {
  return (s||'').trim().toUpperCase().replace(/\s+/g,'');
}

// Compare against known claims
compareBtn.addEventListener('click', () => {
  if(!current.hash){ setVerdict('UNKNOWN'); return; }
  const claims = [];
  const P = normalize(primaryHash.value),
        S = normalize(secondaryHash.value),
        T = normalize(tertiaryHash.value);
  if(P) claims.push({label:'Primary', val:P});
  if(S) claims.push({label:'Secondary', val:S});
  if(T) claims.push({label:'Tertiary', val:T});
  if(!claims.length){ setVerdict('UNKNOWN'); return; }
  const matches = claims.filter(c => c.val === current.hash).map(c=>c.label);
  if(matches.length){ setVerdict('MATCH', matches); }
  else { setVerdict('DIFFERENT'); }
});

// Copy hash
copyHash.addEventListener('click', () => {
  if(current.hash) navigator.clipboard.writeText(current.hash);
});

// Save as TXT or JSON
function saveTextFile(name, content) {
  const blob = new Blob([content], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
saveTxt.addEventListener('click', () => {
  const name = (current.name||'artifact')+'.hash.txt';
  const text =
`FILE:    ${current.name||'—'}
BYTES:   ${current.bytes||'—'}
ALGO:    ${current.algo}
HASH:    ${current.hash||'—'}
VERDICT: ${current.verdict}
TIME:    ${new Date().toISOString()}
TOOL:    Legacy Mundial Hash Proof Tool (LegacyKey v1)
OWNER:   Maynard Rafael Pascasio (Structura Cerebri)`;
  saveTextFile(name,text);
});
saveJson.addEventListener('click', () => {
  const name = (current.name||'artifact')+'.hash.json';
  const obj = {
    file: current.name, bytes: current.bytes,
    algo: current.algo, hash: current.hash,
    verdict: current.verdict, matches: current.matches,
    time: new Date().toISOString(),
    tool: 'Legacy Mundial Hash Proof Tool (LegacyKey v1)',
    owner: 'Maynard Rafael Pascasio'
  };
  saveTextFile(name, JSON.stringify(obj,null,2));
});

// Save Badge.png
saveBadge.addEventListener('click', () => {
  const c = badgeCanvas, ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  ctx.fillStyle = '#0F0F1F'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#E7E7EF';
  ctx.font = '28px Helvetica';
  ctx.fillText('Legacy Mundial Hash Proof Badge',24,50);
  let sym='❔',color='#FFB020',label='UNKNOWN';
  if(current.verdict==='MATCH'){ sym='✅';color='#16C784';label='MATCH'; }
  if(current.verdict==='DIFFERENT'){ sym='❌';color='#F44336';label='NOT A MATCH'; }
  ctx.fillStyle=color; ctx.font='90px Helvetica';
  ctx.fillText(sym,40,180);
  ctx.fillStyle='#E7E7EF'; ctx.font='24px Helvetica';
  ctx.fillText('FILE: '+(current.name||'—'),24,300);
  ctx.fillText('HASH: '+(current.hash||'—').slice(0,32)+'...',24,340);
  ctx.fillText('VERDICT: '+label,24,380);
  ctx.fillText('TIME: '+new Date().toISOString(),24,420);
  ctx.fillText('© 2025 Maynard Rafael Pascasio',24,480);
  const url = c.toDataURL('image/png');
  const a = document.createElement('a');
  a.href=url; a.download=(current.name||'artifact')+'.badge.png';
  a.click();
});

// Story text
const STORY = `The Legacy Mundial Hash Proof Tool began with the Brain Crest — Structura Cerebri — a crystalline emblem of thought with a golden spiral at its core. It carries the heritage of Cecilia Galbadores Rafael Pascasio and Romulo Garcia Pascasio, whose fused legacy became a mixed-gened brain passed on to Maynard. From that origin, the first digital fingerprint was imagined: a hash that cannot be forged. Today, this tool stands for his children — Mielzie, Hanzlah, Hannah Safia, Hasmin, and Mikhael — and for the world, to prove authenticity forever.`;

function openStory() {
  storyBody.textContent = STORY;
  storyOnline.href = 'https://pascalogixstructura.com/legacy-mundial';
  storyDlg.showModal();
}
storyBtn.addEventListener('click', openStory);
closeStory.addEventListener('click', () => storyDlg.close());
resetStory.addEventListener('click', openStory);
