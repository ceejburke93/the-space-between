import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const cli=path.join(root,'node_modules/@iwsdk/cli/dist/cli.js');
if(!existsSync(cli)){console.error('Run npm ci before npm run setup:agent.');process.exit(1);}
const guidance=path.join(root,'AGENTS.md');
const before=existsSync(guidance)?readFileSync(guidance):null;
let result;
try{
  result=spawnSync(process.execPath,[cli,'adapter','sync','--tools','codex'],{cwd:root,stdio:'inherit'});
}finally{
  // Adapter regeneration must not replace the game's working agreements.
  if(before&&(!existsSync(guidance)||!readFileSync(guidance).equals(before)))writeFileSync(guidance,before);
}
if(result.error){console.error(result.error.message);process.exit(1);}
process.exitCode=result.status??1;
