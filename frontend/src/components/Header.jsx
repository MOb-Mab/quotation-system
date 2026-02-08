import { FiMenu } from 'react-icons/fi';

export default function Header({ onMenuClick }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow flex items-center justify-between px-6 z-50">
      <h1 className="font-semibold">Quotation System</h1>

      <button onClick={onMenuClick}>
        <FiMenu size={22} />
      </button>
    </header>
  );
}
