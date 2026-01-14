import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getApiUrl } from './api';
import type { LeadMagnet, UserProfile } from './types';
import { PLAN_LIMITS } from './types';

export type ExportFormat = 'pdf' | 'html';

interface ExportOptions {
    format: ExportFormat;
    leadMagnet: LeadMagnet;
    userPlan: UserProfile['plan'];
    contentElement?: HTMLElement;
}

interface ExportResult {
    success: boolean;
    blob?: Blob;
    filename?: string;
    error?: string;
}

// Check if running on iOS native
const isIOSNative = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

/**
 * Check if user can export in the requested format
 */
export function canExportFormat(format: ExportFormat, plan: UserProfile['plan']): boolean {
    const limits = PLAN_LIMITS[plan];
    return limits.exportFormats.includes(format);
}

/**
 * Check if export should include watermark
 */
export function shouldAddWatermark(plan: UserProfile['plan']): boolean {
    return !PLAN_LIMITS[plan].removeWatermark;
}

/**
 * Generate HTML document for export
 */
function generateExportHTML(leadMagnet: LeadMagnet, addWatermark: boolean): string {
    const primaryColor = leadMagnet.design?.primaryColor || '#8B5CF6';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${leadMagnet.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: Letter;
            margin: 0.75in;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.7;
            color: #1f2937;
            background: white;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 3px solid ${primaryColor};
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: ${primaryColor}15;
            color: ${primaryColor};
            border-radius: 100px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .content h1 {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid ${primaryColor}30;
        }
        
        .content h2 {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
            margin: 28px 0 12px 0;
        }
        
        .content h3 {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin: 20px 0 8px 0;
        }
        
        .content p {
            margin: 0 0 16px 0;
            color: #4b5563;
        }
        
        .content ul, .content ol {
            margin: 16px 0 20px 24px;
            color: #4b5563;
        }
        
        .content li {
            margin-bottom: 8px;
            padding-left: 8px;
        }
        
        .content strong {
            color: #1f2937;
            font-weight: 600;
        }
        
        .content blockquote {
            margin: 20px 0;
            padding: 16px 20px;
            background: ${primaryColor}08;
            border-left: 4px solid ${primaryColor};
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #374151;
        }
        
        .content blockquote p {
            margin: 0;
        }
        
        .content code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
        }
        
        .content pre {
            background: #1f2937;
            color: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
        }
        
        .content pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        .content hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 32px 0;
        }
        
        .watermark {
            margin-top: 48px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .watermark {
                position: fixed;
                bottom: 20px;
                left: 0;
                right: 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${leadMagnet.title}</h1>
        <span class="badge">Checklist</span>
    </div>
    
    <div class="content">
        ${leadMagnet.content}
    </div>
    
    ${addWatermark ? `
    <div class="watermark">
        Made with LeadMagnet AI
    </div>
    ` : ''}
</body>
</html>`;
}

/**
 * iOS-specific PDF export using server-side generation
 * Sends HTML to API, receives PDF, saves and shares via native iOS share sheet
 */
async function exportToPDFiOS(leadMagnet: LeadMagnet, addWatermark: boolean): Promise<ExportResult> {
    try {
        const html = generateExportHTML(leadMagnet, addWatermark);

        // Use Inkfluence's PDF generation API
        const apiUrl = getApiUrl('/api/generate-pdf');

        console.log('[Export] Sending to PDF API:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html,
                title: leadMagnet.title,
                platform: 'ios',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `PDF generation failed: ${response.status}`);
        }

        const pdfBlob = await response.blob();

        // Convert blob to base64 for Capacitor Filesystem
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove the data URL prefix
                resolve(base64.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(pdfBlob);
        });

        // Save to cache directory
        const filename = `${leadMagnet.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

        const savedFile = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
        });

        console.log('[Export] PDF saved to:', savedFile.uri);

        // Open iOS share sheet
        try {
            await Share.share({
                title: leadMagnet.title,
                text: `${leadMagnet.title} - PDF Export`,
                url: savedFile.uri,
                dialogTitle: 'Share your PDF',
            });
        } catch {
            // User cancelled share sheet - not an error
            console.log('[Export] Share cancelled by user');
        }

        return { success: true, blob: pdfBlob, filename };

    } catch (error) {
        console.error('[Export] iOS PDF export failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export PDF'
        };
    }
}

/**
 * Web PDF export using print dialog
 */
async function exportToPDFWeb(leadMagnet: LeadMagnet, addWatermark: boolean): Promise<ExportResult> {
    try {
        const html = generateExportHTML(leadMagnet, addWatermark);

        // Open print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Could not open print window. Please disable popup blocker.');
        }

        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);

        return { success: true };

    } catch (error) {
        console.error('[Export] Web PDF export failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export PDF'
        };
    }
}

/**
 * Export as PDF - routes to iOS or Web implementation
 */
async function exportAsPDF(leadMagnet: LeadMagnet, addWatermark: boolean): Promise<ExportResult> {
    if (isIOSNative()) {
        return exportToPDFiOS(leadMagnet, addWatermark);
    }
    return exportToPDFWeb(leadMagnet, addWatermark);
}

/**
 * Export as HTML file
 */
async function exportAsHTML(leadMagnet: LeadMagnet, addWatermark: boolean): Promise<ExportResult> {
    try {
        const html = generateExportHTML(leadMagnet, addWatermark);
        const blob = new Blob([html], { type: 'text/html' });
        const filename = `${leadMagnet.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;

        return { success: true, blob, filename };
    } catch (error) {
        console.error('[Export] HTML export failed:', error);
        return { success: false, error: 'Failed to export HTML' };
    }
}

/**
 * Main export function
 */
export async function exportLeadMagnet(options: ExportOptions): Promise<ExportResult> {
    const { format, leadMagnet, userPlan } = options;

    // Check if user can export in this format
    if (!canExportFormat(format, userPlan)) {
        return {
            success: false,
            error: `${format.toUpperCase()} export is not available on your plan. Please upgrade to access this feature.`,
        };
    }

    const addWatermark = shouldAddWatermark(userPlan);

    switch (format) {
        case 'pdf':
            return exportAsPDF(leadMagnet, addWatermark);
        case 'html':
            return exportAsHTML(leadMagnet, addWatermark);
        default:
            return { success: false, error: 'Unknown export format' };
    }
}

/**
 * Trigger download of exported file (web only)
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Share exported file - uses native share on iOS, download on web
 */
export async function shareExport(blob: Blob, filename: string): Promise<boolean> {
    // On iOS native, the export function already handles sharing
    if (isIOSNative()) {
        return true;
    }

    // On web, try Web Share API first
    if (navigator.share && navigator.canShare) {
        try {
            const file = new File([blob], filename, { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: filename,
                });
                return true;
            }
        } catch (error) {
            console.error('[Export] Share error:', error);
        }
    }

    // Fallback to download
    downloadBlob(blob, filename);
    return false;
}
