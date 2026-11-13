import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-oman-50 p-6 text-center">
      <span className="text-8xl">🐪</span>
      <h1 className="text-3xl font-black text-oman-700">ضللنا الطريق في الرمال!</h1>
      <p className="text-lg text-oman-600">هذه الصفحة غير موجودة.</p>
      <Link to="/login" className="btn-primary text-xl">
        العودة إلى البداية
      </Link>
    </div>
  );
}
