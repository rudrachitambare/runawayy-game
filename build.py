import re, pathlib
src = pathlib.Path(__file__).parent / 'src'
html = (src/'index.html').read_text()
def css(m):
    return '<style>\n/* '+m.group(1)+' */\n'+(src/m.group(1)).read_text()+'\n</style>'
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
def rep(m):
    js = (src/m.group(1)).read_text().replace('</script>', '<\\/script>')
    return '<script>\n/* '+m.group(1)+' */\n'+js+'\n</script>'
html = re.sub(r'<script src="([^"]+)"></script>', rep, html)
(pathlib.Path(__file__).parent/'SmallHours.html').write_text(html)
print('built', len(html)//1024, 'KB')
