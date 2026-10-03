let tokenGoogle = "";

// Função chamada automaticamente pelo Google após o login
function handleCredentialResponse(response) {
    tokenGoogle = response.credential;
    document.getElementById("resultado").innerHTML = "<p style='color: green;'>Login realizado com sucesso! Você já pode gerar o desenho.</p>";
}

// Intercepta o envio do formulário
document.getElementById("formulario").addEventListener("submit", async function(event) {
    event.preventDefault(); // Evita que a página recarregue

    const resultadoDiv = document.getElementById("resultado");
    const numero = parseInt(document.getElementById("numero").value, 10);

    // Verifica se o usuário fez o login antes de tentar gerar
    if (!tokenGoogle) {
        resultadoDiv.innerHTML = "<p style='color: red;'>Erro: Você precisa fazer o login com o Google primeiro.</p>";
        return;
    }

    resultadoDiv.innerHTML = "<p>Gerando desenho...</p>";

    try {
        // Faz a requisição POST para a nossa API
        const response = await fetch('/api/desenho', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenGoogle}`
            },
            body: JSON.stringify({ numero: numero })
        });

        if (response.status === 200) {
            // Sucesso: exibe o SVG na tela
            const svgText = await response.text();
            resultadoDiv.innerHTML = svgText;
        } else if (response.status === 400) {
            // Erro 400: Corpo inválido ou número fora do limite
            resultadoDiv.innerHTML = "<p style='color: red;'>Erro 400: O número enviado é inválido. Certifique-se de usar um número inteiro de 1 a 100.</p>";
        } else if (response.status === 401) {
            // Erro 401: Problema com o token
            resultadoDiv.innerHTML = "<p style='color: red;'>Erro 401: Não autorizado. Faça o login novamente. Token ausente ou inválido.</p>";
        } else {
            // Outros erros
            resultadoDiv.innerHTML = `<p style='color: red;'>Erro inesperado. Código: ${response.status}</p>`;
        }
    } catch (error) {
        resultadoDiv.innerHTML = "<p style='color: red;'>Erro ao conectar com o servidor.</p>";
        console.error(error);
    }
});