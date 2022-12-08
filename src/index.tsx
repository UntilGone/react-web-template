import { createRoot } from 'react-dom/client';
import { Root } from './root';
import './common/common.css';
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Root />);
}

// 热更新需要
if ((module as any).hot) {
  (module as any).hot.accept();
}
