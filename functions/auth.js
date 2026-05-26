export async function onRequest(context) {
  const { env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  
  // Solicitamos acceso "repo" para que Decap pueda gestionar los archivos y PRs
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo`;
  
  return Response.redirect(url, 302);
} 
