/**
 * Error Monitor - Detects runtime errors in the browser
 */

class ErrorMonitor {
    constructor() {
        this.errors = [];
        this.errorHandlers = [];
        this.isMonitoring = false;
    }

    /**
     * Start monitoring for errors
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        // Monitor console errors
        this.originalConsoleError = console.error;
        console.error = (...args) => {
            this.captureError('console', args.join(' '));
            this.originalConsoleError.apply(console, args);
        };

        // Monitor console warnings
        this.originalConsoleWarn = console.warn;
        console.warn = (...args) => {
            this.captureWarning('console', args.join(' '));
            this.originalConsoleWarn.apply(console, args);
        };

        // Monitor window errors
        window.addEventListener('error', (event) => {
            this.captureError('window', event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Monitor unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError('promise', event.reason);
        });

        this.isMonitoring = true;
        console.log('🔍 Error monitoring started');
    }

    /**
     * Capture an error
     */
    captureError(source, message, details = {}) {
        const error = {
            type: 'error',
            source,
            message: String(message),
            details,
            timestamp: new Date().toISOString()
        };

        this.errors.push(error);

        // Keep only last 50 errors
        if (this.errors.length > 50) {
            this.errors.shift();
        }

        // Notify handlers
        this.errorHandlers.forEach(handler => handler(error));
    }

    /**
     * Capture a warning
     */
    captureWarning(source, message) {
        const warning = {
            type: 'warning',
            source,
            message: String(message),
            timestamp: new Date().toISOString()
        };

        this.errors.push(warning);

        // Keep only last 50
        if (this.errors.length > 50) {
            this.errors.shift();
        }
    }

    /**
     * Register error handler
     */
    onError(handler) {
        this.errorHandlers.push(handler);
    }

    /**
     * Get recent errors
     */
    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }

    /**
     * Get errors by type
     */
    getErrorsByType(type) {
        return this.errors.filter(e => e.message.toLowerCase().includes(type.toLowerCase()));
    }

    /**
     * Clear errors
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Analyze error patterns
     */
    analyzeErrors() {
        const patterns = {
            vrmLoadErrors: this.getErrorsByType('vrm'),
            networkErrors: this.getErrorsByType('404').concat(this.getErrorsByType('fetch')),
            ttsErrors: this.getErrorsByType('tts'),
            whisperErrors: this.getErrorsByType('whisper'),
            llamaErrors: this.getErrorsByType('llama')
        };

        return patterns;
    }
}

export const errorMonitor = new ErrorMonitor();
