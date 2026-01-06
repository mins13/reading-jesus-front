import { useMemo, useState } from "react";
import "./MemberPage.css"

const API_BASE = "http://localhost:8080";

export default function MemberPage() {
    const [name, setName] = useState("");
    const [cellName, setCellName] = useState("1셀");
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
            const res = await fetch(`${API_BASE}/api/reading/today`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    cellName: cellName.trim(),
                }),
            });

            const text = await res.text();
            setMessage(text);
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
                        placeholder="예) 민영"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        inputMode="text"
                    />
                </div>

                <div className="field">
                    <label className="label">셀 선택</label>
                    <select
                        className="select"
                        value={cellName}
                        onChange={(e) => setCellName(e.target.value)}
                    >
                        <option value="1셀">1셀</option>
                        <option value="2셀">2셀</option>
                        <option value="3셀">3셀</option>
                    </select>
                </div>

                <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
                    {loading ? "처리 중..." : "완독 ✅"}
                </button>

                {message && <div className="msg">{message}</div>}

                <p className="footnote">※ 셀원 페이지는 완독 체크만 가능합니다</p>
            </div>
        </div>
    );
}
