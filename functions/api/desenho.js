import { gerarDesenho } from '../../lib/desenho.js';

export async function onRequest(context) {
    const { request, env } = context;

    // 1. Verificação do método (Erro 405)
    if (request.method !== 'POST') {
        return new Response('Método não permitido', { status: 405 });
    }

    // 2. Verificação do corpo da requisição (Erro 400)
    let corpo;
    try {
        corpo = await request.json();
    } catch (e) {
        return new Response('Corpo ausente ou JSON inválido', { status: 400 });
    }

    const numero = corpo.numero;
    if (numero === undefined || !Number.isInteger(numero) || numero < 1 || numero > 100) {
        return new Response('Número ausente, não inteiro ou fora do intervalo', { status: 400 });
    }

    // 3. Verificação do Token do Google (Erro 401)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Token ausente ou mal formatado', { status: 401 });
    }

    const token = authHeader.split(' ')[1]; // Pega apenas a parte do token, tirando a palavra "Bearer"

    // Chama o endpoint do Google para validar o id_token
    const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    
    if (!googleResponse.ok) {
        return new Response('Token inválido ou expirado', { status: 401 });
    }

    const tokenData = await googleResponse.json();

    // Verifica se o aud é igual ao seu Client ID e se o e-mail foi verificado
    if (tokenData.aud !== env.GOOGLE_CLIENT_ID || tokenData.email_verified !== "true") {
        return new Response('Token não autorizado para esta aplicação ou e-mail não verificado', { status: 401 });
    }

    const email = tokenData.email;

    // 4. Sucesso (Código 200) - Gera o desenho e devolve o SVG
    const svg = gerarDesenho(numero, email);

    return new Response(svg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml'
        }
    });
}