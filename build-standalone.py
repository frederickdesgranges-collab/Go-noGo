#!/usr/bin/env python3
"""
Build cec-checkin-standalone.html by inlining all CSS and JS modules
from index.html. Source order is preserved from the original build.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent

CSS_ORDER = [
    'css/base.css',
    'css/components.css',
    'css/animations.css',
    'css/result-screen.css',
    'css/landing.css',
]

# Module dependency order: leaves first.
JS_ORDER = [
    'js/translations.js',
    'js/state.js',
    'js/animations.js',
    'js/form-logic.js',
    'js/evaluation.js',
    'js/result-screen.js',
    'js/main.js',
]


def load(p):
    return (ROOT / p).read_text(encoding='utf-8')


def strip_module_syntax(src: str) -> str:
    # Drop any `import ... from '...';` block, single- or multi-line.
    src = re.sub(
        r"^\s*import\s+[^;]*?from\s+['\"][^'\"]+['\"]\s*;?\s*$",
        '',
        src,
        flags=re.MULTILINE | re.DOTALL,
    )
    # Need DOTALL only for braces spanning lines; do a second pass that
    # collapses multi-line imports specifically.
    src = re.sub(
        r"^\s*import\s*\{[^}]*\}\s*from\s+['\"][^'\"]+['\"]\s*;?\s*$",
        '',
        src,
        flags=re.MULTILINE,
    )
    src = re.sub(
        r"import\s*\{[^}]*\}\s*from\s+['\"][^'\"]+['\"]\s*;?",
        '',
        src,
        flags=re.DOTALL,
    )

    out_lines = []
    for line in src.splitlines():
        # Drop `export {` re-exports if any.
        if re.match(r"^\s*export\s*\{", line):
            continue
        # Strip leading `export ` from declarations.
        line = re.sub(r"^(\s*)export\s+", r"\1", line)
        out_lines.append(line)
    return '\n'.join(out_lines)


def build():
    html = load('index.html')

    # Replace the 5 <link rel="stylesheet" ...> tags with one <style> block.
    css_blob = '\n\n'.join(load(p) for p in CSS_ORDER)
    css_block = '<style>\n' + css_blob + '\n</style>'

    # Remove each link tag, then insert the combined <style> after the
    # Google Fonts <link> tag.
    for p in CSS_ORDER:
        pattern = re.compile(
            r'\s*<link rel="stylesheet" href="' + re.escape(p) + r'"\s*/>\s*\n'
        )
        html = pattern.sub('\n', html)

    # Inject the <style> block right before </head>.
    html = html.replace('</head>', css_block + '\n</head>', 1)

    # Replace the module script tag with an inline IIFE wrapping all JS.
    js_blob = '\n\n\n'.join(strip_module_syntax(load(p)) for p in JS_ORDER)
    js_block = '<script>\n(function(){\n\'use strict\';\n' + js_blob + '\n})();\n</script>'
    html = re.sub(
        r'<script type="module" src="js/main\.js"></script>',
        lambda _m: js_block,
        html,
        count=1,
    )

    out = ROOT / 'cec-checkin-standalone.html'
    out.write_text(html, encoding='utf-8')
    print(f'Wrote {out} ({len(html):,} bytes)')


if __name__ == '__main__':
    build()
