import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ShieldCheck, Search, Sun, Moon, LogOut, 
  TrendingUp, Users, AlertTriangle, Layers, 
  Server, Cpu, Database, CheckCircle2, Share2, Plus, 
  FileText, MessageSquare, BarChart3, Edit3, X, Save, Phone, Key, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface Licencia {
  id: string;
  cliente_id: string;
  nombre_negocio: string;
  sistema: string;
  monto_mensual: number;
  fecha_vencimiento: string;
  telefono?: string;
  notas?: string;
  admin_pass?: string;
  caja_pass?: string;
  admin_user?: string;
  caja_user?: string;
}

interface Factura {
  id: string;
  sistema: string;
  monto: number;
  fecha: string;
  negocio?: string;
}

export default function KorexDevAdmin() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sistemaFiltro, setSistemaFiltro] = useState('TODOS');
  const [darkMode, setDarkMode] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'clientes' | 'facturas' | 'analitica'>('clientes');

  // Modales
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Licencia | null>(null);

  // Formulario Nuevo Cliente
  const [nuevoForm, setNuevoForm] = useState({
    cliente_id: '',
    nombre_negocio: '',
    sistema: 'POS Cafetería',
    monto_mensual: 1500,
    fecha_vencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    telefono: '',
    notas: '',
    admin_user: '',
    caja_user: 'caja_ventas',
    admin_pass: 'admin123',
    caja_pass: 'caja123'
  });

  const sistemasDisponibles = [
    'TODOS',
    'POS Cafetería',
    'Catálogo Digital',
    'Sistema de Filas',
    'Préstamos B2B',
    'E&T GO'
  ];

  const cargarDatos = async () => {
    setLoading(true);
    const { data: lic } = await supabase.from('licencias').select('*').order('fecha_vencimiento', { ascending: true });
    const { data: fac } = await supabase.from('facturas').select('*').order('fecha', { ascending: false });
    
    if (lic) setLicencias(lic as Licencia[]);
    if (fac) setFacturas(fac as Factura[]);
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const registrarPago = async (lic: Licencia) => {
    const { error } = await supabase.rpc('registrar_pago_licencia', { id_cliente_buscado: lic.cliente_id });

    if (!error) {
      await supabase.from('facturas').insert([{
        sistema: lic.sistema || 'General',
        monto: lic.monto_mensual || 1500,
        fecha: new Date().toISOString(),
        negocio: lic.nombre_negocio
      }]);

      toast.success("Pago registrado y factura generada");
      setInvoiceData({
        numFactura: Math.floor(1000 + Math.random() * 9000),
        negocio: lic.nombre_negocio,
        sistema: lic.sistema,
        monto: lic.monto_mensual || 1500,
        fecha: new Date().toLocaleDateString('es-DO'),
        proximoVencimiento: lic.fecha_vencimiento
      });
      cargarDatos();
    } else {
      toast.error("Error al procesar el pago");
    }
  };

  const crearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('licencias').insert([nuevoForm]);
    if (!error) {
      toast.success("¡Cliente y accesos registrados con éxito!");
      setShowModalNuevo(false);
      setNuevoForm({
        cliente_id: '',
        nombre_negocio: '',
        sistema: 'POS Cafetería',
        monto_mensual: 1500,
        fecha_vencimiento: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        telefono: '',
        notas: '',
        admin_user: '',
        caja_user: 'caja_ventas',
        admin_pass: 'admin123',
        caja_pass: 'caja123'
      });
      cargarDatos();
    } else {
      toast.error("Error al registrar cliente: " + error.message);
    }
  };

  const actualizarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteEditando) return;

    const { error } = await supabase
      .from('licencias')
      .update({
        nombre_negocio: clienteEditando.nombre_negocio,
        sistema: clienteEditando.sistema,
        monto_mensual: clienteEditando.monto_mensual,
        fecha_vencimiento: clienteEditando.fecha_vencimiento,
        telefono: clienteEditando.telefono,
        admin_user: clienteEditando.admin_user,
        admin_pass: clienteEditando.admin_pass,
        caja_user: clienteEditando.caja_user,
        caja_pass: clienteEditando.caja_pass,
        notas: clienteEditando.notas
      })
      .eq('id', clienteEditando.id);

    if (!error) {
      toast.success("Datos del cliente actualizados correctamente");
      setClienteEditando(null);
      cargarDatos();
    } else {
      toast.error("Error al actualizar: " + error.message);
    }
  };

  const eliminarCliente = async (id: string, nombre: string) => {
    if (window.confirm(`⚠️ ¿Estás seguro de eliminar el registro de "${nombre}"? Esta acción borrará la licencia del sistema.`)) {
      const { error } = await supabase.from('licencias').delete().eq('id', id);
      if (!error) {
        toast.success("Cliente eliminado correctamente");
        cargarDatos();
      } else {
        toast.error("Error al eliminar: " + error.message);
      }
    }
  };

  const enviarWhatsApp = (lic: Licencia) => {
    if (!lic.telefono) {
      toast.error("Este cliente no tiene un teléfono registrado.");
      return;
    }
    const mensaje = `Hola *${lic.nombre_negocio}*, le escribimos de *KorexDev (Soluciones Tecnológicas)*. Sus accesos para el sistema *${lic.sistema || 'software'}* son:\n\n👤 *Admin:* ${lic.admin_user || 'N/A'} / Clave: ${lic.admin_pass || 'admin123'}\n👤 *Caja:* ${lic.caja_user || 'caja_ventas'} / Clave: ${lic.caja_pass || 'caja123'}\n\nSu licencia vence el ${lic.fecha_vencimiento} (Monto: RD$${(lic.monto_mensual || 1500).toLocaleString()}). ¡Gracias por confiar en nosotros!`;
    const url = `https://wa.me/${lic.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const licenciasFiltradas = licencias.filter(l => {
    const coincideTexto = l.nombre_negocio?.toLowerCase().includes(busqueda.toLowerCase()) || l.cliente_id?.includes(busqueda);
    const coincideSistema = sistemaFiltro === 'TODOS' || l.sistema === sistemaFiltro;
    return coincideTexto && coincideSistema;
  });

  const totalIngresos = facturas.reduce((acc, f) => acc + Number(f.monto), 0);
  const totalClientesActivos = licencias.length;
  
  const alertasVencimiento = licencias.filter(l => {
    if (!l.fecha_vencimiento) return false;
    const dias = (new Date(l.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return dias < 7 && dias >= 0;
  }).length;

  if (loading) return (
    <div className="bg-[#020617] flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Server className="text-cyan-500 animate-pulse w-12 h-12" />
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500">Cargando Centro de Control KorexDev...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans pb-20 ${darkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {darkMode && (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[140px]" />
        </div>
      )}

      {/* Navbar Superior */}
      <nav className={`border-b sticky top-0 z-50 px-6 md:px-12 h-20 flex items-center justify-between backdrop-blur-2xl ${darkMode ? 'bg-slate-950/60 border-white/5' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-lg md:text-xl font-black italic tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              KOREX<span className="text-cyan-500">DEV</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold mt-0.5">Soluciones Tecnológicas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModalNuevo(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Nuevo Cliente
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="p-2.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
            title="Cerrar Sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8 md:mt-12">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tight">Panel Administrativo</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Gestión integral de licencias, accesos y facturación.</p>
          </div>
          <button 
            onClick={() => setShowModalNuevo(true)}
            className="sm:hidden flex items-center justify-center gap-2 w-full py-3 bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20"
          >
            <Plus size={16} /> Registrar Nuevo Cliente
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <MetricCard title="Total Clientes (Suscripciones)" value={totalClientesActivos} icon={<Users />} color="cyan" darkMode={darkMode} />
          <MetricCard title="Ingresos Históricos Globales" value={`RD$ ${totalIngresos.toLocaleString()}`} icon={<TrendingUp />} color="emerald" darkMode={darkMode} />
          <MetricCard title="Alertas de Vencimiento (< 7 días)" value={alertasVencimiento} icon={<AlertTriangle />} color="amber" isAlert={alertasVencimiento > 0} darkMode={darkMode} />
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-3 border-b pb-4 mb-8 border-white/10 overflow-x-auto">
          <button 
            onClick={() => setCurrentTab('clientes')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${currentTab === 'clientes' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-black' : darkMode ? 'bg-slate-900/60 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <Users size={16} /> Clientes & Licencias
          </button>
          <button 
            onClick={() => setCurrentTab('facturas')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${currentTab === 'facturas' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-black' : darkMode ? 'bg-slate-900/60 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <FileText size={16} /> Historial de Facturas
          </button>
          <button 
            onClick={() => setCurrentTab('analitica')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${currentTab === 'analitica' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-black' : darkMode ? 'bg-slate-900/60 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            <BarChart3 size={16} /> Analítica por Producto
          </button>
        </div>

        {currentTab === 'clientes' && (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
              {sistemasDisponibles.map((sistema) => {
                const activo = sistemaFiltro === sistema;
                return (
                  <button
                    key={sistema}
                    onClick={() => setSistemaFiltro(sistema)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                      activo 
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black' 
                        : darkMode ? 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border border-white/5' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Layers size={13} />
                    {sistema}
                  </button>
                );
              })}
            </div>

            <div className="relative mb-8 w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por negocio o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full rounded-2xl py-3.5 pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${darkMode ? 'bg-slate-900/80 border-white/5 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 shadow-sm placeholder:text-slate-400'}`}
              />
            </div>

            <div className="space-y-4">
              {licenciasFiltradas.length === 0 ? (
                <div className={`p-12 text-center rounded-3xl border ${darkMode ? 'bg-slate-900/20 border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <Cpu className="mx-auto w-10 h-10 mb-3 opacity-40 text-cyan-500" />
                  <p className="font-bold text-sm">No se encontraron licencias registradas.</p>
                </div>
              ) : (
                licenciasFiltradas.map((lic: Licencia) => {
                  const dias = Math.ceil((new Date(lic.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const critico = dias < 7;

                  return (
                    <div 
                      key={lic.id} 
                      className={`p-6 rounded-3xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                        darkMode 
                          ? 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30 shadow-xl' 
                          : 'bg-white border-slate-200 shadow-sm hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-5 w-full lg:w-auto">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-lg ${
                          critico ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20'
                        }`}>
                          {lic.nombre_negocio ? lic.nombre_negocio[0].toUpperCase() : 'K'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className={`font-black text-lg uppercase tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {lic.nombre_negocio}
                            </h4>
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {lic.sistema || 'Sistema General'}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              RD$ {Number(lic.monto_mensual || 1500).toLocaleString()}/mes
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 flex-wrap">
                            <span>ID: <strong className="text-white">{lic.cliente_id}</strong></span>
                            {lic.telefono && <span>• Tel: {lic.telefono}</span>}
                            <span className="bg-slate-800/80 px-2.5 py-1 rounded-md text-[10px] text-cyan-300 border border-white/5">
                              👤 <strong>Admin:</strong> {lic.admin_user || 'N/A'} ({lic.admin_pass || '***'}) | 💼 <strong>Caja:</strong> {lic.caja_user || 'caja_ventas'} ({lic.caja_pass || '***'})
                            </span>
                          </div>
                          {lic.notas && (
                            <p className="text-xs text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-lg mt-2 font-medium border border-amber-500/20 max-w-md truncate">
                              📝 <strong>Nota:</strong> {lic.notas}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                        <div className="text-left lg:text-right">
                          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Vencimiento</p>
                          <p className={`font-mono text-sm lg:text-base font-bold ${critico ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                            {lic.fecha_vencimiento} ({dias}d)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => enviarWhatsApp(lic)}
                            className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/20"
                            title="Enviar credenciales y recordatorio por WhatsApp"
                          >
                            <Phone size={16} />
                          </button>

                          <button 
                            onClick={() => setClienteEditando(lic)}
                            className="p-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-all border border-cyan-500/20"
                            title="Editar datos del cliente"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button 
                            onClick={() => eliminarCliente(lic.id, lic.nombre_negocio)}
                            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"
                            title="Eliminar cliente"
                          >
                            <Trash2 size={16} />
                          </button>

                          <button 
                            onClick={() => registrarPago(lic)}
                            className={`px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                              darkMode 
                                ? 'bg-white text-slate-950 hover:bg-cyan-500 hover:text-white' 
                                : 'bg-slate-900 text-white hover:bg-cyan-600'
                            }`}
                          >
                            Cobrar RD$ {(lic.monto_mensual || 1500).toLocaleString()}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {currentTab === 'facturas' && (
          <div className={`p-6 md:p-8 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="text-lg font-black italic mb-6">Registro de Facturación & Pagos Recibidos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] uppercase font-mono tracking-widest text-slate-500 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                    <th className="py-3 px-4">Negocio / Cliente</th>
                    <th className="py-3 px-4">Sistema</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Fecha de Pago</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium">
                  {facturas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">No hay facturas registradas aún.</td>
                    </tr>
                  ) : (
                    facturas.map((fac) => (
                      <tr key={fac.id} className={`border-b transition-colors ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className="py-4 px-4 font-bold uppercase">{fac.negocio || 'Cliente General'}</td>
                        <td className="py-4 px-4"><span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 font-mono rounded text-[10px]">{fac.sistema || 'POS'}</span></td>
                        <td className="py-4 px-4 font-mono font-bold text-emerald-400">RD$ {Number(fac.monto).toLocaleString()}</td>
                        <td className="py-4 px-4 font-mono text-slate-400">{new Date(fac.fecha).toLocaleDateString('es-DO')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'analitica' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 md:p-8 rounded-3xl border ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h3 className="text-lg font-black italic mb-2">Desglose de Clientes por Sistema</h3>
              <p className="text-xs text-slate-500 mb-6">Cantidad de negocios activos segmentados por cada solución tecnológica de KorexDev.</p>
              
              <div className="space-y-4">
                {sistemasDisponibles.filter(s => s !== 'TODOS').map(sys => {
                  const count = licencias.filter(l => l.sistema === sys).length;
                  const porcentaje = totalClientesActivos > 0 ? (count / totalClientesActivos) * 100 : 0;
                  
                  return (
                    <div key={sys} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{sys}</span>
                        <span className="font-mono text-cyan-400">{count} clientes ({porcentaje.toFixed(0)}%)</span>
                      </div>
                      <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div>
                <h3 className="text-lg font-black italic mb-2">Resumen Financiero del Portafolio</h3>
                <p className="text-xs text-slate-500 mb-6">Proyección mensual estimada basada en licencias activas actuales.</p>
                
                <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Proyección Mensual Fija</p>
                  <p className="text-3xl font-black italic font-mono mt-1 text-white">
                    RD$ {licencias.reduce((acc, l) => acc + Number(l.monto_mensual || 1500), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono bg-white/5 p-4 rounded-xl border border-white/5">
                💡 <strong>KorexDev Cloud:</strong> Todos los nodos y bases de datos operan con sincronización en tiempo real vía Supabase.
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: REGISTRAR NUEVO CLIENTE */}
      {showModalNuevo && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
          <div className={`p-8 rounded-3xl w-full max-w-lg shadow-2xl border max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic tracking-tight">Alta de Nuevo Cliente & Credenciales</h3>
              <button onClick={() => setShowModalNuevo(false)} className="p-2 text-slate-400 hover:text-white rounded-lg"><X size={20} /></button>
            </div>

            <form onSubmit={crearCliente} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">ID / Código del Cliente</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Davidcell_02"
                    value={nuevoForm.cliente_id}
                    onChange={(e) => setNuevoForm({...nuevoForm, cliente_id: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Nombre del Negocio</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Davidcell"
                    value={nuevoForm.nombre_negocio}
                    onChange={(e) => setNuevoForm({...nuevoForm, nombre_negocio: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Sistema Contratado</label>
                  <select 
                    value={nuevoForm.sistema}
                    onChange={(e) => setNuevoForm({...nuevoForm, sistema: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  >
                    {sistemasDisponibles.filter(s => s !== 'TODOS').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Monto Mensual (RD$)</label>
                  <input 
                    type="number" 
                    required
                    value={nuevoForm.monto_mensual}
                    onChange={(e) => setNuevoForm({...nuevoForm, monto_mensual: Number(e.target.value)})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              {/* Credenciales de Acceso */}
              <div className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10 space-y-3">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Credenciales del Sistema</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Usuario Admin</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Davidcell"
                      value={nuevoForm.admin_user}
                      onChange={(e) => setNuevoForm({...nuevoForm, admin_user: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Clave Admin</label>
                    <input 
                      type="text" 
                      value={nuevoForm.admin_pass}
                      onChange={(e) => setNuevoForm({...nuevoForm, admin_pass: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Usuario Caja</label>
                    <input 
                      type="text" 
                      value={nuevoForm.caja_user}
                      onChange={(e) => setNuevoForm({...nuevoForm, caja_user: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Clave Caja</label>
                    <input 
                      type="text" 
                      value={nuevoForm.caja_pass}
                      onChange={(e) => setNuevoForm({...nuevoForm, caja_pass: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Fecha de Vencimiento</label>
                  <input 
                    type="date" 
                    required
                    value={nuevoForm.fecha_vencimiento}
                    onChange={(e) => setNuevoForm({...nuevoForm, fecha_vencimiento: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Teléfono (WhatsApp)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. 18295551234"
                    value={nuevoForm.telefono}
                    onChange={(e) => setNuevoForm({...nuevoForm, telefono: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Notas Técnicas / Hardware</label>
                <textarea 
                  rows={2}
                  placeholder="Ej. Usa impresora térmica XPrinter..."
                  value={nuevoForm.notas}
                  onChange={(e) => setNuevoForm({...nuevoForm, notas: e.target.value})}
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModalNuevo(false)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="flex-1 bg-cyan-500 text-slate-950 py-3 rounded-xl font-black uppercase shadow-lg shadow-cyan-500/20">Registrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CLIENTE */}
      {clienteEditando && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
          <div className={`p-8 rounded-3xl w-full max-w-lg shadow-2xl border max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black italic tracking-tight">Editar Cliente</h3>
                <p className="text-[10px] font-mono text-cyan-400">ID: {clienteEditando.cliente_id}</p>
              </div>
              <button onClick={() => setClienteEditando(null)} className="p-2 text-slate-400 hover:text-white rounded-lg"><X size={20} /></button>
            </div>

            <form onSubmit={actualizarCliente} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Nombre del Negocio</label>
                  <input 
                    type="text" 
                    required
                    value={clienteEditando.nombre_negocio || ''}
                    onChange={(e) => setClienteEditando({...clienteEditando, nombre_negocio: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Sistema Contratado</label>
                  <select 
                    value={clienteEditando.sistema || 'POS Cafetería'}
                    onChange={(e) => setClienteEditando({...clienteEditando, sistema: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  >
                    {sistemasDisponibles.filter(s => s !== 'TODOS').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Monto Mensual (RD$)</label>
                  <input 
                    type="number" 
                    required
                    value={clienteEditando.monto_mensual || 1500}
                    onChange={(e) => setClienteEditando({...clienteEditando, monto_mensual: Number(e.target.value)})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Fecha de Vencimiento</label>
                  <input 
                    type="date" 
                    required
                    value={clienteEditando.fecha_vencimiento || ''}
                    onChange={(e) => setClienteEditando({...clienteEditando, fecha_vencimiento: e.target.value})}
                    className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                  />
                </div>
              </div>

              {/* Credenciales de Acceso */}
              <div className="bg-cyan-500/5 p-4 rounded-2xl border border-cyan-500/10 space-y-3">
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Modificar Credenciales</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Usuario Admin</label>
                    <input 
                      type="text" 
                      value={clienteEditando.admin_user || ''}
                      onChange={(e) => setClienteEditando({...clienteEditando, admin_user: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Clave Admin</label>
                    <input 
                      type="text" 
                      value={clienteEditando.admin_pass || ''}
                      onChange={(e) => setClienteEditando({...clienteEditando, admin_pass: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Usuario Caja</label>
                    <input 
                      type="text" 
                      value={clienteEditando.caja_user || ''}
                      onChange={(e) => setClienteEditando({...clienteEditando, caja_user: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-[8px] text-slate-400 mb-1">Clave Caja</label>
                    <input 
                      type="text" 
                      value={clienteEditando.caja_pass || ''}
                      onChange={(e) => setClienteEditando({...clienteEditando, caja_pass: e.target.value})}
                      className={`w-full p-2.5 rounded-xl border font-mono ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Teléfono (WhatsApp)</label>
                <input 
                  type="text" 
                  value={clienteEditando.telefono || ''}
                  onChange={(e) => setClienteEditando({...clienteEditando, telefono: e.target.value})}
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-[9px] text-slate-400 mb-1">Notas Técnicas / Hardware</label>
                <textarea 
                  rows={2}
                  value={clienteEditando.notas || ''}
                  onChange={(e) => setClienteEditando({...clienteEditando, notas: e.target.value})}
                  className={`w-full p-3 rounded-xl border ${darkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setClienteEditando(null)} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="flex-1 bg-cyan-500 text-slate-950 py-3 rounded-xl font-black uppercase shadow-lg shadow-cyan-500/20">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Factura Generada */}
      {invoiceData && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 p-8 rounded-3xl w-full max-w-sm shadow-2xl font-mono border-t-[10px] border-cyan-600 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-center italic tracking-tighter">KOREXDEV</h2>
            <p className="text-[10px] text-center text-slate-400 font-bold mb-6 tracking-widest uppercase">Soluciones Tecnológicas</p>
            
            <div className="space-y-2 text-[11px] border-y py-4 mb-4 border-slate-100">
              <div className="flex justify-between"><span>FACTURA:</span><span className="font-bold">#00{invoiceData.numFactura}</span></div>
              <div className="flex justify-between uppercase"><span>CLIENTE:</span><span className="font-bold truncate ml-2">{invoiceData.negocio}</span></div>
              <div className="flex justify-between uppercase"><span>SISTEMA:</span><span className="font-bold text-cyan-600 ml-2">{invoiceData.sistema}</span></div>
            </div>

            <div className="text-center py-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Monto Procesado</p>
              <p className="text-3xl font-black italic">RD$ {invoiceData.monto.toLocaleString()}</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl text-center mb-6 border border-emerald-100">
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Próxima Renovación</p>
              <p className="font-black text-base text-emerald-700">{invoiceData.proximoVencimiento}</p>
            </div>

            <div className="flex gap-3">
               <button onClick={() => setInvoiceData(null)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold uppercase text-[9px] tracking-widest active:scale-95 transition-all">Cerrar</button>
               <button onClick={() => toast.info("¡Captura de pantalla lista!")} className="bg-cyan-600 text-white px-5 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"><Share2 size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Métricas
interface MetricProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'cyan' | 'emerald' | 'amber';
  isAlert?: boolean;
  darkMode: boolean;
}

function MetricCard({ title, value, icon, color, isAlert, darkMode }: MetricProps) {
  const colors = {
    cyan: darkMode ? "bg-cyan-500/10 text-cyan-400 border-white/5" : "bg-cyan-50 text-cyan-600 border-cyan-100",
    emerald: darkMode ? "bg-emerald-500/10 text-emerald-400 border-white/5" : "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: darkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-600 border-amber-200"
  };

  return (
    <div className={`p-6 md:p-8 rounded-[2rem] border transition-all ${darkMode ? 'bg-slate-900/40' : 'bg-white shadow-sm'} ${isAlert ? 'animate-pulse' : ''} ${colors[color]}`}>
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${darkMode ? 'bg-slate-950 shadow-inner' : 'bg-white shadow-inner'}`}>
        {icon}
      </div>
      <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">{title}</p>
      <p className={`text-2xl md:text-4xl font-black italic tracking-tighter mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}