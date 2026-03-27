interface ToastProps {
  toast: { msg: string; type: string } | null;
}

const Toast = ({ toast }: ToastProps) => {
  if (!toast) return null;
  const borderColor = toast.type === 'success' ? 'border-success text-[#7ecf7e]' : 'border-danger text-[#e07070]';
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border rounded px-5 py-3 font-oswald text-[13px] tracking-[1px] uppercase z-[999] whitespace-nowrap transition-all duration-300 ${borderColor}`}>
      {toast.msg}
    </div>
  );
};

export default Toast;
