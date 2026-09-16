"""Convert the supplied ISO communication and NC/CAR register into app-ready JSON."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

PROJECT = Path(__file__).resolve().parents[2]
SOURCE = PROJECT / "data" / "raw" / "nc-car-register" / "69.(Q) FM-ISO-053_2 ทะเบียนใบสื่อสาร และใบ NC.xls"
OUTPUT = PROJECT / "data" / "processed" / "nc-car-records.json"


def text(value: object) -> str:
    return "" if pd.isna(value) else str(value).strip()


def thai_date(day: object, month: object, year: object) -> str:
    values = [text(day), text(month), text(year)]
    return "/".join(values) if all(values) else ""


def row_to_record(row: pd.Series, register: str) -> dict[str, str]:
    tracking = text(row.get("การติดตาม"))
    return {
        "register": register,
        "reportedDate": text(row.get("วันที่")),
        "referenceNo": text(row.get("เลขที่")),
        "type": text(row.get("ประเภท")),
        "scope": text(row.get("ภายใน / ภายนอก")),
        "department": text(row.get("ฝ่าย")),
        "section": text(row.get("แผนก")),
        "source": text(row.get("ที่มาของการตรวจพบ")),
        "consideration": text(row.get("การพิจารณา")),
        "description": text(row.get("รายละเอียด")),
        "communicator": text(row.get("ผู้สื่อสาร")),
        "recipient": text(row.get("ผู้รับเรื่อง")),
        "dueDate": thai_date(row.get("ว.ด.ป กำหนดเสร็จ"), row.get("Unnamed: 12"), row.get("Unnamed: 13")),
        "trackingStatus": tracking,
        "responseDueDate": text(row.get("กำหนดวันที่ตอบกลับใบสื่อสาร/ใบ NC")),
        "responseDate": text(row.get("วันที่ตอบกลับใบสื่อสาร/ใบ NC")),
        "requirement": text(row.get("ข้อกำหนด")),
        "status": "closed" if "ปิด" in tracking else "open",
    }


def main() -> None:
    workbook = pd.ExcelFile(SOURCE)
    records: list[dict[str, str]] = []
    for sheet in workbook.sheet_names:
        frame = pd.read_excel(SOURCE, sheet_name=sheet, header=1, dtype=object)
        for _, row in frame.iterrows():
            record = row_to_record(row, sheet.strip())
            if record["referenceNo"]:
                records.append(record)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Imported {len(records)} records to {OUTPUT}")


if __name__ == "__main__":
    main()
