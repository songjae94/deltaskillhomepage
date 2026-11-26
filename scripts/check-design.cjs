'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/design/baseline.json'),'utf8'));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');let failures=[];
for(const [file,expected] of Object.entries(manifest.files)){try{if(hash(fs.readFileSync(path.join(root,file)))!==expected)failures.push(file);}catch{failures.push(file+' (missing)');}}
for(const item of manifest.fragments){try{const s=fs.readFileSync(path.join(root,item.file),'utf8'),a=s.indexOf(item.start),b=s.indexOf(item.end,a);if(a<0||b<a||hash(s.slice(a,b))!==item.sha256)failures.push(item.file+' ['+item.start.trim()+']');}catch{failures.push(item.file+' (unreadable)');}}
if(failures.length){console.error('디자인 보존 검사 실패:\n'+failures.map(f=>' - '+f).join('\n')+'\n기능 수정 중 발생한 변경은 복원하세요. 사용자 요청에 따른 디자인 변경일 때만 실렌더 검수 후 기준을 갱신하세요.');process.exitCode=1;}else console.log('디자인 보존 검사 통과: '+Object.keys(manifest.files).length+'개 파일, '+manifest.fragments.length+'개 소스 구간');
