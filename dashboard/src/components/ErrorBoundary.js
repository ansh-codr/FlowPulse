import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-8", children: _jsxs("div", { className: "max-w-2xl w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold text-red-400", children: "\u26A0\uFE0F Application Error" }), _jsx("p", { className: "text-slate-300", children: "The app encountered an error:" }), _jsx("pre", { className: "bg-slate-900/50 p-4 rounded-lg overflow-auto text-xs text-red-300", children: this.state.error?.message }), _jsxs("details", { className: "text-xs text-slate-400", children: [_jsx("summary", { className: "cursor-pointer hover:text-slate-300", children: "Stack trace" }), _jsx("pre", { className: "mt-2 bg-slate-900/50 p-4 rounded-lg overflow-auto", children: this.state.error?.stack })] }), _jsx("button", { onClick: () => window.location.reload(), className: "px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition", children: "Reload Page" })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
