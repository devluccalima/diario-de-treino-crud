import { useState, useEffect, useCallback } from 'react';
import './App.css';
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
  const [detalhesRotina, setDetalhesRotina] = useState(null);
  const [exercicioParaDeletar, setExercicioParaDeletar] = useState(null);
  const [exercicioParaEditar, setExercicioParaEditar] = useState(null);

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
      peso: '' || 0 // Começa vazio para o usuário preencher
    });
  };


  const handleAddExercicioSubmit = (e) => {
    e.preventDefault();
    const dadosParaEnviar = {
      nome: exercicioParaAdd.nome,
      series: exercicioParaAdd.series,
      repeticoes: exercicioParaAdd.repeticoes,
      peso: exercicioParaAdd.peso || 0, // Pega o peso do estado
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
        fetchDetalhesDaRotina(rotinaSelecionada.id); // Atualiza os detalhes da rotina
      })
      .catch(error => console.error("Erro ao adicionar exercício:", error));
  };

  const fetchDetalhesDaRotina = useCallback(async (rotinaId) => {
    try {
      const response = await fetch(`${backendUrl}/api/rotinas/${rotinaId}/exercicios`);
      if (!response.ok) {
        throw new Error("Erro ao buscar os detalhes da rotina");
      }
      const data = await response.json();
      setDetalhesRotina(data); // aqui salva no estado
    } catch (error) {
      console.error("Erro:", error);
    }
  }, []);

  useEffect(() => {
    if (rotinaSelecionada) {
      fetchDetalhesDaRotina(rotinaSelecionada.id);
    }
  }, [rotinaSelecionada, fetchDetalhesDaRotina]);


  const handleConfirmDelete = () => {
    if (!exercicioParaDeletar) return;

    fetch(`${backendUrl}/api/exercicios/${exercicioParaDeletar.id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
        // Atualiza a lista de exercícios no ecrã, removendo o que foi excluído
        setDetalhesRotina(detalhesRotina.filter(ex => ex.id !== exercicioParaDeletar.id));
        setExercicioParaDeletar(null); // Fecha a modal
      })
      .catch(error => console.error("Erro ao excluir exercício:", error));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!exercicioParaEditar) return;

    // Apenas os campos que podem ser editados
    const dadosParaEnviar = {
      series: exercicioParaEditar.series,
      repeticoes: exercicioParaEditar.repeticoes,
      peso: exercicioParaEditar.peso,
    };

    fetch(`${backendUrl}/api/exercicios/${exercicioParaEditar.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosParaEnviar)
    })
      .then(res => res.json())
      .then(exercicioAtualizado => {
        // Atualiza a lista no ecrã com os novos dados do exercício
        setDetalhesRotina(detalhesRotina.map(ex =>
          ex.id === exercicioAtualizado.id ? exercicioAtualizado : ex
        ));
        setExercicioParaEditar(null); // Fecha a modal
      })
      .catch(error => console.error("Erro ao editar exercício:", error));
  };

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">A carregar rotinas...</p>
      </div>
    );
  }

  // NOVIDADE: Se uma rotina estiver selecionada, mostramos a "página" de detalhes

  if (rotinaSelecionada) {
    return (
      <div className="container">
        <div className="header-section">
          <button onClick={() => setRotinaSelecionada(null)} className="btn btn--secondary btn-voltar">
            <BsArrow90DegUp className="icon-back" />
            Voltar para todas as rotinas
          </button>
          <div className="routine-header">
            <h1 className="routine-title">{rotinaSelecionada.nome}</h1>
            <p className="routine-day">{rotinaSelecionada.dia_da_semana}</p>
          </div>
        </div>

        <div className="content-grid">
          <div className="exercises-section">
            <h2 className="section-title">Exercícios da Rotina</h2>
            {detalhesRotina && detalhesRotina.length > 0 ? (
              <div className="exercises-list">
                {detalhesRotina.map(exercicio => (
                  <div key={exercicio.id} className="exercise-card">
                    <div className="exercise-info">
                      <h3 className="exercise-name">{exercicio.nome_exercicio}</h3>
                      <div className="exercise-details">
                        <span className="detail-item">
                          <strong>Séries:</strong> {exercicio.series}
                        </span>
                        <span className="detail-item">
                          <strong>Repetições:</strong> {exercicio.repeticoes}
                        </span>
                        <span className="detail-item">
                          <strong>Peso:</strong> {exercicio.peso} kg
                        </span>
                      </div>
                    </div>
                    <div className="exercise-actions">
                      <button onClick={() => setExercicioParaEditar(exercicio)} className="btn btn--secondary btn-edit">
                        Editar
                      </button>
                      <button onClick={() => setExercicioParaDeletar(exercicio)} className="btn btn--danger btn-delete">
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Nenhum exercício adicionado à rotina.</p>
                <p className="empty-subtitle">Comece adicionando exercícios usando a busca abaixo.</p>
              </div>
            )}
          </div>

          <div className="add-exercise-section">
            <h2 className="section-title">Adicionar Exercício</h2>
            <form onSubmit={handleBuscaSubmit} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Digite para buscar um exercício..."
                  className="search-input"
                />
                <button type="submit" className="btn btn--primary search-btn">
                  Buscar
                </button>
              </div>
            </form>

            {resultadosBusca.length > 0 && (
              <div className="search-results">
                <h3 className="results-title">Resultados da Busca</h3>
                <div className="results-list">
                  {resultadosBusca.map(item => (
                    <div key={item.data.id} className="result-item">
                      <span className="result-name">{item.value}</span>
                      <button 
                        className="btn btn--primary add-exercise-btn" 
                        onClick={() => handleAddClick(item)}
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal para adicionar exercício */}
        {exercicioParaAdd && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Adicionar Exercício</h3>
              <p className="modal-subtitle">{exercicioParaAdd.nome}</p>
              <form onSubmit={handleAddExercicioSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Séries</label>
                    <input
                      type="number"
                      value={exercicioParaAdd.series}
                      onChange={(e) => setExercicioParaAdd({ ...exercicioParaAdd, series: e.target.value })}
                      placeholder="Ex: 3"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Repetições</label>
                    <input
                      type="number"
                      value={exercicioParaAdd.repeticoes}
                      onChange={(e) => setExercicioParaAdd({ ...exercicioParaAdd, repeticoes: e.target.value })}
                      placeholder="Ex: 12"
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      value={exercicioParaAdd.peso}
                      onChange={(e) => setExercicioParaAdd({ ...exercicioParaAdd, peso: e.target.value })}
                      placeholder="Ex: 20"
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn--primary">
                    Adicionar Exercício
                  </button>
                  <button type="button" className="btn btn--secondary" onClick={() => setExercicioParaAdd(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMAÇÃO PARA EXCLUIR */}
        {exercicioParaDeletar && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Confirmar Exclusão</h3>
              <p className="modal-text">
                Tem a certeza que quer excluir o exercício <strong>"{exercicioParaDeletar.nome_exercicio}"</strong>?
              </p>
              <div className="modal-actions">
                <button onClick={handleConfirmDelete} className="btn btn--danger">
                  Sim, Excluir
                </button>
                <button onClick={() => setExercicioParaDeletar(null)} className="btn btn--secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA EDITAR EXERCÍCIO */}
        {exercicioParaEditar && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Editar Exercício</h3>
              <p className="modal-subtitle">{exercicioParaEditar.nome_exercicio}</p>
              <form onSubmit={handleUpdateSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Séries</label>
                    <input
                      type="number"
                      value={exercicioParaEditar.series}
                      onChange={(e) => setExercicioParaEditar({ ...exercicioParaEditar, series: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Repetições</label>
                    <input
                      type="number"
                      value={exercicioParaEditar.repeticoes}
                      onChange={(e) => setExercicioParaEditar({ ...exercicioParaEditar, repeticoes: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      value={exercicioParaEditar.peso}
                      onChange={(e) => setExercicioParaEditar({ ...exercicioParaEditar, peso: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn--primary">
                    Salvar Alterações
                  </button>
                  <button type="button" onClick={() => setExercicioParaEditar(null)} className="btn btn--secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Se NENHUMA rotina estiver selecionada, mostramos a página principal de sempre
  return (
    <div className="container">
      <div className="header-section">
        <h1 className="main-title">Minhas Rotinas</h1>
        <p className="main-subtitle">Gerencie suas rotinas de exercícios</p>
      </div>

      <div className="main-grid">
        <div className="routines-section">
          {rotinas.length > 0 ? (
            <div className="routines-list">
              {rotinas.map(rotina => (
                <div 
                  key={rotina.id} 
                  onClick={() => setRotinaSelecionada(rotina)} 
                  className="routine-card"
                >
                  <div className="routine-card-content">
                    <h3 className="routine-card-title">{rotina.nome}</h3>
                    <p className="routine-card-day">{rotina.dia_da_semana}</p>
                  </div>
                  <div className="routine-card-arrow">→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhuma rotina criada ainda.</p>
              <p className="empty-subtitle">Crie sua primeira rotina usando o formulário ao lado.</p>
            </div>
          )}
        </div>

        <div className="create-routine-section">
          <h2 className="section-title">Criar Nova Rotina</h2>
          <form onSubmit={handleAddRotina} className="create-form">
            <div className="form-group">
              <label htmlFor="nomeRotina">Nome da Rotina</label>
              <input
                id="nomeRotina"
                type="text"
                value={nomeRotina}
                onChange={(e) => setNomeRotina(e.target.value)}
                placeholder="Ex: Treino A, Peito e Tríceps..."
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="diaSemana">Dia da Semana</label>
              <input
                id="diaSemana"
                type="text"
                value={diaSemana}
                onChange={(e) => setDiaSemana(e.target.value)}
                placeholder="Ex: Segunda-feira, Terça..."
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="btn btn--primary btn-create">
              Criar Rotina
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Rotinas;
