import { useState, useEffect, useCallback } from 'react';
// Importe o FontAwesome se o estiver a usar
import { BsArrow90DegUp } from "react-icons/bs";

function Rotinas() {
  // --- ESTADOS ---
  const [rotinas, setRotinas] = useState([]);
  const [nomeRotina, setNomeRotina] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [loading, setLoading] = useState(true);
  const [rotinaSelecionada, setRotinaSelecionada] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [exercicioParaAdd, setExercicioParaAdd] = useState(null);


  // --- LÓGICA (HANDLERS) ---

  // Pega na URL do back-end do nosso ficheiro .env
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const fetchRotinas = useCallback(() => {
    fetch(`${backendUrl}/api/rotinas`)
      .then(res => res.json())
      .then(data => {
        setRotinas(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar rotinas:", error);
        setLoading(false);
      });
  }, [backendUrl]);

  useEffect(() => {
    fetchRotinas();
  }, [fetchRotinas]);

  const handleAddRotina = (e) => {
    e.preventDefault();
    const novaRotina = { nome: nomeRotina, dia_da_semana: diaSemana };

    fetch(`${backendUrl}/api/rotinas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaRotina)
    })
      .then(() => {
        setNomeRotina('');
        setDiaSemana('');
        fetchRotinas();
      });
  };

  const handleBuscaSubmit = (e) => {
    e.preventDefault();
    if (!termoBusca) return;
    const apiUrl = `https://wger.de/api/v2/exercise/search/?term=${termoBusca}&language=7`;
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        console.log("Exercicios encontrados:", data);
        setResultadosBusca(data.suggestions || []);
      })
      .catch(error => console.error("Erro na busca:", error));
  };

  const handleAddClick = (item) => {
    // 'item' é o objeto que vem da busca da WGER
    // Guardamos os dados essenciais e preparamos os campos para o usuário
    setExercicioParaAdd({
      uuid: item.data.uuid,
      nome: item.value,
      series: '', // Começa vazio para o usuário preencher
      repeticoes: '',
      peso: ''
    });
  };


  const handleAddExercicioSubmit = (e) => {
    e.preventDefault();
    const dadosParaEnviar = {
      uuid: exercicioParaAdd.uuid,
      nome: exercicioParaAdd.nome,
      series: parseInt(exercicioParaAdd.series),
      repeticoes: parseInt(exercicioParaAdd.repeticoes),
      peso: parseFloat(exercicioParaAdd.peso)
    };
    fetch(`${backendUrl}/api/rotinas/${rotinaSelecionada.id}/exercicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaEnviar)
    })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
        setExercicioParaAdd(null); // Fecha a modal
        // No futuro, aqui vamos também atualizar a lista de exercícios da rotina na tela.
      })
      .catch(error => console.error("Erro ao adicionar exercício:", error));
  };

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return <p>A carregar rotinas...</p>;
  }

  // NOVIDADE: Se uma rotina estiver selecionada, mostramos a "página" de detalhes
  if (rotinaSelecionada) {
    return (
      <div>
        <button onClick={() => setRotinaSelecionada(null)} className="btn--secondary btn-voltar" style={{ marginBottom: '24px', width: 'auto', fontSize: '16px', verticalAlign: 'middle', cursor: 'pointer' }}>
          <BsArrow90DegUp style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Voltar para todas as rotinas
        </button>
        <h2>{rotinaSelecionada.nome}</h2>
        <p>Dia da semana: {rotinaSelecionada.dia_da_semana}</p>
        <hr />
        <h3>Adicionar Exercício à Rotina</h3>
        <form onSubmit={handleBuscaSubmit}>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Digite para buscar um exercício..."
          />
          <button type="submit">Buscar</button>
        </form>
        {/* Lista de Resultados da Busca */}
        <ul>
          {resultadosBusca.map(item => (
            <li key={item.data.id}>
              <span>{item.value}</span>
              <button className="btn btn--primary" style={{ padding: '4px 10px' }} onClick={() => handleAddClick(item)}>
                +
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Se NENHUMA rotina estiver selecionada, mostramos a página principal de sempre
  return (
    <div>
      <h2>Minhas Rotinas</h2>
      <form onSubmit={handleAddRotina}>
        <input
          type="text"
          value={nomeRotina}
          onChange={(e) => setNomeRotina(e.target.value)}
          placeholder="Nome da Rotina (ex: Treino A)"
          required
        />
        <input
          type="text"
          value={diaSemana}
          onChange={(e) => setDiaSemana(e.target.value)}
          placeholder="Dia da Semana (ex: Segunda)"
          required
        />
        <button type="submit" className='btn-add'>Criar Rotina</button>
      </form>
      <hr />
      <ul>
        {rotinas.map(rotina => (
          // Adicionamos o onClick e um pouco de estilo para o cursor mudar
          <li key={rotina.id} onClick={() => setRotinaSelecionada(rotina)} style={{ cursor: 'pointer', padding: '8px' }}>
            <strong>{rotina.nome}</strong> - {rotina.dia_da_semana}
          </li>
        ))}
      </ul>
      {/* Modal de Sucesso (se já tiver uma) */}
      
      {/* Modal de Confirmação de Exclusão */}
      
    </div>
  );
}

export default Rotinas;