import { useMemo, useState } from "react";
import "./MemberPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export default function MemberPage() {
    const [name, setName] = useState("");
    const [cellName, setCellName] = useState("1셀");
    const [pages, setPages] = useState(""); // ✅ 장수(미완독) 입력
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        return name.trim().length > 0 && cellName.trim().length > 0 && !loading;
    }, [name, cellName, loading]);

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setMessage("");
        setLoading(true);

        try {
            const pagesValue = pages.trim() === "" ? null : Number(pages.trim());

            if (pagesValue !== null && (!Number.isFinite(pagesValue) || pagesValue < 0)) {
                setMessage("장수는 0 이상의 숫자로 입력해주세요");
                setLoading(false);
                return;
            }

            // ✅ /api 중복 제거: API_BASE가 이미 /api 라고 가정
            const res = await fetch(`${API_BASE}/reading/today`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    cellName: cellName.trim(),
                    pages: pagesValue,
                }),
            });

            const text = await res.text();
            setMessage(text);

            // 원하면 성공 후 입력값 리셋
            // setName("");
            // setPages("");
            // setCellName("1셀");
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
                <p className="member-sub">이름 입력 + 셀 선택 후 완독 버튼!</p>

                <div className="field">
                    <label className="label">이름</label>
                    <input
                        className="input"
                        placeholder="예) 진영찬"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        inputMode="text"
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
                    <label className="label">장수 입력 (미완독)</label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="예) 3 (미완독이면 입력)"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        inputMode="numeric"
                    />
                    <p className="helper">* 완독이면 비워두고 “완독 ✅” 누르면 돼요</p>
                </div>

                <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
                    {loading ? "처리 중..." : "완독 ✅"}
                </button>

                {message && <div className="msg">{message}</div>}
                <p className="footnote">※ 셀원 페이지는 체크/기록만 가능합니다</p>
            </div>
        </div>
    );
}
