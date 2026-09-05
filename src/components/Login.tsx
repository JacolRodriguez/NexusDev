import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ShieldCheck, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const { error } = await supabase.auth.signInWithPassword({ 
      email: cleanEmail, 
      password: cleanPassword 
    });

    if (error) {
      console.error("DETALLE TÉCNICO:", error.message);
      
      if (error.message.includes("Email not confirmed")) {
        toast.error("Error: Debes apagar 'Confirm Email' en Supabase y CREAR EL USUARIO DE NUEVO.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Correo o contraseña incorrectos. Verifica en el panel de Usuarios.");
      } else {
        toast.error(error.message);
      }
      
      setLoading(false);
    } else {
      toast.success("¡Bienvenido al sistema!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo Neón / Glow SaaS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10">
        <div className="bg-slate-950/60 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter">
              KOREX<span className="text-cyan-500">DEV</span>
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Acceso Administrativo Cloud</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="admin@korexdev.do"
                  value={email}
                  className="w-full bg-slate-900/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-widest">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  className="w-full bg-slate-900/80 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-500 hover:text-white transition-all duration-300 shadow-xl active:scale-95 disabled:opacity-50 group text-xs uppercase tracking-wider"
            >
              {loading ? "VERIFICANDO CREDENCIALES..." : "AUTENTICAR ACCESO"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            KorexDev • Soluciones Tecnológicas
          </p>
        </div>
      </div>
    </div>
  );
}