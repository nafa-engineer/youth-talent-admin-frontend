const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-dev.youthtalent.id';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('auth-storage');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.accessToken ?? null;
  } catch {
    return null;
  }
}

type DownloadParams = Record<string, unknown>;

export async function downloadExcel(path: string, params: DownloadParams, filename: string): Promise<void> {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          url.searchParams.append(key, String(item));
        }
      });
    } else {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    let message = 'Gagal mengunduh file';
    try {
      const json = await res.json();
      message = json?.responseMessage || message;
    } catch {
      // respons bukan JSON
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const serverFilename = getFilenameFromDisposition(res.headers.get('content-disposition'));
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = serverFilename || filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

function getFilenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(disposition);
  return match ? decodeURIComponent(match[1].trim()) : null;
}