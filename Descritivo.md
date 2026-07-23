Descritivo funcional do sistema

O sistema será uma plataforma de apoio ao processo de Quality Assurance, conectada futuramente aos repositórios dos projetos. Seu objetivo será analisar alterações no código, identificar riscos, sugerir testes, organizar planos de validação e auxiliar o time na decisão de liberar ou bloquear uma versão.

1. Dashboard de qualidade

Visão geral da situação atual dos projetos.

Deverá apresentar:

Score geral de risco;
Cobertura de testes;
Pull requests em análise;
Testes sugeridos;
Problemas críticos encontrados;
Releases aguardando validação;
Evolução da qualidade;
Alertas e recomendações da IA;
Módulos mais impactados;
Atividades recentes.
2. Gestão de projetos e repositórios

Módulo responsável por organizar os projetos monitorados pela plataforma.

Deverá permitir:

Cadastrar projetos;
Vincular repositórios;
Selecionar branch principal;
Visualizar linguagens e tecnologias utilizadas;
Identificar framework de testes;
Definir módulos críticos;
Configurar regras de qualidade por projeto;
Selecionar quais branches e pull requests serão analisados;
Visualizar o status de sincronização.

Inicialmente, essas informações podem ser simuladas no frontend.

3. Análise de pull requests

Módulo central para análise das alterações realizadas no projeto.

Cada pull request deverá apresentar:

Número e título;
Autor;
Branch de origem e destino;
Arquivos alterados;
Linhas adicionadas e removidas;
Módulos impactados;
Dependências afetadas;
Cobertura atual;
Testes relacionados;
Score de risco;
Nível de criticidade;
Recomendação da IA;
Histórico das análises.

O sistema deverá indicar claramente:

O que foi alterado;
Quais partes do sistema podem ser afetadas;
O que precisa ser testado;
Quais riscos foram identificados;
Se a alteração está segura para avançar.
4. Análise de risco

Módulo responsável por calcular e explicar o risco de cada alteração.

O risco poderá considerar:

Quantidade de arquivos alterados;
Complexidade da mudança;
Cobertura de testes;
Alterações em módulos críticos;
Histórico de bugs;
Dependências atualizadas;
Mudanças em autenticação ou permissões;
Alterações em banco de dados;
Testes instáveis;
Falhas anteriores no mesmo módulo.

Deverá apresentar:

Score de 0 a 100;
Classificação em baixo, médio ou alto;
Principais fatores de risco;
Evolução do risco;
Comparação com alterações anteriores;
Recomendação de ações para reduzir o risco.
5. Análise de impacto

Módulo destinado a identificar quais partes do sistema podem ser afetadas por uma alteração.

Deverá mostrar:

Serviços impactados;
Componentes afetados;
Endpoints relacionados;
Telas relacionadas;
Tabelas ou entidades envolvidas;
Dependências diretas e indiretas;
Fluxos de negócio afetados;
Testes que precisam ser executados novamente;
Possíveis pontos de regressão.

O objetivo é ajudar o QA a entender rapidamente o alcance de uma mudança.

6. Planos de testes

Módulo para criação e organização dos planos de validação.

Cada plano deverá conter:

Objetivo;
Escopo;
Funcionalidades impactadas;
Pré-condições;
Massa de dados necessária;
Critérios de aceite;
Cenários positivos;
Cenários negativos;
Casos de borda;
Testes de regressão;
Testes manuais;
Testes automatizados;
Responsáveis;
Prioridades;
Status de execução.

O plano poderá ser criado manualmente ou sugerido pela IA com base no pull request.

7. Casos de testes

Biblioteca centralizada de casos de testes do projeto.

Cada caso deverá possuir:

Nome;
Descrição;
Funcionalidade relacionada;
Pré-condições;
Passos;
Resultado esperado;
Tipo de teste;
Prioridade;
Criticidade;
Status;
Responsável;
Evidências;
Data da última execução;
Pull requests relacionados;
Requisitos relacionados.

Tipos de testes:

Unitário;
Integração;
API;
E2E;
Regressão;
Exploratório;
Segurança;
Performance;
Manual.
8. Testes sugeridos pela IA

Módulo onde o sistema apresenta testes recomendados para uma alteração.

Cada sugestão deverá mostrar:

Nome do teste;
Motivo da sugestão;
Arquivo ou módulo relacionado;
Tipo de teste;
Prioridade;
Impacto;
Confiança da IA;
Tempo estimado;
Cenário coberto;
Exemplo de implementação;
Status da sugestão.

O usuário poderá:

Aceitar a sugestão;
Rejeitar;
Editar;
Adicionar ao plano de testes;
Marcar para automação;
Solicitar uma nova versão.
9. Geração de testes automatizados

Módulo responsável por gerar propostas de código para testes.

Poderá contemplar:

Testes unitários;
Testes de integração;
Testes de API;
Testes E2E;
Testes de contrato;
Testes de componentes.

O sistema deverá apresentar:

Código sugerido;
Framework utilizado;
Arquivo de destino;
Dependências necessárias;
Explicação do cenário;
Confiança da geração;
Possíveis limitações;
Alterações propostas.

A geração não deverá ser enviada diretamente ao repositório sem revisão humana.

10. Execuções de testes

Módulo para acompanhamento das execuções.

Deverá apresentar:

Testes executados;
Testes aprovados;
Testes reprovados;
Testes ignorados;
Tempo de execução;
Ambiente utilizado;
Responsável;
Data e horário;
Logs;
Erros encontrados;
Evidências;
Histórico de execuções.

Status possíveis:

Não iniciado;
Aguardando;
Executando;
Aprovado;
Reprovado;
Bloqueado;
Ignorado.
11. Cobertura de testes

Módulo para visualizar o nível de proteção de cada parte do sistema.

Deverá apresentar:

Cobertura geral;
Cobertura por módulo;
Cobertura por serviço;
Cobertura por arquivo;
Funcionalidades sem testes;
Cenários parcialmente cobertos;
Lacunas críticas;
Evolução da cobertura;
Cobertura antes e depois de cada pull request;
Testes relacionados a cada funcionalidade.

O sistema deverá destacar áreas críticas com baixa cobertura.

12. Testes instáveis

Módulo para identificar testes que falham de forma inconsistente.

Deverá mostrar:

Nome do teste;
Quantidade de falhas;
Taxa de instabilidade;
Últimas execuções;
Tempo médio;
Ambiente;
Possível causa;
Módulo relacionado;
Impacto no pipeline.

A IA poderá sugerir se a falha está relacionada ao produto, ambiente ou próprio teste.

13. Gestão de defeitos

Módulo para registrar problemas encontrados durante as validações.

Cada defeito deverá conter:

Título;
Descrição;
Severidade;
Prioridade;
Ambiente;
Passos para reprodução;
Resultado esperado;
Resultado obtido;
Evidências;
Pull request relacionado;
Teste que identificou o problema;
Responsável;
Status.

Status possíveis:

Aberto;
Em análise;
Em correção;
Pronto para reteste;
Resolvido;
Reaberto;
Cancelado.
14. Releases

Módulo para acompanhamento e validação das versões do sistema.

Cada release deverá apresentar:

Nome e versão;
Data prevista;
Pull requests incluídos;
Funcionalidades entregues;
Score de risco;
Cobertura;
Resultado dos testes;
Defeitos em aberto;
Quality gates;
Recomendação da IA;
Aprovações necessárias;
Histórico de decisões.

A plataforma deverá indicar:

Pronta para produção;
Requer revisão;
Bloqueada;
Aprovada com ressalvas.
15. Quality gates

Módulo para criação das regras mínimas de qualidade.

Exemplos:

Nenhum problema crítico;
Cobertura mínima de 80%;
Todos os testes obrigatórios aprovados;
Nenhum pull request de alto risco;
Aprovação obrigatória de um QA;
Testes de regressão concluídos;
Nenhum teste instável crítico;
Plano de testes aprovado.

As regras poderão variar de acordo com o projeto, módulo ou tipo de release.

16. Recomendação de liberação

Módulo que consolida as informações e apresenta uma recomendação final.

Deverá considerar:

Risco;
Cobertura;
Resultados dos testes;
Defeitos abertos;
Criticidade dos módulos;
Quality gates;
Histórico de incidentes;
Confiança da análise.

Possíveis recomendações:

Aprovar release;
Aprovar com ressalvas;
Solicitar testes adicionais;
Corrigir problemas antes da liberação;
Bloquear release.

A recomendação deverá sempre apresentar a justificativa.

17. Documentação e evidências

Módulo responsável por centralizar documentos e comprovações dos testes.

Poderá gerar ou organizar:

Plano de testes;
Relatório de execução;
Checklist de validação;
Evidências;
Resumo da análise do pull request;
Relatório de cobertura;
Relatório de riscos;
Relatório da release;
Histórico de aprovações;
Registro das decisões.

As evidências poderão incluir:

Imagens;
Vídeos;
Logs;
Requests e responses;
Arquivos;
Observações do QA.
18. Rastreabilidade

Módulo para relacionar todos os elementos do processo de qualidade.

Deverá permitir visualizar relações entre:

Requisito;
História;
Pull request;
Arquivo alterado;
Caso de teste;
Teste automatizado;
Execução;
Defeito;
Evidência;
Release.

Isso permitirá responder perguntas como:

Qual teste valida esta funcionalidade?
Qual requisito originou este teste?
Qual alteração causou este defeito?
Quais funcionalidades estão sem cobertura?
Quais testes protegem esta release?
19. Relatórios e indicadores

Módulo para acompanhamento da evolução da qualidade.

Indicadores possíveis:

Quantidade de bugs por projeto;
Bugs por módulo;
Bugs por release;
Taxa de aprovação;
Cobertura média;
Tempo médio de validação;
Testes automatizados versus manuais;
Taxa de retrabalho;
Testes instáveis;
Risco médio dos pull requests;
Releases bloqueadas;
Bugs encontrados antes e depois da produção;
Tendência da qualidade ao longo do tempo.
20. Notificações

Módulo para avisar os usuários sobre eventos importantes.

Exemplos:

Novo pull request de alto risco;
Teste reprovado;
Plano de testes aguardando aprovação;
Problema crítico encontrado;
Cobertura reduzida;
Release bloqueada;
Quality gate não atendido;
Nova sugestão da IA;
Teste instável identificado.
21. Integrações

Área para gerenciar futuras conexões com ferramentas externas.

Integrações previstas:

GitHub;
GitLab;
Bitbucket;
Jira;
Azure DevOps;
Slack;
Microsoft Teams;
Qase;
TestRail;
Xray;
Pipelines CI/CD.

Inicialmente, o frontend poderá mostrar apenas os cards e os estados das integrações.

22. Configurações e governança

Módulo para personalização e controle da plataforma.

Deverá conter:

Usuários;
Perfis de acesso;
Projetos;
Repositórios;
Regras de qualidade;
Critérios de risco;
Frameworks de testes;
Preferências de notificações;
Integrações;
Tema claro e escuro;
Histórico de alterações;
Auditoria.

Perfis sugeridos:

Administrador;
Líder de QA;
Analista de QA;
Desenvolvedor;
Product Owner;
Gestor;
Visualizador.
Estrutura recomendada para o MVP

Para a primeira versão, os módulos prioritários seriam:

Dashboard;
Projetos e repositórios;
Pull requests;
Análise de risco;
Análise de impacto;
Planos de testes;
Testes sugeridos;
Cobertura;
Releases;
Quality gates;
Recomendação de liberação;
Configurações.

Essa estrutura já permite demonstrar o principal diferencial do sistema: transformar alterações no código em riscos, planos de testes e decisões de qualidade rastreáveis.