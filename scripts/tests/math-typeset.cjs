// The JS port must give the ops Python self-test answers (수식교정.py) and keep R4 body fractions.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync('app/math-typeset-v66.js','utf8'),ctx);
const T=ctx.DSMathTypeset;
const fix={
 "\\lim_{x\\to2}\\frac{G(x)-G(2)}{x-2}=G\\prime(2)=3":"\\displaystyle\\lim_{x\\to2}\\frac{G(x)-G(2)}{x-2}=G'(2)=3",
 "\\int_a^bf(x)\\,dx=F(b)-F(a)":"\\displaystyle\\int_a^bf(x)\\,dx=F(b)-F(a)",
 "\\int_0^2\\{f(x)-x\\}^2dx=0":"\\displaystyle\\int_0^2\\{f(x)-x\\}^2\\,dx=0",
 "\\displaystyle \\int_{0}^{1}f(x)dx":"\\displaystyle \\int_{0}^{1}f(x)\\,dx",
 "\\frac{d}{dx}\\int_1^xf(t)dt":"\\frac{d}{dx}\\displaystyle\\int_1^xf(t)\\,dt",
 "f^{\\prime}(x)+g\\prime\\prime(x)":"f^{\\prime}(x)+g''(x)",
 "ax^3+bx^2+cx+d":"ax^3+bx^2+cx+d"};
for(const [a,b] of Object.entries(fix)){assert.equal(T.fixTeX(a),b,a);assert.equal(T.fixTeX(b),b,'idempotent '+a);}
const sf={
 "2^{2t+\\frac{1}{2}\\cos\\pi t}":"2^{2t+{\\tfrac{1}{2}}\\cos\\pi t}",
 "2^{\\frac{11}{2}}":"2^{\\mkern2mu{\\tfrac{11}{2}}}",
 "\\int_{0}^{\\frac{\\pi}{4}}\\tan x\\,dx":"\\int_{0}^{{\\tfrac{\\pi}{4}}}\\tan x\\,dx",
 "x^\\frac12+1":"x^{\\mkern2mu{\\tfrac12}}+1",
 "\\dfrac{1}{4}\\{3f(3)-f(1)\\}":"\\dfrac{1}{4}\\{3f(3)-f(1)\\}",
 "e^{x^{2}}":"e^{x^{2}}",
 "\\left[-\\ln(\\cos t)\\right]_{0}^{\\frac{\\pi}{4}}":"\\left[-\\ln(\\cos t)\\vphantom{\\dfrac{1}{2}}\\right]_{0}^{{\\tfrac{\\pi}{4}}}",
 "\\left[u\\ln u-u\\right]_{1}^{2}":"\\left[u\\ln u-u\\right]_{1}^{2}",
 "-\\dfrac{1}{2a}\\left[\\sqrt{a^{2}x^{2}+1}\\right]_{0}^{1}":"-\\dfrac{1}{2a}\\left[\\,\\sqrt{a^{2}x^{2}+1}\\,\\right]_{0}^{1}",
 "\\sum_{k=1}^{\\frac{n}{2}}k":"\\sum_{k=1}^{{\\tfrac{n}{2}}}k",
 "e^{\\sqrt{3}\\left(\\frac{5}{3}\\pi - a\\right)}":"e^{\\sqrt{3}({\\tfrac{5}{3}}\\pi - a)}",
 "e^{\\left(x+1\\right)}":"e^{\\left(x+1\\right)}",
 "= \\left( 3^{\\frac{1}{3}} \\right)^3":"= ( 3^{\\mkern2mu{\\tfrac{1}{3}}} )^3",
 "f(x)=\\ln\\left(x^{\\frac2x}\\right)":"f(x)=\\ln(x^{\\mkern2mu{\\tfrac2x}})",
 "\\left\\{ 2^{\\frac12}+1 \\right\\}^2":"\\{ 2^{\\mkern2mu{\\tfrac12}}+1 \\}^2",
 "\\left(\\dfrac{2^{\\frac12}}{3}\\right)^n":"\\left(\\dfrac{2^{\\mkern2mu{\\tfrac12}}}{3}\\right)^n",
 "\\left(\\left(x\\right)^{\\frac12}\\right)":"(\\left(x\\right)^{{\\tfrac12}})",
 "\\left[0,\\,2^{\\frac12}\\right)":"\\left[0,\\,2^{\\mkern2mu{\\tfrac12}}\\right)",
 "\\left[f'(x)g'(x)\\right]_0^{\\frac{\\pi}{6}}":"\\left[f'(x)g'(x)\\vphantom{\\dfrac{1}{2}}\\right]_0^{{\\tfrac{\\pi}{6}}}"};
for(const [a,b] of Object.entries(sf)){const got=T.scriptFrac(T.bracketStrut(a));assert.equal(got,b,a);assert.equal(T.scriptFrac(T.bracketStrut(got)),got,'idempotent '+a);}
console.log('PASS: 수식교정.py self-test',Object.keys(fix).length+Object.keys(sf).length,'/ 26');
const body={
 "\\frac{1}{3}":"\\dfrac{1}{3}",
 "a=\\frac{x+1}{\\frac{1}{2}}":"a=\\dfrac{x+1}{\\frac{1}{2}}",
 "2^{\\frac12}":"2^{\\frac12}",
 "x^\\frac12":"x^\\frac12",
 "\\int_0^{\\frac{\\pi}{2}}":"\\int_0^{\\frac{\\pi}{2}}",
 "\\sqrt{\\frac{1}{2}}":"\\sqrt{\\dfrac{1}{2}}",
 "\\frac12+\\frac{a}{b}":"\\dfrac12+\\dfrac{a}{b}",
 "\\text{\\frac}":"\\text{\\frac}",
 "\\frac{ab}{c\\frac{1}{2}}":"\\dfrac{ab}{c\\frac{1}{2}}",
 "{\\scriptstyle \\frac{1}{2}}":"{\\scriptstyle \\frac{1}{2}}"};
for(const [a,b] of Object.entries(body)){assert.equal(T.bodyFrac(a),b,a);assert.equal(T.bodyFrac(T.bodyFrac(a)),b,'idempotent '+a);}
const p=T.prepare('\\frac{1}{3}+2^{\\frac{1}{2}}+\\int_0^2 f(x)dx');
assert.equal(p,'\\dfrac{1}{3}+2^{\\mkern2mu{\\tfrac{1}{2}}}+\\displaystyle\\int_0^2 f(x)\\,dx');assert.equal(T.prepare(p),p);
assert.equal(T.choiceRow(['1','2','3','4','5']),'ch5');assert.equal(T.choiceRow(['\\dfrac{1}{4}','\\dfrac{13}{36}']),'ch5');
assert.equal(T.choiceRow(['\\sqrt{3}','2']),'ch5');assert.equal(T.choiceRow(['3\\sqrt{2}+\\dfrac{\\pi}{3}']),'ch3');assert.equal(T.choiceRow(['x^2+2x+1\\text{ 또는 }x=3\\text{ 인 실수}']),'ch2');
console.log('PASS: body fractions \\dfrac (R4), scripts kept compact, prepare idempotent, choice rows ch5/ch3/ch2');
