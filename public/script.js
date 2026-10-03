// Variável global para armazenar o token do Google
let tokenGoogle = "";

window.handleCredentialResponse = function(response) {
    tokenGoogle = response.credential;
    const resultadoDiv = document.getElementById("resultado");
    if (resultadoDiv) {
        resultadoDiv.innerHTML = "<p style='color: green;'>Login realizado com sucesso! Já pode gerar o desenho.</p>";
    }
    console.log("Token recebido com sucesso.");
};

document.addEventListener("DOMContentLoaded", function() {
    const formulario = document.getElementById("formulario");
    
    if (formulario) {
        formulario.addEventListener("submit", async function(event) {
            event.preventDefault(); 

            const resultadoDiv = document.getElementById("resultado");
            const numeroInput = document.getElementById("numero");
            const btnBaixar = document.getElementById("btn-baixar");
            
            // Esconde o botão ao tentar gerar um desenho novo
            if (btnBaixar) btnBaixar.style.display = "none";

            if (!numeroInput) {
                resultadoDiv.innerHTML = "<p style='color: red;'>Erro: Campo de número não encontrado.</p>";
                return;
            }

            const numero = parseInt(numeroInput.value, 10);

            if (!tokenGoogle) {
                resultadoDiv.innerHTML = "<p style='color: red;'>Erro: Precisa de fazer o login com o Google primeiro.</p>";
                return;
            }

            resultadoDiv.innerHTML = "<p>A enviar para o servidor e a gerar o desenho...</p>";

            try {
                const response = await fetch('/api/desenho', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokenGoogle}`
                    },
                    body: JSON.stringify({ numero: numero })
                });

                if (response.status === 200) {
                    const svgText = await response.text();
                    resultadoDiv.innerHTML = svgText;
                    
                    // Exibe o botão e cria a ação de transferência do ficheiro
                    if (btnBaixar) {
                        btnBaixar.style.display = "block";
                        btnBaixar.onclick = function() {
                            // Converte o texto SVG para um ficheiro transferível
                            const blob = new Blob([svgText], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'exemplo.svg'; // Nome exigido na atividade
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        };
                    }
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
                resultadoDiv.innerHTML = "<p style='color: red;'>Erro ao conectar com o servidor. Verifique a consola.</p>";
                console.error("Erro na requisição:", error);
            }
        });
    }
});