import { useMemo, useState } from "react";
import "./MemberPage.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL; // .env에서 /api

export default function MemberPage() {
    const [name, setName] = useState("");
    const [cellName, setCellName] = useState("1셀");

    // ✅ 라디오 상태: "DONE"(완독) / "PAGES"(장수입력)
    const [mode, setMode] = useState("DONE");

    const [pages, setPages] = useState(""); // 장수 입력값(문자열)
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ mode가 장수입력일 때만 pages 검증
    const pagesNumber = useMemo(() => {
        if (mode !== "PAGES") return null;
        if (pages.trim() === "") return NaN;
        return Number(pages.trim());
    }, [mode, pages]);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        if (name.trim().length === 0) return false;
        if (cellName.trim().length === 0) return false;

        // 장수입력 모드면 숫자 입력 필수 + 0 이상
        if (mode === "PAGES") {
            if (!Number.isFinite(pagesNumber)) return false;
            if (pagesNumber < 0) return false;
        }
        return true;
    }, [name, cellName, loading, mode, pagesNumber]);

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setMessage("");
        setLoading(true);

        try {
            // ✅ 완독이면 pages는 null, 장수입력이면 숫자
            const pagesValue = mode === "DONE" ? null : Number(pages.trim());

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
        } catch {
            setMessage("서버 연결 실패 😢");
        } finally {
            setLoading(false);
        }
    };

    const onChangeMode = (nextMode) => {
        setMode(nextMode);
        setMessage("");
        // ✅ 완독으로 바꾸면 장수 입력값 비우기
        if (nextMode === "DONE") setPages("");
    };

    return (
        <div className="member-page">
            <div className="member-card">
                <h1 className="member-title">📖 예수로교회 대청 리딩지저스 체크 📖</h1>
                <p className="member-sub">이름 + 셀 선택 후 “완료” 버튼을 눌러주세요!</p>

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

                {/* ✅ 라디오: 완독 / 장수입력 */}
                <div className="field">
                    <label className="label">기록 방식</label>

                    <div className="radio-row">
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="reading-mode"
                                checked={mode === "DONE"}
                                onChange={() => onChangeMode("DONE")}
                            />
                            <span>완독</span>
                        </label>

                        <label className="radio-item">
                            <input
                                type="radio"
                                name="reading-mode"
                                checked={mode === "PAGES"}
                                onChange={() => onChangeMode("PAGES")}
                            />
                            <span>장수입력</span>
                        </label>
                    </div>
                </div>

                {/* ✅ 장수입력 모드일 때만 입력칸 노출 */}
                {mode === "PAGES" && (
                    <div className="field">
                        <label className="label">장수 입력</label>
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
                        <p className="helper">* 장수입력을 선택했으면 숫자를 꼭 입력해 주세요</p>
                    </div>
                )}

                <button className="btn" onClick={handleSubmit} disabled={!canSubmit}>
                    {loading ? "처리 중..." : "완료"}
                </button>

                {message && <div className="msg">{message}</div>}
                <p className="footnote">※ 셀원 페이지는 체크/기록만 가능합니다</p>
            </div>
        </div>
    );
}
