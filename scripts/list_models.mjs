import 'dotenv/config';
const key = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
if(!key){ console.error('NO_KEY'); process.exit(1); }
const urls = [
  'https://api.groq.com/v1/models',
  'https://api.groq.com/openai/v1/models',
  'https://api.groq.com/v1/models?limit=50'
];
(async ()=>{
  for (const u of urls){
    try{
      const res = await fetch(u, { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
      console.log('\nURL:', u, 'STATUS', res.status);
      const text = await res.text();
      console.log(text.slice(0,4000));
    } catch(e){
      console.error('ERR', u, e.message);
    }
  }
})();
