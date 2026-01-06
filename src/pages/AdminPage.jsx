import { useEffect, useMemo, useState } from "react";
import "./AdminPage.css";
import {data} from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

fetch(`${API_BASE}/api/reading/today`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
});

function parseCellNumber(cellName) {
    const n = parseInt(String(cellName || "").replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n : 9999;
}
function compareCellName(a, b) {
    return parseCellNumber(a) - parseCellNumber(b);
}
function compareYMD(a, b) {
    if (a === b) return 0;
    return a < b ? -1 : 1;
}

export default function AdminPage() {
    const [period, setPeriod] = useState("DAY");
    const [baseDate, setBaseDate] = useState(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });
    const [cellName, setCellName] = useState("");
    const [sortMode, setSortMode] = useState("CELL_NAME_DATE");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.set("period", period);
            if (baseDate) params.set("date", baseDate);
            if (cellName) params.set("cellName", cellName);

            const res = await fetch(`${API_BASE}/api/reading/logs?${params.toString()}`);
            if (!res.ok) throw new Error(`조회 실패 (${res.status})`);
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setError(e?.message || "조회 실패");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const summary = useMemo(() => {
        const items = result?.items ?? [];
        const counts = { "1셀": 0, "2셀": 0, "3셀": 0, total: items.length };
        for (const it of items) {
            if (it.cellName === "1셀") counts["1셀"]++;
            else if (it.cellName === "2셀") counts["2셀"]++;
            else if (it.cellName === "3셀") counts["3셀"]++;
        }
        return counts;
    }, [result]);

    const sortedItems = useMemo(() => {
        const items = [...(result?.items ?? [])];

        if (sortMode === "CELL_NAME_DATE") {
            items.sort((a, b) => {
                const c = compareCellName(a.cellName, b.cellName);
                if (c !== 0) return c;
                const n = a.name.localeCompare(b.name, "ko");
                if (n !== 0) return n;
                return compareYMD(a.readingDate, b.readingDate);
            });
            return items;
        }

        if (sortMode === "NAME_GROUP") {
            items.sort((a, b) => {
                const n = a.name.localeCompare(b.name, "ko");
                if (n !== 0) return n;
                const c = compareCellName(a.cellName, b.cellName);
                if (c !== 0) return c;
                return compareYMD(a.readingDate, b.readingDate);
            });
            return items;
        }

        return items;
    }, [result, sortMode]);

    const downloadCsv = (roleLabel) => {
        const params = new URLSearchParams();
        params.set("period", period);
        if (baseDate) params.set("date", baseDate);
        if (cellName) params.set("cellName", cellName);

        const url = `${API_BASE}/api/reading/export?${params.toString()}`;

        const a = document.createElement("a");
        a.href = url;
        a.download = `${roleLabel}-reading-log.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <div className="admin-page">
            <div className="admin-card">
                <h1 className="admin-title">📊 셀장/회장용 관리</h1>
                <p className="admin-sub">기간/기준일/셀로 조회하고 CSV로 내려받을 수 있어요.</p>

                <div className="admin-section-title">조회 조건</div>

                <div className="admin-grid">
                    <div className="admin-field">
                        <label className="admin-label">기간</label>
                        <select className="admin-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
                            <option value="DAY">하루</option>
                            <option value="WEEK">일주일</option>
                            <option value="MONTH">한달</option>
                        </select>
                    </div>

                    <div className="admin-field">
                        <label className="admin-label">기준일</label>
                        <input
                            className="admin-input"
                            type="date"
                            value={baseDate}
                            onChange={(e) => setBaseDate(e.target.value)}
                        />
                    </div>

                    <div className="admin-field">
                        <label className="admin-label">셀</label>
                        <select className="admin-select" value={cellName} onChange={(e) => setCellName(e.target.value)}>
                            <option value="">전체</option>
                            <option value="1셀">1셀</option>
                            <option value="2셀">2셀</option>
                            <option value="3셀">3셀</option>
                        </select>
                    </div>

                    <div className="admin-field">
                        <label className="admin-label">정렬</label>
                        <select className="admin-select" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                            <option value="CELL_NAME_DATE">셀 → 이름 → 날짜</option>
                            <option value="NAME_GROUP">이름 기준 묶기</option>
                        </select>
                    </div>
                </div>

                <div className="admin-btns">
                    <button className="admin-btn admin-btn-primary" onClick={fetchLogs} disabled={loading}>
                        {loading ? "조회중..." : "조회"}
                    </button>

                    <button className="admin-btn admin-btn-outline" onClick={() => downloadCsv("셀장용")}>
                        셀장용 CSV
                    </button>
                    <button className="admin-btn admin-btn-outline" onClick={() => downloadCsv("회장용")}>
                        회장용 CSV
                    </button>
                    <button className="admin-btn admin-btn-outline" onClick={() => downloadCsv("전체")}>
                        전체 CSV
                    </button>
                </div>

                {error && <div className="admin-error">{error}</div>}

                {result && (
                    <div className="admin-meta">
                        기간 <b>{result.period}</b> · 범위 <b>{result.startDate}</b> ~ <b>{result.endDate}</b>
                        <br />
                        셀 <b>{result.cellName || "전체"}</b> · 건수 <b>{(result.items || []).length}</b>
                    </div>
                )}
            </div>

            {result && (
                <div className="admin-summary">
                    <div className="admin-sum-card">
                        <div className="admin-sum-top">1셀</div>
                        <div className="admin-sum-val">{summary["1셀"]}명</div>
                    </div>
                    <div className="admin-sum-card">
                        <div className="admin-sum-top">2셀</div>
                        <div className="admin-sum-val">{summary["2셀"]}명</div>
                    </div>
                    <div className="admin-sum-card">
                        <div className="admin-sum-top">3셀</div>
                        <div className="admin-sum-val">{summary["3셀"]}명</div>
                    </div>
                    <div className="admin-sum-card admin-sum-total">
                        <div className="admin-sum-top">전체</div>
                        <div className="admin-sum-val">{summary.total}명</div>
                    </div>
                </div>
            )}

            {result && (
                <div className="admin-card admin-table-card">
                    <div className="admin-section-title">조회 결과</div>

                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>날짜</th>
                                <th>셀</th>
                                <th>이름</th>
                                <th>장수</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedItems.map((it) => (
                                <tr key={it.id}>
                                    <td>{it.readingDate}</td>
                                    <td className="admin-cell-strong">{it.cellName}</td>
                                    <td>{it.name}</td>
                                    <td>{it.pages ?? "-"}</td>
                                </tr>
                            ))}
                            {sortedItems.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="admin-empty">
                                        조회 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <p className="admin-footnote">
                        • 모바일에서는 표가 가로로 길어질 수 있어 스크롤로 확인해요.
                        <br />• CSV는 현재 선택된 기간/기준일/셀 필터 그대로 다운로드돼요.
                    </p>
                </div>
            )}
        </div>
    );
}
