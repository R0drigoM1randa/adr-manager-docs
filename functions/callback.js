export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const code = searchParams.get('code');
  const { env } = context;

  if (!code) {
    return new Response("Falta el código de autorización de GitHub", { status: 400 });
  } 

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(`Error de GitHub: ${data.error_description}`, { status: 500 });
    }

    // El script que Decap CMS espera en el navegador para recibir el token
    const html = `
      <script>
        const recieveToken = (message) => {
          window.opener.postMessage(
            'authorization:github:success:' + JSON.stringify({ token: "${data.access_token}", provider: "github" }),
            message.origin
          );
          window.removeEventListener("message", recieveToken, false);
          window.close();
        }
        window.addEventListener("message", recieveToken, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
