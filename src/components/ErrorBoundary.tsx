"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Catches render/runtime errors from either workspace (a three.js crash, a bad
 * model payload) and shows a recoverable screen instead of a white page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error boundary caught:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Something broke</h2>
          <p className="text-sm text-slate-500 mb-1">
            The workspace hit an unexpected error. Your saved work is safe.
          </p>
          {this.state.message && (
            <p className="text-xs font-mono text-slate-400 mb-5 truncate" title={this.state.message}>
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reload
          </button>
        </div>
      </div>
    );
  }
}
