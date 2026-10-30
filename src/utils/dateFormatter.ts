/**
 * Utility functions for formatting dates in Indian Standard Format (DD-MM-YYYY)
 * using Indian Standard Time (IST - Asia/Kolkata).
 */

export function formatIndianDate(
  dateVal: string | number | Date | null | undefined,
  includeTime: boolean = false
): string {
  if (dateVal === null || dateVal === undefined) return '';

  const str = String(dateVal).trim();
  if (!str) return '';

  // Non-date placeholder strings like "Recent", "At intake", "Recorded on intake", etc.
  if (/^[A-Za-z\s]+$/.test(str) && !str.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i)) {
    return str;
  }

  // Handle ISO / SQL date: YYYY-MM-DD or YYYY/MM/DD with optional time
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (isoMatch) {
    const [, year, month, day, hours, minutes] = isoMatch;
    const formattedDay = day.padStart(2, '0');
    const formattedMonth = month.padStart(2, '0');
    const datePart = `${formattedDay}-${formattedMonth}-${year}`;

    if (includeTime && hours !== undefined && minutes !== undefined) {
      return `${datePart} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    return datePart;
  }

  // Handle already in DD-MM-YYYY or DD/MM/YYYY with optional time
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    const [, day, month, year, hours, minutes] = dmyMatch;
    const formattedDay = day.padStart(2, '0');
    const formattedMonth = month.padStart(2, '0');
    const datePart = `${formattedDay}-${formattedMonth}-${year}`;

    if (includeTime && hours !== undefined && minutes !== undefined) {
      return `${datePart} ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    return datePart;
  }

  // Fallback to standard JS Date parsing
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const datePart = `${day}-${month}-${year}`;

      if (includeTime) {
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${datePart} ${hours}:${mins}`;
      }
      return datePart;
    }
  } catch {
    // ignore
  }

  return str;
}

/**
 * Returns today's date in Indian format (DD-MM-YYYY) in IST (Asia/Kolkata).
 */
export function getTodayIndianDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(new Date());
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }
    return `${map['day']}-${map['month']}-${map['year']}`;
  } catch {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

/**
 * Returns today's date in ISO format (YYYY-MM-DD) in IST (Asia/Kolkata) for date inputs.
 */
export function getTodayISODate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(new Date());
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }
    return `${map['year']}-${map['month']}-${map['day']}`;
  } catch {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }
}

/**
 * Returns current date and time in Indian Standard Time (IST - Asia/Kolkata).
 */
export function getIndianCurrentDateTime(includeTime: boolean = true): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }
    const day = map['day'] || '01';
    const month = map['month'] || '01';
    const year = map['year'] || '2026';
    const datePart = `${day}-${month}-${year}`;

    if (includeTime) {
      const hour = map['hour'] || '00';
      const minute = map['minute'] || '00';
      return `${datePart} ${hour}:${minute}`;
    }
    return datePart;
  } catch {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const datePart = `${day}-${month}-${year}`;
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${datePart} ${hours}:${mins}`;
    }
    return datePart;
  }
}
