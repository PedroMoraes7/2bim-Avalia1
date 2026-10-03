// Variável global para armazenar o token do Google
let tokenGoogle = "";

// Função chamada automaticamente pelo Google após o login
// Ela PRECISA ser global para o botão do Google enxergá-la
window.handleCredentialResponse = function(response) {
    tokenGoogle = response.credential;
    const resultadoDiv = document.getElementById("resultado");
    if (resultadoDiv) {
        resultadoDiv.innerHTML = "<p style='color: green;'>Login realizado com sucesso! Você já pode gerar o desenho.</p>";
    }
    console.log("Token recebido com sucesso.");
};

// Garante que o código só adicione os eventos após o HTML carregar completamente
document.addEventListener("DOMContentLoaded", function() {
    const formulario = document.getElementById("formulario");
    
    if (formulario) {
        formulario.addEventListener("submit", async function(event) {
            // Impede o recarregamento padrão da página (ESSENCIAL)
            event.preventDefault(); 

            const resultadoDiv = document.getElementById("resultado");
            const numeroInput = document.getElementById("numero");
            
            if (!numeroInput) {
                resultadoDiv.innerHTML = "<p style='color: red;'>Erro: Campo de número não encontrado.</p>";
                return;
            }

            const numero = parseInt(numeroInput.value, 10);

            // Verifica se o usuário tem o token antes de enviar
            if (!tokenGoogle) {
                resultadoDiv.innerHTML = "<p style='color: red;'>Erro: Você precisa fazer o login com o Google primeiro.</p>";
                return;
            }

            resultadoDiv.innerHTML = "<p>Enviando para o servidor e gerando desenho...</p>";

            try {
                // Faz a requisição POST para a API[cite: 4]
                const response = await fetch('/api/desenho', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenGoogle}`
                    },
                    body: JSON.stringify({ numero: numero })
                });

                // Tratamento das respostas conforme o contrato da API[cite: 4]
                if (response.status === 200) {
                    const svgText = await response.text();
                    resultadoDiv.innerHTML = svgText;
                } else if (response.status === 400) {
                    resultadoDiv.innerHTML = "<p style='color: red;'>Erro 400: O número enviado é inválido. Use um inteiro de 1 a 100.</p>";
                } else if (response.status === 401) {
                    resultadoDiv.innerHTML = "<p style='color: red;'>Erro 401: Não autorizado. Faça o login novamente. Token ausente ou inválido.</p>";
                } else if (response.status === 405) {
                    resultadoDiv.innerHTML = "<p style='color: red;'>Erro 405: Método não permitido.</p>";
                } else {
                    resultadoDiv.innerHTML = `<p style='color: red;'>Erro inesperado. Código: ${response.status}</p>`;
                }
            } catch (error) {
                resultadoDiv.innerHTML = "<p style='color: red;'>Erro ao conectar com o servidor. Verifique o console.</p>";
                console.error("Erro na requisição:", error);
            }
        });
    } else {
        console.error("Formulário com ID 'formulario' não encontrado no HTML.");
    }
});