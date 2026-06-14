import re

with open('src/components/ExpertRead.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with bg-[#d97757] in the model avatar context
# and replace the block of lines 772-776 (0-indexed: 771-775)
new_lines = []
i = 0
while i < len(lines):
    # Look for the model avatar div with orange bg
    if 'bg-[#d97757]' in lines[i] and 'p-0.5' in lines[i]:
        # Replace this line and the next 4 lines (svg + path + /svg + /div)
        new_lines.append('                  <div className="w-7 h-7 rounded-lg bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]">\n')
        new_lines.append('                    <Bot className="w-3.5 h-3.5" />\n')
        new_lines.append('                  </div>\n')
        # Skip the original svg lines until we hit closing </div>
        i += 1
        while i < len(lines) and '</div>' not in lines[i]:
            i += 1
        i += 1  # skip the </div> line too
    else:
        new_lines.append(lines[i])
        i += 1

with open('src/components/ExpertRead.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Done! Total lines: {len(new_lines)}")
