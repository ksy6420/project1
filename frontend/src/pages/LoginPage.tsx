import { LoginForm } from '../components/organisms/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-[#0B0F19]">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(11, 15, 25, 0) 70%)',
        }}
      />

      <div className="w-full max-w-md bg-[#111827] border border-gray-700/80 rounded-2xl p-11 shadow-2xl z-10 box-border">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-extrabold text-white tracking-wide">
              PCyber
            </span>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
