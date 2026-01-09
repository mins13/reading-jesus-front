import { useMemo, useState } from "react";
import "./MemberPage.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

export default function MemberPage() {
    const [name, setName] = useState("");
    const [cellName, setCellName] = useState("1셀");

    // DONE = 완독, PAGES = 장수
    const [mode, setMode] = useState("DONE");
    const [pages, setPages] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        if (name.trim().length === 0) return false;
        if (cellName.trim().length === 0) return false;

        if (mode === "PAGES") {
            const v = pages.trim();
            if (v === "") return false;
            const n = Number(v);
            if (!Number.isFinite(n) || n < 0) return false;
        }
        return true;
    }, [name, cellName, mode, pages, loading]);

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setMessage("");
        setLoading(true);

        try {
            const payload =
                mode === "DONE"
                    ? { name: name.trim(), cellName: cellName.trim(), status: "COMPLETED" }
                    : { name: name.trim(), cellName: cellName.trim(), status: "PAGES", pages: Number(pages.trim()) };

            const res = await fetch(`${API_BASE}/reading/today`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            setMessage(text);
            setPages("");
            setMode("DONE");
        } catch {
            setMessage("서버 연결 실패 😢");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="member-page">
            <div className="member-card">
                <h1 className="member-title">📖 예수로교회 대청 리딩지저스 완독 체크 📖</h1>
                <p className="member-sub">이름 입력 + 셀 선택 후 완료 버튼!</p>

                <div className="field">
                    <label className="label">이름</label>
                    <input
                        className="input"
                        placeholder="예) 진영찬"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                    />
                </div>

                <div className="field">
                    <label className="label">셀 선택</label>
                    <select className="select" value={cellName} onChange={(e) => setCellName(e.target.value)}>
                        <option value="1셀">1셀</option>
                        <option value="2셀">2셀</option>
                        <option value="3셀">3셀</option>
                    </select>
                </div>

                <div className="field">
                    <label className="label">기록 방식</label>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            type="button"
                            className={`btn ${mode === "DONE" ? "btn-active" : ""}`}
                            onClick={() => setMode("DONE")}
                            disabled={loading}
                        >
                            완독
                        </button>
                        <button
                            type="button"
                            className={`btn ${mode === "PAGES" ? "btn-active" : ""}`}
                            onClick={() => setMode("PAGES")}
                            disabled={loading}
                        >
                            장수 입력
                        </button>
                    </div>
                </div>

                {mode === "PAGES" && (
                    <div className="field">
                        <label className="label">장수</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="예) 3"
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            inputMode="numeric"
                        />
                    </div>
                )}

                <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
                    {loading ? "처리 중..." : "완료 ✅"}
                </button>

                {message && <div className="msg">{message}</div>}
                <p className="footnote">※ 셀원 페이지는 체크/기록만 가능합니다</p>
            </div>
        </div>
    );
}
