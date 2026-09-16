"""Extract the ISO 45001 legal register into page-level, traceable JSON.

The source PDF uses a visual table and does not expose reliable row boundaries in
text extraction.  This importer therefore preserves every page with its source
page number and leaves compliance classification for a review step.
"""

from __future__ import annotations

import json
from pathlib import Path

from pypdf import PdfReader

PROJECT = Path(__file__).resolve().parents[2]
SOURCE = PROJECT / "data" / "raw" / "legal-register" / "IN-02-07_13 ทะเบียนกฎหมายและข้อกำหนดอื่นๆ ISO 45001 (กร.pdf"
OUTPUT = PROJECT / "data" / "processed" / "legal-register-pages.json"


def main() -> None:
    reader = PdfReader(SOURCE)
    pages = []
    for number, page in enumerate(reader.pages, start=1):
        pages.append(
            {
                "sourcePage": number,
                "text": page.extract_text() or "",
                "reviewStatus": "pending-classification",
            }
        )
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Extracted {len(pages)} legal-register pages to {OUTPUT}")


if __name__ == "__main__":
    main()
