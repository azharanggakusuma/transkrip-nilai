import React from "react";
import { StudentData } from "../lib/data";

interface ControlPanelProps {
  students: StudentData[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onPrint: () => void;
}

export default function ControlPanel({
  students,
  selectedIndex,
  onSelect,
  onPrint,
}: ControlPanelProps) {
  return (
    <>
      {/* === DESKTOP VERSION (Clean & Professional) === */}
      <div className="hidden md:flex w-[210mm] bg-white rounded-lg border border-gray-200 p-4 items-center justify-between gap-6 print:hidden z-40 shadow-sm">
        
        {/* Bagian Kiri: Dropdown Selection */}
        <div className="flex-1 flex flex-col gap-1.5">
          <label
            htmlFor="student-select"
            className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide"
          >
            Pilih Mahasiswa
          </label>
          <div className="relative">
            <select
              id="student-select"
              value={selectedIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded-md focus:ring-2 focus:ring-[#1B3F95] focus:border-[#1B3F95] block w-full p-2.5 outline-none transition-all cursor-pointer appearance-none"
            >
              {students.map((student, index) => (
                <option key={student.id} value={index}>
                  {student.profile.nama} — {student.profile.nim}
                </option>
              ))}
            </select>
            {/* Custom Chevron Icon untuk mempercantik Dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bagian Kanan: Tombol Print (Solid & Simple) */}
        <div className="flex items-end self-end">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 bg-[#1B3F95] hover:bg-blue-900 text-white font-medium rounded-md text-sm px-5 py-2.5 transition-colors shadow-sm active:translate-y-[1px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
              />
            </svg>
            Cetak Transkrip
          </button>
        </div>
      </div>

      {/* === MOBILE VERSION (Stacked) === */}
      <div className="md:hidden w-full bg-white p-4 rounded-lg border border-gray-200 shadow-sm print:hidden space-y-3">
        <label className="text-xs font-bold text-gray-500 uppercase">
          Pilih Mahasiswa:
        </label>
        <div className="relative">
          <select
            value={selectedIndex}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#1B3F95] focus:border-[#1B3F95] block p-2.5 appearance-none"
          >
            {students.map((student, index) => (
              <option key={student.id} value={index}>
                {student.profile.nama}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
          </div>
        </div>
        
        <button
          onClick={onPrint}
          className="w-full bg-[#1B3F95] text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 active:bg-blue-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak PDF
        </button>
      </div>
    </>
  );
}