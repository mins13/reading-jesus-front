import { Routes, Route, Navigate } from "react-router-dom";
import MemberPage from "./pages/MemberPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
    return (
        <Routes>
            {/* 셀원용: 완독 체크만 */}
            <Route path="/" element={<MemberPage />} />

            {/* 셀장/회장용: 표 + CSV */}
            <Route path="/admin" element={<AdminPage />} />

            {/* 없는 주소는 으로 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
