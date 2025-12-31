import { Shield, Lock } from 'lucide-react';
import '@/App.css';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
          <Shield className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">
          HT Activewear
        </h1>

        {/* Message */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">System Maintenance</h2>
          </div>
          
          <p className="text-slate-300 mb-4">
            We're currently performing system upgrades to serve you better.
          </p>
          
          <p className="text-slate-400 text-sm">
            The order system will be back online shortly.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-slate-500 text-sm">
          <p>Questions? Contact us at:</p>
          <p className="text-blue-400 mt-1">blindingmedia@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

export default App;