import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, FileSpreadsheet } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Crash Caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('neraca_puk_master_data');
    localStorage.removeItem('neraca_puk_filename');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Terjadi Kesalahan Tampilan
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Format data Excel yang diunggah mungkin berbeda atau terdapat struktur data yang tidak sesuai.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left overflow-x-auto max-h-32 text-xs font-mono text-rose-300">
                {String(this.state.error.message || this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs sm:text-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Pulihkan ke Data Master</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
