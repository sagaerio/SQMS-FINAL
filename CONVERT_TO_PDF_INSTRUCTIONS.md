# How to Convert TEST_CASE_CHECKLIST.md to PDF

## Quick Methods

### Method 1: Using Online Converter (Easiest)
1. Go to: https://www.markdowntopdf.com/
2. Upload `TEST_CASE_CHECKLIST.md`
3. Click "Convert"
4. Download the PDF

**Alternative online tools:**
- https://md2pdf.netlify.app/
- https://www.browserling.com/tools/markdown-to-pdf
- https://cloudconvert.com/md-to-pdf

---

### Method 2: Using VS Code (If you have it installed)
1. Install "Markdown PDF" extension by yzane
2. Open `TEST_CASE_CHECKLIST.md`
3. Right-click in editor → "Markdown PDF: Export (pdf)"
4. PDF will be saved in same folder

---

### Method 3: Using Pandoc (Command Line)

**Install Pandoc:**
```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt-get install pandoc texlive-latex-base

# Windows
# Download from: https://pandoc.org/installing.html
```

**Convert to PDF:**
```bash
cd /workspaces/default/code

pandoc TEST_CASE_CHECKLIST.md -o TEST_CASE_CHECKLIST.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --number-sections \
  -V geometry:margin=1in \
  -V fontsize=10pt \
  -V papersize=letter
```

**With fancy styling:**
```bash
pandoc TEST_CASE_CHECKLIST.md -o TEST_CASE_CHECKLIST.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --number-sections \
  -V geometry:margin=0.75in \
  -V fontsize=10pt \
  -V papersize=letter \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V urlcolor=blue \
  --highlight-style=tango
```

---

### Method 4: Using Google Docs
1. Copy content from `TEST_CASE_CHECKLIST.md`
2. Paste into Google Docs
3. Use "Docs to Markdown" add-on (optional, for formatting)
4. File → Download → PDF Document

---

### Method 5: Using Microsoft Word
1. Open `TEST_CASE_CHECKLIST.md` in VS Code or text editor
2. Copy all content
3. Paste into Microsoft Word
4. Clean up formatting if needed
5. File → Save As → PDF

---

## Recommended: Pandoc with Custom Template

For the best-looking professional PDF, use this pandoc command:

```bash
pandoc TEST_CASE_CHECKLIST.md -o TEST_CASE_CHECKLIST.pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=2 \
  --number-sections \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  -V papersize=letter \
  -V documentclass=report \
  -V colorlinks=true \
  -V linkcolor=blue \
  -V urlcolor=blue \
  -V toccolor=black \
  --highlight-style=tango \
  --metadata title="SQMS Test Case Checklist" \
  --metadata author="QA Team" \
  --metadata date="May 22, 2026"
```

This will create a PDF with:
- Table of contents
- Page numbers
- Section numbering
- Professional formatting
- Clickable links

---

## File Location

The markdown file is located at:
```
/workspaces/default/code/TEST_CASE_CHECKLIST.md
```

After conversion, you'll have:
```
/workspaces/default/code/TEST_CASE_CHECKLIST.pdf
```

---

## Quick Online Conversion

**Fastest way (no installation needed):**

1. Open https://www.markdowntopdf.com/
2. Drag and drop `TEST_CASE_CHECKLIST.md`
3. Click "Convert to PDF"
4. Download your PDF

Done! ✅
