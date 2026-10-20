/* =====================================================================
   data.js | DADOS DOS PROJETOS
   Para adicionar um projeto, basta incluir um novo objeto no array.
   O carrossel 3D ajusta sozinho o raio e o ângulo conforme a quantidade.

   Campos:
     id          identificador único (string)
     icon        monograma exibido no card (1 a 2 letras)
     status      selo do card (ex.: "API", "Em grupo", "Em breve")
     title       nome do projeto
     subtitle    linha curta abaixo do título
     summary     resumo exibido no card
     description texto longo exibido no painel de detalhes
     highlights  lista de destaques (painel de detalhes)
     tags        tecnologias
     links       [{ label, url }]  (deixe [] se ainda não houver links)
   ===================================================================== */
(function (global) {
  'use strict';

  const projects = [
    {
      id: 'task-diet',
      icon: 'TD',
      status: 'API',
      title: 'Task Diet',
      subtitle: 'API de receitas com filtros alimentares',
      summary:
        'API de receitas que permite filtrar pratos por restrição alimentar, ajudando quem precisa seguir uma dieta específica a encontrar opções adequadas.',
      description:
        'O Task Diet é uma API de receitas com filtros por restrição alimentar. O objetivo é facilitar a busca por pratos compatíveis com a necessidade de cada pessoa, expondo endpoints REST simples de consumir por qualquer interface.',
      highlights: [
        'Filtros por restrição alimentar (ex.: vegetariano, sem glúten, sem lactose)',
        'API REST construída com FastAPI e documentação automática (OpenAPI/Swagger)',
        'Persistência de dados em SQLite',
        'Front-end em JavaScript consumindo a API',
      ],
      tags: ['FastAPI', 'SQLite', 'JavaScript', 'REST'],
      links: [
        { label: 'Código no GitHub', url: 'https://github.com/seu-usuario/task-diet' },
      ],
    },
    {
      id: 'bot-vacinacao',
      icon: 'BV',
      status: 'Em grupo',
      title: 'Bot de Vacinação',
      subtitle: 'Bot/API de agendamento e notificações',
      summary:
        'Bot/API desenvolvido em grupo na FATEC, com lógica de agendamento de vacinação e envio de notificações aos usuários.',
      description:
        'Projeto desenvolvido em equipe durante o curso na FATEC. O bot/API organiza o agendamento de vacinação e dispara notificações para manter os usuários informados, exigindo boa divisão de tarefas e integração entre as partes do sistema.',
      highlights: [
        'Lógica de agendamento de vacinação',
        'Notificações para os usuários',
        'Desenvolvimento colaborativo em grupo (Git/GitHub)',
        'Projeto acadêmico aplicado a um problema real',
      ],
      tags: ['Python', 'Bot', 'API', 'Agendamento', 'Trabalho em equipe'],
      links: [
        { label: 'Código no GitHub', url: 'https://github.com/seu-usuario/bot-vacinacao' },
      ],
    },
    {
      /* Card reservado: remova ou substitua quando tiver o próximo projeto. */
      id: 'em-breve',
      icon: '+',
      status: 'Em breve',
      title: 'Próximo projeto',
      subtitle: 'Espaço reservado',
      summary:
        'Este card mantém o anel do carrossel equilibrado. Substitua pelo seu próximo projeto editando o arquivo data.js.',
      description:
        'Aqui entra o seu próximo projeto. Basta editar este objeto em data.js (ou removê-lo). O carrossel se reorganiza automaticamente.',
      highlights: ['Edite título, descrição e tags', 'Adicione links do GitHub ou demo', 'Inclua quantos projetos quiser'],
      tags: ['Go', 'React', 'SQL'],
      links: [],
    },
  ];

  global.PortfolioData = { projects };
})(window);