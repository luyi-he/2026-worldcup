import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/components/ExpertRead.tsx', 'utf8');

// Find the exact div start
const divStart = content.indexOf('h-7 rounded-lg bg-[#d97757]');
const lineStart = content.lastIndexOf('\n', divStart) + 1; // go to beginning of line

// Find the end: the closing )} after </div>
const svgClose = content.indexOf('</svg>', divStart);
const divClose = content.indexOf('</div>', svgClose) + '</div>'.length;
const parenClose = content.indexOf(')}', divClose) + ')}'.length;

const oldPart = content.slice(lineStart, parenClose);
console.log('OLD:', JSON.stringify(oldPart.slice(0, 100)));

const newPart = `                  <div className="w-7 h-7 rounded-lg bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}`;

content = content.slice(0, lineStart) + newPart + content.slice(parenClose);
writeFileSync('src/components/ExpertRead.tsx', content, 'utf8');
console.log('Done!');
