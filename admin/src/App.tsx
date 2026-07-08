import { Routes, Route, Navigate } from 'react-router-dom';
import MobileApp from './pages/MobileApp';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MobileApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
