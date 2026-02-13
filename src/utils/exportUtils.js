/**
 * CSV Export Utilities for LogTable
 * Provides functions to export table data to CSV format with progress tracking
 */

/**
 * Escapes special characters in CSV fields
 * @param {string|number|null|undefined} value - The value to escape
 * @returns {string} - Escaped and quoted value if necessary
 */
const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';

    let stringValue = String(value);

    // Replace newlines and carriage returns with spaces to prevent row breaks in Excel
    stringValue = stringValue.replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');

    // Check if value contains special characters that require quoting
    if (stringValue.includes(',') || stringValue.includes('"')) {
        // Escape double quotes by doubling them
        const escapedValue = stringValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }

    return stringValue;
};

/**
 * Formats a column header for CSV export
 * @param {string} field - The field name (e.g., 'branch_code')
 * @returns {string} - Formatted header (e.g., 'BRANCH CODE')
 */
const formatHeader = (field) => {
    return field.replace(/_/g, ' ').toUpperCase();
};

/**
 * Formats a cell value for CSV export
 * @param {*} value - The cell value
 * @param {string} field - The field name
 * @returns {string} - Formatted value
 */
const formatCellValue = (value, field) => {
    if (value === null || value === undefined) return '';

    // Format dates
    if (['time_log', 'created_at', 'updated_at'].includes(field)) {
        try {
            return new Date(value).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return String(value);
        }
    }

    return String(value);
};

/**
 * Exports table data to CSV format with progress tracking
 * @param {Array} data - Array of row objects to export
 * @param {string} filename - Name for the downloaded file (without extension)
 * @param {Function} onProgress - Callback function for progress updates (current, total)
 * @param {Array} columnOrder - Optional array of column field names in desired order
 * @param {AbortSignal} abortSignal - Optional abort signal to cancel the export
 * @param {Object} isPausedRef - Optional ref to check if export is paused
 * @returns {Promise<void>}
 */
export const exportToCSV = async (data, filename, onProgress = null, columnOrder = null, abortSignal = null, isPausedRef = null) => {
    return new Promise((resolve, reject) => {
        try {
            if (!data || data.length === 0) {
                reject(new Error('No data to export'));
                return;
            }

            // Get column names - use provided order or default from object keys
            const columns = columnOrder
                ? columnOrder.filter(key => key !== 'incharge_id')
                : Object.keys(data[0]).filter(key => key !== 'incharge_id');

            // Create CSV header row
            const headers = columns.map(formatHeader);
            const csvRows = [headers.join(',')];

            // Process data rows with progress tracking
            const totalRows = data.length;
            const chunkSize = Math.max(1, Math.floor(totalRows / 100)); // Process in chunks for smooth progress

            let processedRows = 0;

            const processChunk = () => {
                // Check if export was cancelled
                if (abortSignal?.aborted) {
                    reject(new Error('Export cancelled by user'));
                    return;
                }

                // Check if export is paused - wait and check again
                if (isPausedRef?.current) {
                    setTimeout(processChunk, 100);  // Check again in 100ms
                    return;
                }

                const endIndex = Math.min(processedRows + chunkSize, totalRows);

                for (let i = processedRows; i < endIndex; i++) {
                    const row = data[i];
                    const values = columns.map(col => {
                        const formattedValue = formatCellValue(row[col], col);
                        return escapeCsvValue(formattedValue);
                    });
                    csvRows.push(values.join(','));
                }

                processedRows = endIndex;

                // Report progress
                if (onProgress) {
                    const progress = Math.round((processedRows / totalRows) * 100);
                    onProgress(processedRows, totalRows, progress);
                }

                // Continue processing or finalize
                if (processedRows < totalRows) {
                    // Use setTimeout to prevent blocking the UI
                    setTimeout(processChunk, 0);
                } else {
                    // All rows processed, create download
                    finalizeCsv();
                }
            };

            const finalizeCsv = () => {
                try {
                    // Join all rows with newline
                    const csvContent = csvRows.join('\n');

                    // Add UTF-8 BOM to ensure proper encoding of special characters
                    const BOM = '\uFEFF';
                    const csvWithBOM = BOM + csvContent;

                    // Create blob and download
                    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');

                    if (navigator.msSaveBlob) {
                        // IE 10+
                        navigator.msSaveBlob(blob, `${filename}.csv`);
                    } else {
                        const url = URL.createObjectURL(blob);
                        link.href = url;
                        link.download = `${filename}.csv`;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }

                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            // Start processing
            processChunk();

        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generates a filename for CSV export with timestamp
 * @param {string} logType - Type of log (e.g., 'daily-concerns', 'cams-adjustment')
 * @returns {string} - Filename with timestamp
 */
export const generateFilename = (logType) => {
    const timestamp = new Date().toISOString()
        .replace(/:/g, '-')
        .replace(/\..+/, '')
        .replace('T', '_');
    return `${logType}_${timestamp}`;
};
