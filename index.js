export default {
  async fetch(request, env, ctx) {
    return new Response(HTML_CONTENT, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=300'
      },
    });
  },
};

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RCUG Member Progress Dashboard</title>
    <!-- CDN Libraries with fallback error handling -->
    <script>
        window.cdnLoadErrors = [];
        function handleCdnError(libName) {
            window.cdnLoadErrors.push(libName);
            console.error('Failed to load CDN library: ' + libName);
        }
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js" onerror="handleCdnError('PapaParse')"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" onerror="handleCdnError('jsPDF')"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" onerror="handleCdnError('html2canvas')"></script>
    <style>